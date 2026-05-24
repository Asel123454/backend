import { Router } from "express";
import {
  createOrderHandler,
  getMyOrders,
  getSellerOrders,
  listAllOrders,
  updateOrderStatusHandler,
} from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// All order routes require authentication
router.post("/", authenticate, createOrderHandler);
router.get("/my", authenticate, getMyOrders);
router.get("/seller", authenticate, authorize("SELLER", "ADMIN"), getSellerOrders);
router.get("/", authenticate, authorize("ADMIN"), listAllOrders);
router.patch("/:id/status", authenticate, authorize("SELLER", "ADMIN"), updateOrderStatusHandler);

export default router;
