import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  getPrivatePostsByUser,
  deletePost,
  getAllPostById,
  getAllPublicPostById,
  toggleLike,
} from "../controllers/postController.js";
import multer from "multer";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder

// Create post
router.post("/", authenticateToken, upload.array("image", 10), createPost);

// Like/Unlike post - MUST come before /:id
router.post("/like/:postId", authenticateToken, toggleLike);

// Get specific filtered posts - BEFORE /:id
router.get("/private/post", authenticateToken, getPrivatePostsByUser);
router.get("/all/post", authenticateToken, getAllPostById);
router.get("/public/post", authenticateToken, getAllPublicPostById);

// Get all posts
router.get("/", authenticateToken, getPosts);

// Dynamic routes with :id MUST come LAST
router.get("/:id", authenticateToken, getPostById);
router.delete("/:id", authenticateToken, deletePost);
export default router;
