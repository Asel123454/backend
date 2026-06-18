import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// Cloudinary auto-reads the CLOUDINARY_URL env var
// (cloudinary://<api_key>:<api_secret>@<cloud_name>). If it's set we store
// images there (persistent); otherwise we fall back to the local disk
// (fine for local dev, but ephemeral on Render free).
const useCloudinary = Boolean(process.env.CLOUDINARY_URL);

function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "craft-organic", resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

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

    if (!useCloudinary) {
      // Ensure upload dir exists for local fallback
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }

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

      if (useCloudinary) {
        const url = await uploadToCloudinary(file.buffer);
        urls.push(url);
      } else {
        const ext = path.extname(file.originalname) || ".jpg";
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
        const filePath = path.join(UPLOAD_DIR, uniqueName);
        await fs.writeFile(filePath, file.buffer);
        urls.push(`/uploads/${uniqueName}`);
      }
    }

    res.json({ urls });
  } catch {
    res.status(500).json({ error: "Upload failed" });
  }
}
