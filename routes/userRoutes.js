// server/routes/userRoutes.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  uploadProfileImage,
} from "../controllers/userController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder

// Search all users or by keyword
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post(
  "/upload-profile",
  upload.single("profileImage"),
  uploadProfileImage
);
router.put("/updateUser/:userId", updateUser);

export default router;
