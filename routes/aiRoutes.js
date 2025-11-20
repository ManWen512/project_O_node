import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {AiChat, AiHistory, semanticSearch} from "../controllers/aiController.js";

const router = express.Router();

router.get("/stream", AiChat);
router.get("/chat",authenticateToken, AiHistory);
router.post("/search", authenticateToken, semanticSearch);

export default router;