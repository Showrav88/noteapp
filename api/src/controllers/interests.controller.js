import { listInterestOptions } from '../utils/interests.js';

export function options(req, res) {
  res.json({ items: listInterestOptions() });
}
