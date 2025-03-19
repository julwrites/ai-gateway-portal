// Mock data for development and testing

export const mockUsers = [
  {
    user_id: "user_1",
    user_email: "admin@example.com",
    user_role: "admin",
    teams: ["team_1"],
    max_budget: 1000,
    budget_duration: "30d",
    models: ["gpt-4", "gpt-3.5-turbo"],
    tpm_limit: 100,
    rpm_limit: 10,
    spend: 250.50
  },
  {
    user_id: "user_2",
    user_email: "user@example.com",
    user_role: "user",
    teams: ["team_1", "team_2"],
    max_budget: 500,
    budget_duration: "30d",
    models: [],
    tpm_limit: 50,
    rpm_limit: 5,
    spend: 125.75
  }
];

export const mockTeams = [
  {
    team_id: "team_1",
    team_name: "Engineering",
    members: ["user_1", "user_2"],
    max_budget: 2000,
    budget_duration: "30d",
    models: ["gpt-4"],
    tpm_limit: 200,
    rpm_limit: 20
  },
  {
    team_id: "team_2",
    team_name: "Marketing",
    members: ["user_2"],
    max_budget: 1000,
    budget_duration: "30d",
    models: [],
    tpm_limit: 100,
    rpm_limit: 10
  }
];

export const mockKeys = [
  {
    key_id: "key_1",
    key_name: "Production API Key",
    team_id: "team_1",
    user_id: "user_1",
    models: ["gpt-4", "gpt-3.5-turbo"],
    aliases: {},
    max_budget: 1000,
    budget_duration: "30d",
    tpm_limit: 100,
    rpm_limit: 10,
    spend: 350.25
  },
  {
    key_id: "key_2",
    key_name: "Development API Key",
    team_id: "team_2",
    user_id: "user_2",
    models: [],
    aliases: {},
    max_budget: 500,
    budget_duration: "30d",
    tpm_limit: 50,
    rpm_limit: 5,
    spend: 175.50
  }
];

export const mockModels = [
  {
    model_id: "gpt-4",
    model_name: "GPT-4",
    model_provider: "openai",
    model_type: "chat",
    cost_per_token: 0.00003,
    context_window: 8192
  },
  {
    model_id: "gpt-3.5-turbo",
    model_name: "GPT-3.5 Turbo",
    model_provider: "openai",
    model_type: "chat",
    cost_per_token: 0.000002,
    context_window: 4096
  }
];

export const mockSpendReport = {
  total_spend: 1000.50,
  spend_by_user: [
    { user_id: "user_1", spend: 600.25 },
    { user_id: "user_2", spend: 400.25 }
  ],
  spend_by_team: [
    { team_id: "team_1", spend: 700.50 },
    { team_id: "team_2", spend: 300.00 }
  ],
  spend_by_model: [
    { model_id: "gpt-4", spend: 800.25 },
    { model_id: "gpt-3.5-turbo", spend: 200.25 }
  ]
};
