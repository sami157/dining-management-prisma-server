import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import firebaseAuthMiddleware from '../../middlewares/firebaseAuth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router.get('/', firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER), UserController.getAllUsers);
router.get('/:id', firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER), UserController.getUserById);
router.patch(
  '/me',
  firebaseAuthMiddleware(),
  validateRequest(UserValidation.selfUpdateValidationSchema),
  UserController.updateMyProfile,
);
router.patch(
  '/:id/role',
  firebaseAuthMiddleware(UserRole.ADMIN),
  validateRequest(UserValidation.roleUpdateValidationSchema),
  UserController.updateUserRole,
);
router.patch(
  '/:id',
  firebaseAuthMiddleware(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(UserValidation.userValidationSchema),
  UserController.updateUser,
);
router.delete('/:id', firebaseAuthMiddleware(UserRole.ADMIN), UserController.deactivateUser);

export const UserRoutes = router;
