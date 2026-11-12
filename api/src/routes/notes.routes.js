import { Router } from 'express';
import * as notesController from '../controllers/notes.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/all', requireAuth, requireAdmin, notesController.listAll);
router.get('/', requireAuth, notesController.listMine);
router.post('/', requireAuth, notesController.create);
router.get('/:id', requireAuth, notesController.getOne);
router.patch('/:id', requireAuth, notesController.update);
router.delete('/:id', requireAuth, notesController.remove);

export default router;
