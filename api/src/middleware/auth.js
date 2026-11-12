import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from '../utils/HttpError.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Unauthorized');
  }

  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new HttpError(401, 'Unauthorized');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    throw new HttpError(403, 'Forbidden');
  }
  next();
}
