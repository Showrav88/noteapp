import * as postsService from '../services/posts.service.js';

export async function list(req, res) {
  res.json(await postsService.listPosts(req.query));
}

export async function create(req, res) {
  const post = await postsService.createPost(req.user._id, req.body);
  res.status(201).json(post);
}
