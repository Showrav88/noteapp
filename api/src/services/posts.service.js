import { Post } from '../models/Post.js';
import { HttpError } from '../utils/HttpError.js';
import { parsePagination, slicePage } from '../utils/paginate.js';

function authorSummary(author) {
  if (author && typeof author === 'object' && author._id) {
    return {
      _id: author._id,
      name: author.name,
      email: author.email,
    };
  }
  return { _id: author };
}

function postDto(post, { includeAuthorProfile = false } = {}) {
  return {
    _id: post._id,
    author: includeAuthorProfile ? authorSummary(post.author) : post.author,
    title: post.title,
    body: post.body,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

const populateAuthor = { path: 'author', select: 'name email' };

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

/** Logged-in feed: all posts, newest first (paginated). */
export async function listPosts(query) {
  const { page, limit, skip } = parsePagination(query);
  const posts = await Post.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate(populateAuthor);
  const { items, hasNextPage } = slicePage(posts, limit);
  return {
    items: items.map((post) => postDto(post, { includeAuthorProfile: true })),
    page,
    limit,
    hasNextPage,
  };
}
