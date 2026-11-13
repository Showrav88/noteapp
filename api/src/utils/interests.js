import { ALLOWED_INTERESTS, INTEREST_OPTIONS } from '../config/interestOptions.js';
import { HttpError } from './HttpError.js';

export function listInterestOptions() {
  return INTEREST_OPTIONS;
}

/**
 * Normalize and validate interests against the fixed catalog (no free-text tags).
 */
export function parseInterests(interests) {
  if (interests === undefined || interests === null) {
    return [];
  }
  if (!Array.isArray(interests)) {
    throw new HttpError(400, 'interests must be an array of strings');
  }

  const seen = new Set();
  const result = [];

  for (const item of interests) {
    const value = String(item).trim().toLowerCase();
    if (!value) {
      continue;
    }
    if (!ALLOWED_INTERESTS.has(value)) {
      throw new HttpError(400, `Invalid interest "${value}". Use GET /interests/options for allowed values.`);
    }
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
}
