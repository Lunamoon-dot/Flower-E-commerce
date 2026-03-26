import { Router } from "express";
import { protect, staffOnly } from "../../shared/middleware/auth";
import { uploadImage, upload } from "./upload.controller";

const router = Router();

router.post("/", protect, staffOnly, upload.single("image"), uploadImage);

export default router;
