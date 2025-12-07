import 'dotenv/config';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import { AuthController } from './controllers/auth-controller.js';
import cookieParser from 'cookie-parser';
import { CLIENT } from './lib/open-id.js';
import { authenticated } from './middleware/auth.js';

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authController = new AuthController(CLIENT);

app.use('/auth', authController.router);

app.get('/me', authenticated, (req: Request, res: Response) => {
  return res.json({
    id: req.user.sub,
    email: req.user.email,
    name: req.user.name,
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(8000, () => console.log('Server is running on port 8000'));
