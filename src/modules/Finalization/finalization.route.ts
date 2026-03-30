import express from 'express';
import { FinalizationController } from './finalization.controller';

const router = express.Router();

router.get('/', FinalizationController.getAllFinalizations);

export const FinalizationRoutes = router;
