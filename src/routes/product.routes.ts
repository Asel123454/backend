import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  toggleProductHandler,
} from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", listProducts);
router.get("/:slug", getProduct);

// Protected routes (SELLER, ADMIN)
router.post("/", authenticate, authorize("SELLER", "ADMIN"), createProductHandler);
router.put("/:id", authenticate, authorize("SELLER", "ADMIN"), updateProductHandler);
router.delete("/:id", authenticate, authorize("SELLER", "ADMIN"), deleteProductHandler);
router.patch("/:id/toggle", authenticate, authorize("SELLER", "ADMIN"), toggleProductHandler);

export default router;
