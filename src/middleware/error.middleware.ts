import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("❌ Error:", err.message);

  if (err.name === "ZodError") {
    res.status(400).json({
      error: "Validation error",
      details: JSON.parse(err.message),
    });
    return;
  }

  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Внутренняя ошибка сервера"
      : err.message,
  });
}
