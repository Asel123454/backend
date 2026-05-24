import { Request, Response } from "express";
import {
  createOrder,
  getOrdersByBuyer,
  getOrdersBySeller,
  getAllOrders,
  updateOrderStatus,
} from "../services/order.service";
import { orderSchema, orderStatusSchema } from "../lib/validations/order.schema";
import type { OrderStatus } from "../types";

/**
 * POST /api/orders
 */
export async function createOrderHandler(req: Request, res: Response): Promise<void> {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  try {
    const order = await createOrder(
      req.user!.id,
      parsed.data.items,
      parsed.data.shippingAddress
    );
    res.status(201).json({ success: true, orderId: order.id, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка при оформлении заказа";
    res.status(400).json({ error: message });
  }
}

/**
 * GET /api/orders/my
 */
export async function getMyOrders(req: Request, res: Response): Promise<void> {
  const orders = await getOrdersByBuyer(req.user!.id);
  res.json(orders);
}

/**
 * GET /api/orders/seller
 */
export async function getSellerOrders(req: Request, res: Response): Promise<void> {
  const orders = await getOrdersBySeller(req.user!.id);
  res.json(orders);
}

/**
 * GET /api/orders
 */
export async function listAllOrders(_req: Request, res: Response): Promise<void> {
  const orders = await getAllOrders();
  res.json(orders);
}

/**
 * PATCH /api/orders/:id/status
 */
export async function updateOrderStatusHandler(req: Request, res: Response): Promise<void> {
  const parsed = orderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  try {
    await updateOrderStatus(req.params.id as string, parsed.data.status as OrderStatus);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Ошибка при обновлении статуса" });
  }
}
