import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from '../utils/HttpError.js';
import { parseInterests } from '../utils/interests.js';

const INVALID_LOGIN = 'Invalid email or password';

function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: 'HS256',
  });
}

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: user.interests,
  };
}

export async function register({ name, email, password, interests }) {
  if (!name?.trim() || !email?.trim() || !password) {
    throw new HttpError(400, 'name, email, and password are required');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'user',
      interests: parseInterests(interests, { minCount: 1 }),
    });
    return { token: signToken(user._id), user: publicUser(user) };
  } catch (err) {
    if (err.code === 11000) {
      throw new HttpError(409, 'Email already in use');
    }
    throw err;
  }
}

export async function login({ email, password }) {
  if (!email?.trim() || !password) {
    throw new HttpError(400, 'email and password are required');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new HttpError(401, INVALID_LOGIN);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, INVALID_LOGIN);
  }

  return { token: signToken(user._id), user: publicUser(user) };
}
