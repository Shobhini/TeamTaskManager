import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes will be mounted here in later tasks
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
