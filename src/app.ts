import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import notFound from './middlewares/notFound';
import globalErrorHandler from './middlewares/globalErrorHandler';
import router from './routes';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Dining Management Server!');
});

// global error handler
app.use(globalErrorHandler);

// not found middleware
app.use(notFound);

export default app;
