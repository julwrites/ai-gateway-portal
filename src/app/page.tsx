'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/lib/config-context';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const { isConfigured, apiBaseUrl, apiKey } = useConfig();
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState([]);
  const [groupBy, setGroupBy] = useState({ value: 'team', label: 'Team' });
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [models, setModels] = useState([]);

  const groupByOptions = [
    { value: 'team', label: 'Team' },
    { value: 'customer', label: 'Customer' },
    { value: 'api_key', label: 'API Key' },
  ];

  // Redirect to config page if not configured
  useEffect(() => {
    if (!isConfigured) {
      router.push('/config');
    }
  }, [isConfigured, router]);

  useEffect(() => {
    // Only fetch data if configured
    if (isConfigured) {
      fetchUsers();
      fetchTeams();
      fetchApiKeys();
      fetchModels();
    }
  }, [isConfigured]);

  const fetchUsers = async () => {
    // Pass configuration in headers
    const response = await fetch('/api/users/list', {
      headers: {
        'X-API-Base-URL': apiBaseUrl,
        'X-API-Key': apiKey
      }
    });
    const data = await response.json();
    setUsers(data.users.map((user: any) => ({ value: user.user_id, label: user.user_email || user.user_id })));
  };

  const fetchTeams = async () => {
    // Pass configuration in headers
    const response = await fetch('/api/teams/list', {
      headers: {
        'X-API-Base-URL': apiBaseUrl,
        'X-API-Key': apiKey
      }
    });
    const data = await response.json();
    setTeams(data.map((team: any) => ({ value: team.team_id, label: team.team_alias || team.team_id })));
  };

  const fetchApiKeys = async () => {
    // Pass configuration in headers
    const response = await fetch('/api/keys/list', {
      headers: {
        'X-API-Base-URL': apiBaseUrl,
        'X-API-Key': apiKey
      }
    });
    const data = await response.json();
    setApiKeys(data.keys.map((key: any) => ({ value: key.id, label: key.key_alias || key.id })));
  };

  const fetchModels = async () => {
    // Pass configuration in headers
    const response = await fetch('/api/models/list', {
      headers: {
        'X-API-Base-URL': apiBaseUrl,
        'X-API-Key': apiKey
      }
    });
    const data = await response.json();
    setModels(data.data.map((model: any) => ({ value: model.model_id, label: model.display_name })));
  };

  const resetConfiguration = () => {
    console.log('Manually resetting configuration');
    
    // Clear localStorage
    localStorage.removeItem('apiBaseUrl');
    localStorage.removeItem('apiKey');
    localStorage.clear();
    
    // Clear cookies
    document.cookie = 'config-set=; Max-Age=0; path=/;';
    
    // Force reload to apply changes
    window.location.href = '/config';
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={resetConfiguration}
            className="text-sm"
          >
            Reset Configuration
          </Button>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Teams" count={teams.length} link="/teams" />
          <DashboardCard title="Users" count={users.length} link="/users" />
          <DashboardCard title="API Keys" count={apiKeys.length} link="/keys" />
          <DashboardCard title="Models" count={models.length} link="/models" />
        </div>
      </div>
    </div>
  )
}

interface DashboardCardProps {
  title: string;
  count: number;
  link: string;
}

function DashboardCard({ title, count, link }: DashboardCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <p className="mt-1 text-3xl font-semibold text-gray-700">{count}</p>
        <div className="mt-4">
          <a 
            href={link}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View {title}
          </a>
        </div>
      </div>
    </div>
  );
}
