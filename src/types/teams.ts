export interface Member {
  user_id?: string;
  user_email?: string;
  role: 'admin' | 'user';
}

export interface Team {
  team_id: string;
  team_alias?: string;
  organization_id?: string;
  members_with_roles?: Member[];
  metadata?: Record<string, any>;
  tpm_limit?: number;
  rpm_limit?: number;
  max_budget?: number;
  budget_duration?: string;
  models?: string[];
  blocked?: boolean;
  spend?: number;
  max_parallel_requests?: number;
  budget_reset_at?: Date;
}

export interface TeamFormData {
  team_alias?: string;
  max_budget?: number;
  budget_duration?: string;
  models?: string[];
  metadata?: Record<string, any>;
  tpm_limit?: number;
  rpm_limit?: number;
  members_with_roles?: Member[];
  blocked?: boolean;
  max_parallel_requests?: number;
}

export interface TeamListProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
}

export interface TeamFormProps {
  initialData?: TeamFormData;
  onSubmit: (data: TeamFormData) => Promise<void>;
  onClose: () => void;
  isEdit?: boolean;
}
