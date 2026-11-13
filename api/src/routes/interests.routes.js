import { Router } from 'express';
import * as interestsController from '../controllers/interests.controller.js';

const router = Router();

router.get('/options', interestsController.options);

export default router;
