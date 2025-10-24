// server/auth.ts - Placeholder auth module
import { Request, Response, NextFunction } from 'express';

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Placeholder - sempre autentica per sviluppo locale
  next();
}

export async function login(req: Request, res: Response) {
  res.json({ success: true, message: 'Login placeholder' });
}

export async function logout(req: Request, res: Response) {
  res.json({ success: true, message: 'Logout placeholder' });
}
