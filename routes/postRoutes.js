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

const router = express.Router();

router.post("/", createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.get("/private/user/:userId", getPrivatePostsByUser);
router.delete("/:id", deletePost);
router.get("/user/:userId", getAllPostById);
router.get("/public/user/:userId", getAllPublicPostById);
router.post("/:postId/like", toggleLike);

export default router;
