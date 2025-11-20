import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriends,
  getAllPendingRequests,
  unfriendUser,
} from "../controllers/friendController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send",authenticateToken, sendFriendRequest);
router.put("/accept/:requestId",authenticateToken, acceptFriendRequest);
router.put("/reject/:requestId",authenticateToken, rejectFriendRequest);
router.get("/pending",authenticateToken, getPendingRequests);
router.get("/allpending",authenticateToken, getAllPendingRequests);
router.get("/list/:userId",authenticateToken, getFriends);
router.delete("/unfriend/:id", authenticateToken, unfriendUser);

export default router;
