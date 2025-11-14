import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriends,
  getAllPendingRequests,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/send", sendFriendRequest);
router.put("/accept/:requestId", acceptFriendRequest);
router.put("/reject/:requestId", rejectFriendRequest);
router.get("/pending/:userId", getPendingRequests);
router.get("/allpending/:userId", getAllPendingRequests);
router.get("/list/:userId", getFriends);

export default router;
