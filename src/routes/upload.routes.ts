import { Router } from "express";
import multer from "multer";
import { uploadFiles } from "../controllers/upload.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("SELLER", "ADMIN"),
  upload.array("files", 10),
  uploadFiles
);

export default router;
