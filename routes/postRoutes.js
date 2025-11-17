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

router.post("/", authenticateToken, upload.array("image", 10), createPost);
router.get("/",authenticateToken, getPosts);
router.get("/:id",authenticateToken, getPostById);
router.get("/private/post",authenticateToken, getPrivatePostsByUser);
router.delete("/:id",authenticateToken, deletePost);
router.get("/all/post",authenticateToken, getAllPostById);
router.get("/public/post",authenticateToken, getAllPublicPostById);
router.post("/:postId/like",authenticateToken, toggleLike);

export default router;
