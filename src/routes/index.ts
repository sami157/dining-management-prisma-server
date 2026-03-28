import { Router } from 'express';

const router = Router();

type TModuleRoute = {
    path: string;
    handler: Router;
};

const moduleRoutes: TModuleRoute[] = [
    //   {
    //     path: '/users',
    //     hanler: UserRoutes,
    //   },
];

moduleRoutes.forEach((route) => router.use(route.path, route.handler));

export default router;
