import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { StatsController } from './stats.controller';
import { StatsValidation } from './stats.validation';

const router = express.Router();

router.get(
  '/daily',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(StatsValidation.dailyStatsQuerySchema),
  StatsController.getDailyStats,
);
router.get(
  '/public',
  validateRequest(StatsValidation.publicStatsQuerySchema),
  StatsController.getPublicStats,
);
router.get(
  '/overview',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  StatsController.getOverviewStats,
);
router.get(
  '/managers',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  StatsController.getManagers,
);
router.get(
  '/monthly',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(StatsValidation.monthlyStatsQuerySchema),
  StatsController.getMonthlyStats,
);

export const StatsRoutes = router;
