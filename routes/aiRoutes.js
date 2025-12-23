import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {AiChat, AiHistory, getRateLimit, semanticSearch} from "../controllers/aiController.js";

const router = express.Router();

router.get("/stream", AiChat);
router.get("/chat", authenticateToken, AiHistory);
router.post("/search", semanticSearch);
router.get("/get-ratelimit/:userId", authenticateToken, getRateLimit);

export default router;