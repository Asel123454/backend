import { Router } from "express";
import {
  listCategories,
  getCategory,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from "../controllers/category.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", listCategories);
router.get("/:slug", getCategory);

// Admin-only routes
router.post("/", authenticate, authorize("ADMIN"), createCategoryHandler);
router.put("/:id", authenticate, authorize("ADMIN"), updateCategoryHandler);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCategoryHandler);

export default router;
