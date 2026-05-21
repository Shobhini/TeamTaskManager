import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createUser, verifyCredentials } from '../services/auth';
import { signToken } from '../lib/jwt';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    const user = await createUser(name, email, password);
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ token, user });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await verifyCredentials(email, password);
    const token = signToken({ userId: user.id, email: user.email });
    res.status(200).json({ token, user });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
}
