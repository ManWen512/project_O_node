// server/routes/userRoutes.js
import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

// Search all users or by keyword
router.get("/", getAllUsers);
router.get("/:id", getUserById);

export default router;
