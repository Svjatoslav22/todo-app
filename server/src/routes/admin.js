const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getSystemStats,
  listUsers,
  updateUserRole,
  toggleUserBan,
  getUserTasks,
  impersonateUser,
  getAuditLogs,
} = require("../controllers/adminController");

const router = express.Router();

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

module.exports = router;
