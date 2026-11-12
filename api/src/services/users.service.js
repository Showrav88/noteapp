import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Note } from '../models/Note.js';
import { Post } from '../models/Post.js';
import { HttpError } from '../utils/HttpError.js';
import { parsePagination, slicePage } from '../utils/paginate.js';
import { toObjectId } from '../utils/objectId.js';

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: user.interests ?? [],
  };
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }
  return publicUser(user);
}

export async function listUsers(query) {
  const { page, limit, skip } = parsePagination(query);
  const users = await User.find({}).sort({ _id: -1 }).skip(skip).limit(limit + 1);
  const { items, hasNextPage } = slicePage(users, limit);
  return {
    items: items.map(publicUser),
    page,
    limit,
    hasNextPage,
  };
}

export async function createUser(body, actor) {
  const { name, email, password, interests } = body;
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
      interests: Array.isArray(interests) ? interests : [],
    });
    return publicUser(user);
  } catch (err) {
    if (err.code === 11000) {
      throw new HttpError(409, 'Email already in use');
    }
    throw err;
  }
}

export async function getUserById(userId) {
  toObjectId(userId);
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  return publicUser(user);
}

export async function updateUser(userId, body, actor) {
  toObjectId(userId);
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (String(actor._id) === String(user._id)) {
    if (body.role && body.role !== 'admin') {
      throw new HttpError(403, 'Forbidden');
    }
  }

  if (body.name !== undefined) user.name = String(body.name).trim();
  if (body.email !== undefined) user.email = String(body.email).trim().toLowerCase();
  if (Array.isArray(body.interests)) user.interests = body.interests;
  if (body.password) {
    user.passwordHash = await bcrypt.hash(body.password, 10);
  }
  if (body.role !== undefined && body.role !== user.role) {
    if (String(actor._id) === String(user._id)) {
      throw new HttpError(403, 'Forbidden');
    }
    if (!['user', 'admin'].includes(body.role)) {
      throw new HttpError(400, 'Invalid role');
    }
    user.role = body.role;
  }

  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new HttpError(409, 'Email already in use');
    }
    throw err;
  }

  return publicUser(user);
}

export async function deleteUser(userId, actor) {
  toObjectId(userId);
  if (String(actor._id) === String(userId)) {
    throw new HttpError(403, 'Forbidden');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  await Note.deleteMany({ owner: user._id });
  await Post.deleteMany({ author: user._id });
  await user.deleteOne();

  return { message: 'User deleted' };
}

export async function usersByInterest(query) {
  const { page, limit, skip } = parsePagination(query);
  const groups = await User.aggregate([
    { $match: { interests: { $type: 'string' } } },
    { $unwind: '$interests' },
    {
      $group: {
        _id: '$interests',
        count: { $sum: 1 },
        users: { $push: { _id: '$_id', name: '$name' } },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $skip: skip },
    { $limit: limit + 1 },
  ]);

  const { items, hasNextPage } = slicePage(groups, limit);
  return {
    items: items.map((g) => ({
      interest: g._id,
      count: g.count,
      users: g.users,
    })),
    page,
    limit,
    hasNextPage,
  };
}

export async function getUserPosts(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const objectId = toObjectId(userId, 'Invalid user id');

  const [result] = await User.aggregate([
    { $match: { _id: objectId } },
    { $project: { name: 1 } },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'author',
        pipeline: [
          { $sort: { _id: -1 } },
          { $skip: skip },
          { $limit: limit + 1 },
        ],
        as: 'posts',
      },
    },
  ]);

  if (!result) {
    throw new HttpError(404, 'User not found');
  }

  const { posts, ...user } = result;
  const { items, hasNextPage } = slicePage(posts, limit);

  return {
    _id: user._id,
    name: user.name,
    posts: items,
    page,
    limit,
    hasNextPage,
  };
}
