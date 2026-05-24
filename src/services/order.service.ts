import prisma from "../lib/prisma";
import type { OrderStatus } from "../types";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export async function createOrder(
  buyerId: string,
  items: OrderItemInput[],
  shippingAddress: string
) {
  // Use transaction to ensure atomic stock deduction + order creation
  return prisma.$transaction(async (tx) => {
    let total = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, price: true, stock: true, isActive: true },
      });

      if (!product || !product.isActive) {
        throw new Error(`Товар ${item.productId} не найден или неактивен`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Недостаточно товара ${item.productId}. Доступно: ${product.stock}`
        );
      }

      // Deduct stock
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      const price = Number(product.price);
      total += price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
      });
    }

    // Create order
    const order = await tx.order.create({
      data: {
        buyerId,
        total,
        shippingAddress,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: { where: { locale: "ru" } },
              },
            },
          },
        },
      },
    });

    return order;
  });
}

export async function getOrdersByBuyer(buyerId: string) {
  return prisma.order.findMany({
    where: { buyerId },
    include: {
      items: {
        include: {
          product: {
            include: {
              translations: { where: { locale: "ru" } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrdersBySeller(sellerId: string) {
  return prisma.order.findMany({
    where: {
      items: {
        some: {
          product: { sellerId },
        },
      },
    },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      items: {
        where: { product: { sellerId } },
        include: {
          product: {
            include: {
              translations: { where: { locale: "ru" } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllOrders() {
  return prisma.order.findMany({
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            include: {
              translations: { where: { locale: "ru" } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });
}
