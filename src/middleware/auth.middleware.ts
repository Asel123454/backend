import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../types";
import type { JwtPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JwtPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn });
}

/**
 * Middleware: Verify JWT token and attach user to request
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Необходимо войти в систему" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Недействительный токен" });
  }
}

/**
 * Middleware: Check user role (must be used after authenticate)
 */
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Не авторизован" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Недостаточно прав" });
      return;
    }

    next();
  };
}
