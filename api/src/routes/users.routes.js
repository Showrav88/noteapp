import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, usersController.me);
router.get('/by-interest', requireAuth, usersController.byInterest);
router.get('/', requireAuth, requireAdmin, usersController.list);
router.post('/', requireAuth, requireAdmin, usersController.create);
router.get('/:id/posts', requireAuth, usersController.userPosts);
router.get('/:id', requireAuth, requireAdmin, usersController.getOne);
router.patch('/:id', requireAuth, requireAdmin, usersController.update);
router.delete('/:id', requireAuth, requireAdmin, usersController.remove);

export default router;
