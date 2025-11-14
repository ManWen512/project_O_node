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

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder

router.post("/",  upload.array("image", 10), createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.get("/private/user/:userId", getPrivatePostsByUser);
router.delete("/:id", deletePost);
router.get("/user/:userId", getAllPostById);
router.get("/public/user/:userId", getAllPublicPostById);
router.post("/:postId/like", toggleLike);

export default router;
