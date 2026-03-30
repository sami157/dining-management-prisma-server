import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { DeadlineController } from './deadline.controller';
import { DeadlineValidation } from './deadline.validation';

const router = express.Router();

router.get('/', DeadlineController.getAllDeadlines);
router.post('/', validateRequest(DeadlineValidation.deadlineValidationSchema), DeadlineController.upsertDeadline);

export const DeadlineRoutes = router;
