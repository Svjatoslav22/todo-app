import { Router } from "express";
import authController from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas/authSchemas";

const router = Router();

router.post("/register", validate({ body: registerSchema }), authController.register);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

export default router;
