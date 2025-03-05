'use client';

import { useState } from 'react';
import { TeamList } from './components/TeamList';
import { TeamForm } from './components/TeamForm';
import { Team, TeamFormData } from '@/types/teams';

export default function TeamsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  const handleCreateTeam = async (data: TeamFormData) => {
    // TODO: Implement team creation
    console.log('Creating team:', data);
    setShowCreateForm(false);
  };

  const handleEditTeam = (team: Team) => {
    // TODO: Implement team editing
    console.log('Editing team:', team);
  };

  const handleDeleteTeam = (teamId: string) => {
    // TODO: Implement team deletion
    console.log('Deleting team:', teamId);
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
      
      <TeamList 
        teams={teams} 
        onEdit={handleEditTeam} 
        onDelete={handleDeleteTeam} 
      />
      
      {showCreateForm && (
        <TeamForm 
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateTeam}
        />
      )}
    </div>
  );
}
