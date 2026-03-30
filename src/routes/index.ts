import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { DeadlineRoutes } from '../modules/Deadline/deadline.route';
import { DepositRoutes } from '../modules/Deposit/deposit.route';

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
    {
      path: '/deposits',
      handler: DepositRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.handler));

export default router;
