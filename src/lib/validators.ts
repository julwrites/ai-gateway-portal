
export function isValidDuration(duration: string): boolean {
  const durationRegex = /^(\d+)(s|m|h|d|mo)$/;
  return durationRegex.test(duration);
}

export function validateTeamData(data: any): string | null {
  if (!data.team_alias) {
    return 'Team name is required';
  }
  if (data.budget_duration && !isValidDuration(data.budget_duration)) {
    return 'Invalid budget duration format. Use formats like "30s", "30m", "30h", "30d", or "1mo".';
  }
  // Add more validations as needed
  return null;
}

export function validateUserData(data: any): string | null {
  if (!data.user_email) {
    return 'User email is required';
  }
  if (data.budget_duration && !isValidDuration(data.budget_duration)) {
    return 'Invalid budget duration format. Use formats like "30s", "30m", "30h", "30d", or "1mo".';
  }
  // Add more validations as needed
  return null;
}