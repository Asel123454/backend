import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * POST /api/upload
 */
export async function uploadFiles(req: Request, res: Response): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || !files.length) {
      res.status(400).json({ error: "No files provided" });
      return;
    }

    // Ensure upload dir exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        res.status(400).json({ error: `Unsupported file type: ${file.mimetype}` });
        return;
      }

      if (file.size > MAX_SIZE) {
        res.status(400).json({ error: `File too large: ${file.originalname}. Max 5MB` });
        return;
      }

      const ext = path.extname(file.originalname) || ".jpg";
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
      const filePath = path.join(UPLOAD_DIR, uniqueName);

      await fs.writeFile(filePath, file.buffer);
      urls.push(`/uploads/${uniqueName}`);
    }

    res.json({ urls });
  } catch {
    res.status(500).json({ error: "Upload failed" });
  }
}
