import { Router } from "express";
import { getLogs } from "./log.controller";
import { protect, authorizeRoles } from "../../shared/middleware/auth";

const router = Router();
router.get("/", protect, authorizeRoles("superadmin", "admin"), getLogs);

export default router;
