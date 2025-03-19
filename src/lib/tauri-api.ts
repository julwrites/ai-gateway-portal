import { getConfig } from './config';
import { mockUsers, mockTeams, mockKeys, mockModels, mockSpendReport } from './mock-data';

// Function to check if we're running in a Tauri environment
export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && 'tauri' in window;
}

// API wrapper that works in both Tauri and non-Tauri environments
export const api = {
  // Initialize API configuration
  async init() {
    console.log('Initializing API...');
    // No initialization needed for non-Tauri environment
  },

  // Generic request function that uses mock data for development/testing
  async request<T = any>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any,
    queryParams?: Record<string, string>
  ): Promise<T> {
    console.log(`API Request: ${method} ${path}`, { body, queryParams });
    
    // For development/testing, use mock data
    // In a production environment, this would make actual API calls
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Handle different endpoints with mock data
    if (path.includes('/users/list')) {
      return { users: mockUsers } as unknown as T;
    }
    
    if (path.includes('/users/create')) {
      console.log('Creating user:', body);
      return { success: true, user_id: 'new_user_id' } as unknown as T;
    }
    
    if (path.includes('/users/update')) {
      console.log('Updating user:', body);
      return { success: true } as unknown as T;
    }
    
    if (path.includes('/users/delete')) {
      console.log('Deleting user:', body);
      return { success: true } as unknown as T;
    }
    
    if (path.includes('/teams/list')) {
      return { teams: mockTeams } as unknown as T;
    }
    
    if (path.includes('/keys/list')) {
      return { keys: mockKeys } as unknown as T;
    }
    
    if (path.includes('/models/list')) {
      return { models: mockModels } as unknown as T;
    }
    
    if (path.includes('/spend/report')) {
      return mockSpendReport as unknown as T;
    }
    
    // Default fallback
    console.warn(`No mock handler for ${path}`);
    return { success: true } as unknown as T;
  },

  // Users
  users: {
    async list(params?: Record<string, string>) {
      return api.request('/users/list', 'GET', null, params);
    },
    
    async create(userData: any) {
      return api.request('/users/create', 'POST', userData);
    },
    
    async update(userData: any) {
      return api.request('/users/update', 'POST', userData);
    },
    
    async delete(userIds: string[]) {
      return api.request('/users/delete', 'POST', { user_ids: userIds });
    },
  },
  
  // Teams
  teams: {
    async list(params?: Record<string, string>) {
      return api.request('/teams/list', 'GET', null, params);
    },
    
    async create(teamData: any) {
      return api.request('/teams/create', 'POST', teamData);
    },
    
    async update(teamData: any) {
      return api.request('/teams/update', 'POST', teamData);
    },
    
    async delete(teamIds: string[]) {
      return api.request('/teams/delete', 'POST', { team_ids: teamIds });
    },
    
    async addMember(teamId: string, userId: string) {
      return api.request('/teams/member_add', 'POST', { team_id: teamId, user_id: userId });
    },
    
    async deleteMember(teamId: string, userId: string) {
      return api.request('/teams/member_delete', 'POST', { team_id: teamId, user_id: userId });
    },
  },
  
  // Keys
  keys: {
    async list(params?: Record<string, string>) {
      return api.request('/keys/list', 'GET', null, params);
    },
    
    async create(keyData: any) {
      return api.request('/keys/create', 'POST', keyData);
    },
    
    async update(keyData: any) {
      return api.request('/keys/update', 'POST', keyData);
    },
    
    async delete(keyIds: string[]) {
      return api.request('/keys/delete', 'POST', { key_ids: keyIds });
    },
  },
  
  // Models
  models: {
    async list(params?: Record<string, string>) {
      return api.request('/models/list', 'GET', null, params);
    },
  },
  
  // Spend
  spend: {
    async getReport(params?: Record<string, string>) {
      return api.request('/spend/report', 'GET', null, params);
    },
  },
};
