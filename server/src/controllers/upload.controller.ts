import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

// multer v2: dùng multer.memoryStorage()
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

export const uploadImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Cấu hình cloudinary tại runtime (sau khi dotenv đã load env vars)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      res.status(500).json({
        message:
          "Cloudinary chưa được cấu hình. Vui lòng thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào file .env",
      });
      return;
    }

    // Upload buffer to Cloudinary
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "bloomshop/products" },
          (error, result) => {
            if (error || !result)
              reject(error ?? new Error("Cloudinary returned no result"));
            else resolve(result as { secure_url: string });
          }
        );
        stream.end(req.file!.buffer);
      }
    );

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("[Upload Error]", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    res.status(500).json({ message });
  }
};
