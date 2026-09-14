import path from 'node:path';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createUploader } from '../middleware/upload.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as communityService from '../services/communityService.js';
import * as likesService from '../services/likesService.js';

export const communityRouter = Router();
communityRouter.use(requireAuth);

const upload = createUploader('posts');

communityRouter.get('/chambers', asyncHandler(async (req, res) => {
  res.json(await communityService.listChambers(req.user.id));
}));

communityRouter.get('/chambers/:slug', asyncHandler(async (req, res) => {
  const chamber = await communityService.getChamber(req.params.slug, req.user.id);
  if (!chamber) throw new HttpError(404, 'Chamber not found');
  res.json(chamber);
}));

communityRouter.post('/chambers/:slug/join', asyncHandler(async (req, res) => {
  const result = await communityService.toggleMembership(req.params.slug, req.user.id);
  if (!result) throw new HttpError(404, 'Chamber not found');
  res.json(result);
}));

communityRouter.get('/chambers/:slug/posts', asyncHandler(async (req, res) => {
  const posts = await communityService.listPosts(req.params.slug, req.user.id, req.query.tag);
  if (!posts) throw new HttpError(404, 'Chamber not found');
  res.json(posts);
}));

communityRouter.post('/chambers/:slug/posts', upload.single('image'), asyncHandler(async (req, res) => {
  const { title, body, tag } = req.body;
  if (!title) throw new HttpError(400, 'title is required');
  const mediaPath = req.file ? path.relative(path.resolve(env.uploadDir), req.file.path) : null;
  const post = await communityService.createPost(req.params.slug, req.user.id, { title, body, tag, mediaPath });
  if (!post) throw new HttpError(404, 'Chamber not found');
  res.status(201).json(post);
}));

communityRouter.get('/users/me/posts', asyncHandler(async (req, res) => {
  res.json(await communityService.listPostsByAuthor(req.user.id, req.user.id));
}));

communityRouter.get('/posts/:id', asyncHandler(async (req, res) => {
  const post = await communityService.getPost(numericId(req.params.id), req.user.id);
  if (!post) throw new HttpError(404, 'Post not found');
  res.json(post);
}));

communityRouter.get('/posts/:id/comments', asyncHandler(async (req, res) => {
  res.json(await communityService.listComments(numericId(req.params.id)));
}));

communityRouter.post('/posts/:id/comments', asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) throw new HttpError(400, 'body is required');
  const comment = await communityService.createComment(numericId(req.params.id), req.user.id, body.trim());
  res.status(201).json(comment);
}));

communityRouter.post('/posts/:id/like', asyncHandler(async (req, res) => {
  res.json(await likesService.toggleLike(req.user.id, 'post', numericId(req.params.id)));
}));
