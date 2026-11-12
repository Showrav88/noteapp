import { Note } from '../models/Note.js';
import { HttpError } from '../utils/HttpError.js';
import { parsePagination, slicePage } from '../utils/paginate.js';
import { toObjectId } from '../utils/objectId.js';

function ownerSummary(owner) {
  if (owner && typeof owner === 'object' && owner._id) {
    return {
      _id: owner._id,
      name: owner.name,
      email: owner.email,
    };
  }
  return { _id: owner };
}

function noteDto(note, { includeOwnerProfile = false } = {}) {
  return {
    _id: note._id,
    owner: includeOwnerProfile ? ownerSummary(note.owner) : note.owner,
    title: note.title,
    body: note.body,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

const populateOwner = { path: 'owner', select: 'name email' };

export async function listMyNotes(ownerId, query) {
  const { page, limit, skip } = parsePagination(query);
  const notes = await Note.find({ owner: ownerId }).sort({ _id: -1 }).skip(skip).limit(limit + 1);
  const { items, hasNextPage } = slicePage(notes, limit);
  return {
    items: items.map(noteDto),
    page,
    limit,
    hasNextPage,
  };
}

export async function listAllNotes(query) {
  const { page, limit, skip } = parsePagination(query);
  const notes = await Note.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate(populateOwner);
  const { items, hasNextPage } = slicePage(notes, limit);
  return {
    items: items.map((note) => noteDto(note, { includeOwnerProfile: true })),
    page,
    limit,
    hasNextPage,
  };
}

export async function createNote(ownerId, body) {
  if (!body.title?.trim()) {
    throw new HttpError(400, 'title is required');
  }
  const note = await Note.create({
    owner: ownerId,
    title: body.title.trim(),
    body: body.body ?? '',
  });
  return noteDto(note);
}

export async function getNote(noteId, user) {
  toObjectId(noteId);
  let note;
  const isAdmin = user.role === 'admin';
  if (isAdmin) {
    note = await Note.findById(noteId).populate(populateOwner);
  } else {
    note = await Note.findOne({ _id: noteId, owner: user._id });
  }
  if (!note) {
    throw new HttpError(404, 'Note not found');
  }
  return noteDto(note, { includeOwnerProfile: isAdmin });
}

export async function updateNote(noteId, user, body) {
  toObjectId(noteId);
  const note = await Note.findOne({ _id: noteId, owner: user._id });
  if (!note) {
    throw new HttpError(404, 'Note not found');
  }
  if (body.title !== undefined) {
    if (!String(body.title).trim()) {
      throw new HttpError(400, 'title is required');
    }
    note.title = String(body.title).trim();
  }
  if (body.body !== undefined) {
    note.body = String(body.body);
  }
  await note.save();
  return noteDto(note);
}

export async function deleteNote(noteId, user) {
  toObjectId(noteId);
  const note = await Note.findOneAndDelete({ _id: noteId, owner: user._id });
  if (!note) {
    throw new HttpError(404, 'Note not found');
  }
  return { message: 'Note deleted' };
}
