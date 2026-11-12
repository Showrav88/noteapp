import { HttpError } from './HttpError.js';

export function normalizeInterests(interests) {
  if (interests === undefined || interests === null) {
    return [];
  }
  if (!Array.isArray(interests)) {
    throw new HttpError(400, 'interests must be an array of strings');
  }
  return interests.map((item) => String(item).trim()).filter(Boolean);
}
