// server/routes/userRoutes.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  uploadProfileImage,
} from "../controllers/userController.js";
import multer from "multer";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder

// Search all users or by keyword
router.get("/",authenticateToken, getAllUsers);
router.get("/:id",authenticateToken, getUserById);
router.post(
  "/upload-profile",
  upload.single("profileImage"),authenticateToken,
  uploadProfileImage
);
router.put("/updateUser",authenticateToken, updateUser);

export default router;
