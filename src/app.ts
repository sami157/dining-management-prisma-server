import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import notFound from './middlewares/notFound';
import globalErrorHandler from './middlewares/globalErrorHandler';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
// app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Apollo Gears World!');
});

// global error handler
app.use(globalErrorHandler);

// not found middleware
app.use(notFound);

export default app;
