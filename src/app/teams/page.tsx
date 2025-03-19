'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TeamList } from './components/TeamList';
import { TeamForm } from './components/TeamForm';
import { Team, TeamFormData } from '@/types/teams';
import { useConfig } from '@/lib/config-context';

type SelectedTeam = {
  value: string;
  label: string;
};

export default function TeamsPage() {
  const { apiBaseUrl, apiKey, isConfigured } = useConfig();
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

  const fetchTeams = useCallback(async () => {
    try {
      // Pass configuration in headers
      const response = await fetch('/api/teams/list', {
        headers: {
          'X-API-Base-URL': apiBaseUrl,
          'X-API-Key': apiKey
        }
      });
      
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
  }, [apiBaseUrl, apiKey]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      console.log('Sending team data:', data);  // Log the data being sent
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Base-URL': apiBaseUrl,
          'X-API-Key': apiKey
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

  // Function to add a team member
  const addTeamMember = async (teamId: string, member: { user_id: string, role: string }) => {
    try {
      console.log('Adding team member:', member, 'to team:', teamId);
      const response = await fetch('/api/teams/member_add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Base-URL': apiBaseUrl,
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          team_id: teamId,
          member: member
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add team member');
      }

      return await response.json();
    } catch (err) {
      console.error('Error adding team member:', err);
      throw err;
    }
  };

  // Function to delete a team member
  const deleteTeamMember = async (teamId: string, userId: string) => {
    try {
      console.log('Deleting team member:', userId, 'from team:', teamId);
      const response = await fetch('/api/teams/member_delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Base-URL': apiBaseUrl,
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          team_id: teamId,
          user_id: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team member');
      }

      return await response.json();
    } catch (err) {
      console.error('Error deleting team member:', err);
      throw err;
    }
  };

  const handleEditTeam = async (data: TeamFormData) => {
    try {
      // Check if team_id exists in the data
      if (!data.team_id) {
        throw new Error('Team ID is required for updating a team');
      }
      
      console.log('Updating team with ID:', data.team_id);
      console.log('Full update data:', JSON.stringify(data, null, 2));
      
      // Get the current members from the editTeam state
      const currentMembers = editTeam?.members_with_roles || [];
      // Get the new members from the form data
      const newMembers = data.members_with_roles || [];
      
      console.log('Current members:', JSON.stringify(currentMembers, null, 2));
      console.log('New members:', JSON.stringify(newMembers, null, 2));
      
      // Create a copy of the data without members_with_roles for the update request
      const { members_with_roles, ...updateData } = data;
      
      // Update the team properties
      const response = await fetch('/api/teams/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Base-URL': apiBaseUrl,
          'X-API-Key': apiKey
        },
        body: JSON.stringify(updateData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team');
      }
      
      // Find members to add (in newMembers but not in currentMembers)
      const membersToAdd = newMembers.filter(newMember => 
        !currentMembers.some(currentMember => 
          currentMember.user_id === newMember.user_id
        )
      );
      
      // Find members to remove (in currentMembers but not in newMembers)
      const membersToRemove = currentMembers.filter(currentMember => 
        !newMembers.some(newMember => 
          newMember.user_id === currentMember.user_id
        )
      );
      
      // Find members whose roles have changed
      const membersToUpdate = newMembers.filter(newMember => 
        currentMembers.some(currentMember => 
          currentMember.user_id === newMember.user_id && 
          currentMember.role !== newMember.role
        )
      );
      
      console.log('Members to add:', membersToAdd);
      console.log('Members to remove:', membersToRemove);
      console.log('Members to update:', membersToUpdate);
      
      // Add new members
      for (const member of membersToAdd) {
        if (member.user_id) {
          await addTeamMember(data.team_id, {
            user_id: member.user_id,
            role: member.role
          });
        }
      }
      
      // Remove members
      for (const member of membersToRemove) {
        if (member.user_id) {
          await deleteTeamMember(data.team_id, member.user_id);
        }
      }
      
      // Update members (remove and add again with new role)
      for (const member of membersToUpdate) {
        if (member.user_id) {
          await deleteTeamMember(data.team_id, member.user_id);
          await addTeamMember(data.team_id, {
            user_id: member.user_id,
            role: member.role
          });
        }
      }
  
      // Refetch all teams
      await fetchTeams();
  
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
          'X-API-Base-URL': apiBaseUrl,
          'X-API-Key': apiKey
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
    console.log('Starting edit for team:', JSON.stringify(team, null, 2));
    const formData: TeamFormData & { team_id: string } = {
      team_id: team.team_id, // Include team_id for the form
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
          initialData={editTeam ? editTeam : undefined}
          isEdit={!!editTeam}
        />
      )}
    </div>
  );
}
