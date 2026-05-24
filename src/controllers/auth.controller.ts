import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema } from "../lib/validations/auth.schema";
import { createUser, getUserByEmail, getUserById } from "../services/user.service";
import { generateToken } from "../middleware/auth.middleware";
import type { Role } from "../types";

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    res.status(409).json({ error: "Пользователь с таким email уже существует" });
    return;
  }

  try {
    const user = await createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name,
      role: parsed.data.role as "BUYER" | "SELLER",
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({ error: "Ошибка при регистрации" });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const user = await getUserByEmail(parsed.data.email);
  if (!user) {
    res.status(401).json({ error: "Неверный email или пароль" });
    return;
  }

  const passwordMatch = await bcrypt.compare(parsed.data.password, user.password);
  if (!passwordMatch) {
    res.status(401).json({ error: "Неверный email или пароль" });
    return;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role as Role,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Не авторизован" });
    return;
  }

  const user = await getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }

  res.json({ user });
}
