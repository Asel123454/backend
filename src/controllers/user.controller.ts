import { Request, Response } from "express";
import { getAllUsers, updateUserRole } from "../services/user.service";
import { Role } from "../types";

/**
 * GET /api/users
 */
export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await getAllUsers();
  res.json(users);
}

/**
 * PATCH /api/users/:id/role
 */
export async function changeUserRole(req: Request, res: Response): Promise<void> {
  const { role } = req.body;

  if (!role || !["BUYER", "SELLER", "ADMIN"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  try {
    const user = await updateUserRole(req.params.id as string, role as Role);
    res.json(user);
  } catch {
    res.status(500).json({ error: "Ошибка при обновлении роли" });
  }
}
