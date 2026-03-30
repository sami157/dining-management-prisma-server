import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { DeadlineRoutes } from '../modules/Deadline/deadline.route';

const router = Router();

type TModuleRoute = {
    path: string;
    handler: Router;
};

const moduleRoutes: TModuleRoute[] = [
    {
      path: '/auth',
      handler: AuthRoutes,
    },
    {
      path: '/deadline',
      handler: DeadlineRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.handler));

export default router;
