import * as notesService from '../services/notes.service.js';

export async function listMine(req, res) {
  res.json(await notesService.listMyNotes(req.user._id, req.query));
}

export async function listAll(req, res) {
  res.json(await notesService.listAllNotes(req.query));
}

export async function create(req, res) {
  const note = await notesService.createNote(req.user._id, req.body);
  res.status(201).json(note);
}

export async function getOne(req, res) {
  res.json(await notesService.getNote(req.params.id, req.user));
}

export async function update(req, res) {
  res.json(await notesService.updateNote(req.params.id, req.user, req.body));
}

export async function remove(req, res) {
  res.json(await notesService.deleteNote(req.params.id, req.user));
}
