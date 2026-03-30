import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.patch('/:id', validateRequest(UserValidation.userValidationSchema), UserController.updateUser);
router.delete('/:id', UserController.deactivateUser);

export const UserRoutes = router;
