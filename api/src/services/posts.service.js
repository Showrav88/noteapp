import { Post } from '../models/Post.js';
import { HttpError } from '../utils/HttpError.js';

function postDto(post) {
  return {
    _id: post._id,
    author: post.author,
    title: post.title,
    body: post.body,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export async function createPost(authorId, body) {
  if (!body.title?.trim()) {
    throw new HttpError(400, 'title is required');
  }
  const post = await Post.create({
    author: authorId,
    title: body.title.trim(),
    body: body.body ?? '',
  });
  return postDto(post);
}
