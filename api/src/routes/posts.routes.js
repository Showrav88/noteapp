import { Router } from 'express';
import * as postsController from '../controllers/posts.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, postsController.create);

export default router;
