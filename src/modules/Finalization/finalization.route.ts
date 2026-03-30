import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { FinalizationController } from './finalization.controller';
import { FinalizationValidation } from './finalization.validation';

const router = express.Router();

router.get('/', FinalizationController.getAllFinalizations);
router.post('/', validateRequest(FinalizationValidation.finalizationValidationSchema), FinalizationController.finalizeMonth);

export const FinalizationRoutes = router;
