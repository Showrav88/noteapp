/** Fixed interest tags for register/admin — must match stored user.interests values (Scenario 1). */
export const INTEREST_OPTIONS = [
  { value: 'chess', label: 'Chess' },
  { value: 'reading', label: 'Reading' },
  { value: 'music', label: 'Music' },
  { value: 'coding', label: 'Coding' },
  { value: 'sports', label: 'Sports' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'photography', label: 'Photography' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'fitness', label: 'Fitness' },
];

export const ALLOWED_INTERESTS = new Set(INTEREST_OPTIONS.map((o) => o.value));
