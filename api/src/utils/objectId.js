import mongoose from 'mongoose';
import { HttpError } from './HttpError.js';

export function toObjectId(id, message = 'Invalid id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, message);
  }
  return new mongoose.Types.ObjectId(id);
}
