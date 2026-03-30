import express from 'express';
import { DeadlineController } from './deadline.controller';

const router = express.Router();

router.get('/', DeadlineController.getAllDeadlines);

export const DeadlineRoutes = router;
