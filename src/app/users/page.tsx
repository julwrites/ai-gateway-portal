'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserRequest, UserResponse } from '@/types/users';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';
import { isValidDuration } from '@/lib/validators';
import { api } from '@/lib/tauri-api';

export default function UsersPage() {
  const { apiBaseUrl, apiKey, isConfigured } = useConfig();
  const [showUserForm, setShowUserForm] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch users
    fetchUsers();
  }, [apiBaseUrl, apiKey]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.users.list();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('Error in fetchUsers:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, apiKey]);

  const handleCreateUser = async (data: UserRequest) => {
    try {
      await api.users.create(data);
      await fetchUsers();
      setShowUserForm(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      console.error('Error in handleCreateUser:', errorMessage);
      setError(errorMessage);
    }
  };
  
  const handleEditUser = async (user: UserRequest) => {
    try {
      // Validate budget_duration
      if (user.budget_duration && !isValidDuration(user.budget_duration)) {
        throw new Error('Invalid budget duration format. Use formats like "30s", "30m", "30h", "30d", or "1mo".');
      }

      await api.users.update(user);
      
      // Refresh the entire user list
      await fetchUsers();
      setShowUserForm(false);
      setEditingUser(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      console.error('Error in handleEditUser:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.users.delete([userId]);
      
      // Update local state to remove the deleted user
      setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      console.error('Error in handleDeleteUser:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <button 
          onClick={() => {
            setEditingUser(null);
            setShowUserForm(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create User
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <UserList 
          users={users} 
          onEdit={(user) => {
            setEditingUser(user);
            setShowUserForm(true);
          }} 
          onDelete={handleDeleteUser} 
        />
      )}
      
      {showUserForm && (
        <UserForm 
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
          onSubmit={editingUser ? handleEditUser : handleCreateUser}
          initialData={editingUser || undefined}
          isEdit={!!editingUser}
        />
      )}
    </div>
  );
}
