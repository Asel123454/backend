import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "../types";

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role?: Role;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || "BUYER",
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; phone?: string; address?: string; avatar?: string }
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(id: string, role: Role) {
  return prisma.user.update({
    where: { id },
    data: { role },
  });
}
