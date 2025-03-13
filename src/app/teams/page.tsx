'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TeamList } from './components/TeamList';
import { TeamForm } from './components/TeamForm';
import { Team, TeamFormData } from '@/types/teams';

type SelectedTeam = {
  value: string;
  label: string;
};

export default function TeamsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTeam, setEditTeam] = useState<Team | null>(null);

  // Dashboard state
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedTeams, setSelectedTeams] = useState<SelectedTeam[]>([]);
  const [spendReport, setSpendReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      
      const data = await response.json();
      const teamsData = Array.isArray(data) ? data : [];
      setTeams(teamsData);  // This now includes the spend data
      setError(null);

      // Set all teams as selected by default
      let selectedTeams = teamsData.map((team: any) => {return { value: team.team_id, label: team.team_alias || team.team_id }})
      setSelectedTeams(selectedTeams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teams';
      console.error('Error in fetchTeams:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      console.log('Sending team data:', data);  // Log the data being sent
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);  // Log the error response
        throw new Error(errorData.error?.message || 'Failed to create team');
      }
  
      const newTeam = await response.json();
      console.log('New team created:', newTeam);  // Log the new team data
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
        method: 'POST',
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
  
      // Refetch all teams
      const teamsResponse = await fetch('/api/teams/list');
      if (!teamsResponse.ok) {
        throw new Error('Failed to fetch updated teams list');
      }
      const updatedTeams = await teamsResponse.json();
      setTeams(Array.isArray(updatedTeams) ? updatedTeams : []);
  
      setShowCreateForm(false);
      setEditTeam(null);
      setError(null);
    } catch (err) {
      console.error('Error in handleEditTeam:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update team';
      setError(errorMessage);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const response = await fetch('/api/teams/delete', {
        method: 'POST',  // Changed from 'DELETE' to 'POST'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team_ids: [teamId] }),  // Changed from team_id to team_ids
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
    console.log('Starting edit for team:', team);
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
        <h2 className="text-2xl font-bold">Teams Management</h2>
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
          teams={teams}  // This now includes the spend data
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