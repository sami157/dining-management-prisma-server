import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { DeadlineRoutes } from '../modules/Deadline/deadline.route';
import { DepositRoutes } from '../modules/Deposit/deposit.route';
import { ExpenseRoutes } from '../modules/Expense/expense.route';
import { FinalizationRoutes } from '../modules/Finalization/finalization.route';
import { MealScheduleRoutes } from '../modules/MealSchedule/mealSchedule.route';
import { MealTemplateRoutes } from '../modules/MealTemplate/mealTemplate.route';
import { RegistrationRoutes } from '../modules/Registration/registration.route';
import { UserRoutes } from '../modules/User/user.route';

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
      path: '/deadlines',
      handler: DeadlineRoutes,
    },
    {
      path: '/deposits',
      handler: DepositRoutes,
    },
    {
      path: '/expenses',
      handler: ExpenseRoutes,
    },
    {
      path: '/finalization',
      handler: FinalizationRoutes,
    },
    {
      path: '/finalize',
      handler: FinalizationRoutes,
    },
    {
      path: '/meal-schedules',
      handler: MealScheduleRoutes,
    },
    {
      path: '/schedules',
      handler: MealScheduleRoutes,
    },
    {
      path: '/meal-templates',
      handler: MealTemplateRoutes,
    },
    {
      path: '/templates',
      handler: MealTemplateRoutes,
    },
    {
      path: '/registrations',
      handler: RegistrationRoutes,
    },
    {
      path: '/users',
      handler: UserRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.handler));

export default router;
