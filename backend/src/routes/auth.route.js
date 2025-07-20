import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  resetPassword,
  checkEmail,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword);
router.post("/check-email", checkEmail);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;
