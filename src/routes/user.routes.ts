import { Router } from "express";
import { listUsers, changeUserRole } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Admin-only routes
router.get("/", authenticate, authorize("ADMIN"), listUsers);
router.patch("/:id/role", authenticate, authorize("ADMIN"), changeUserRole);

export default router;
