'use client';

import { useState, useEffect } from 'react';
import { TeamList } from './components/TeamList';
import { TeamForm } from './components/TeamForm';
import { Team, TeamFormData } from '@/types/teams';

export default function TeamsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTeam, setEditTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams/list');
        
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        
        const data = await response.json();
        setTeams(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teams';
        console.error('Error in fetchTeams:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }

      const { team: newTeam } = await response.json();
      setTeams(prevTeams => [...prevTeams, newTeam]);
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      console.error('Error in handleCreateTeam:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleEditTeam = async (data: TeamFormData) => {
    try {
      const response = await fetch('/api/teams/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: editTeam?.team_id,
          ...data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team');
      }

      const { team: updatedTeam } = await response.json();
      setTeams(prevTeams => 
        prevTeams.map(t => t.team_id === updatedTeam.team_id ? updatedTeam : t)
      );
      setShowCreateForm(false);
      setEditTeam(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update team';
      console.error('Error in handleEditTeam:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const response = await fetch('/api/teams/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team_id: teamId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
      }

      setTeams(prevTeams => prevTeams.filter(team => team.team_id !== teamId));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete team';
      console.error('Error in handleDeleteTeam:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleStartEdit = (team: Team) => {
    const formData: TeamFormData = {
      team_alias: team.team_alias,
      max_budget: team.max_budget,
      budget_duration: team.budget_duration,
      models: team.models,
      metadata: team.metadata,
      tpm_limit: team.tpm_limit,
      rpm_limit: team.rpm_limit,
      members_with_roles: team.members_with_roles
    };
    setEditTeam(team);
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditTeam(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams Management</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Team
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading teams...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <TeamList 
          teams={teams} 
          onEdit={handleStartEdit} 
          onDelete={handleDeleteTeam} 
        />
      )}
      
      {showCreateForm && (
        <TeamForm 
          onClose={handleCloseForm}
          onSubmit={editTeam ? handleEditTeam : handleCreateTeam}
          initialData={editTeam || undefined}
          isEdit={!!editTeam}
        />
      )}
    </div>
  );
}
