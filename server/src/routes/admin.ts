import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import {
  getSystemStats,
  listUsers,
  updateUserRole,
  toggleUserBan,
  getUserTasks,
  impersonateUser,
  getAuditLogs,
} from "../controllers/adminController";

const router = Router();

// Enforce auth and admin role for all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", getSystemStats);
router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/ban", toggleUserBan);
router.get("/users/:id/tasks", getUserTasks);
router.post("/users/:id/impersonate", impersonateUser);
router.get("/logs", getAuditLogs);

export default router;
