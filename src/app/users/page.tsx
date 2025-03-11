'use client';

import { useState, useEffect } from 'react';
import { User, UserFormData } from '@/types/users';
import { getHeaders, getApiUrl } from '@/lib/config';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';

export default function UsersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/list');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users || []);
        // You can also set pagination info if needed
        // setPagination({ total: data.total, page: data.page, ... });
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
        console.error('Error in fetchUsers:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateUser = async (data: UserFormData) => {
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const { user: newUser } = await response.json();
      setUsers(prevUsers => [...prevUsers, newUser]);
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      console.error('Error in handleCreateUser:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleEditUser = async (user: User) => {
    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const { user: updatedUser } = await response.json();
      setUsers(prevUsers => 
        prevUsers.map(u => u.user_id === updatedUser.user_id ? updatedUser : u)
      );
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      console.error('Error in handleEditUser:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

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
          onClick={() => setShowCreateForm(true)}
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
          onEdit={handleEditUser} 
          onDelete={handleDeleteUser} 
        />
      )}
      
      {showCreateForm && (
        <UserForm 
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateUser}
        />
      )}
    </div>
  );
}
