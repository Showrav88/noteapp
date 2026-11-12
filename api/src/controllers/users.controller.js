import * as usersService from '../services/users.service.js';

export async function me(req, res) {
  res.json(await usersService.getMe(req.user._id));
}

export async function list(req, res) {
  res.json(await usersService.listUsers(req.query));
}

export async function create(req, res) {
  const user = await usersService.createUser(req.body, req.user);
  res.status(201).json(user);
}

export async function getOne(req, res) {
  res.json(await usersService.getUserById(req.params.id));
}

export async function update(req, res) {
  res.json(await usersService.updateUser(req.params.id, req.body, req.user));
}

export async function remove(req, res) {
  res.json(await usersService.deleteUser(req.params.id, req.user));
}

export async function byInterest(req, res) {
  res.json(await usersService.usersByInterest(req.query));
}

export async function userPosts(req, res) {
  res.json(await usersService.getUserPosts(req.params.id, req.query));
}
