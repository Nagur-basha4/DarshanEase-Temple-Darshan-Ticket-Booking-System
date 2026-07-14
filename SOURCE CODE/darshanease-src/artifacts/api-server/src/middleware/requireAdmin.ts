import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Unauthorised. Please log in as admin." });
    return;
  }
  next();
}
