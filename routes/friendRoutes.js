import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriends,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/send", sendFriendRequest);
router.put("/accept/:requestId", acceptFriendRequest);
router.put("/reject/:requestId", rejectFriendRequest);
router.get("/pending/:userId", getPendingRequests);
router.get("/list/:userId", getFriends);

export default router;
