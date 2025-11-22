import {
  generateEmbedding,
  vectorSearch,
} from "../services/embeddingService.js";
import AiContent from "../models/aiContentModels.js";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
// redisRateLimit.js
import { redis } from "../services/redis.js";

const MAX_REQUESTS = 5; // per user
const WINDOW_MS = 24 * 60 * 60 * 1000; // 1 day in ms

const checkRateLimit = async (userId) => {
  const key = `aichat:${userId}`; // unique per user


  // increment count
  const count = await redis.incr(key);

  // if this is the 1st request, set TTL
  if (count === 1) {
    await redis.expire(key,Math.ceil(WINDOW_MS / 1000));
    
  }

  // how much time is left
  const ttlMs = await redis.pTTL(key);
  const timeLeftMinutes = Math.ceil(ttlMs / 1000 / 60);

  return {
    count,
    isLimited: count > MAX_REQUESTS,
    timeLeftMinutes,
  };
};


export const AiChat = async (req, res) => {
  const prompt = req.query.prompt;
  const type = req.query.type || "chat";
  const token = req.query.token;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is Required" });
  }

  let userId;
  try {
    const user = jwt.verify(token, process.env.AUTH_SECRET);
    userId = user.id;
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

 // 2. Rate Limit
  const rateInfo = await checkRateLimit(userId);

  if (rateInfo.isLimited) {
    return res.status(429).json({
      error: "Too many requests. You reached your daily limit.",
      retryAfterMinutes: rateInfo.timeLeftMinutes,
    });
  }

  console.log(`AI Chat Requests for user ${userId}: ${rateInfo.count}`);

  try {
    // Hugging Face router endpoint (Phi-3-mini)
    const HF_TOKEN = process.env.HF_TOKEN;
    const model = "openai/gpt-oss-120b:fastest";

    // Generate embedding for the prompt
    console.log("Generating embedding...");
    const embedding = await generateEmbedding(prompt);

    // Search for similar conversations using Atlas Vector Search
    console.log("Searching for similar chats...");
    const similarChats = await vectorSearch(
      AiContent,
      embedding,
      userId,
      3 // Top 3 results
    );

    console.log(`Found ${similarChats.length} similar chats`);

    // Build context from similar chats
    let contextPrompt = prompt;
    if (similarChats.length > 0) {
      const context = similarChats
        .map(
          (chat) =>
            `[Similarity: ${chat.score.toFixed(2)}] Q: ${chat.prompt}\nA: ${
              chat.output
            }`
        )
        .join("\n\n");

      contextPrompt = `Here is relevant context from previous conversations:\n\n${context}\n\n---\n\nCurrent question: ${prompt}`;
    }

    // Tell the client that we will stream events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          stream: true, // enable streaming
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant. Use the provided context from previous conversations to give more informed and personalized responses.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.body) {
      return res.status(500).json({ error: "Streaming not supported" });
    }

    let output = "";

    // Use for-await-of to handle the streaming response
    for await (const chunk of response.body) {
      const text = chunk.toString();

      // Parse SSE format from HuggingFace
      const lines = text.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6); // Remove 'data: ' prefix

          if (data === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";

            if (content) {
              output += content;
              // Send to client
              res.write(`data: ${content}\n\n`);
            }
          } catch (e) {
            // Skip malformed JSON
            console.error("JSON parse error:", e);
          }
        }
      }
    }

    // Save full output to MongoDB after streaming
    const aiContent = await AiContent.create({
      prompt,
      output,
      type,
      embedding,
      user: userId,
    });

    // Send final completion message
    res.write(`event: done\ndata: ${JSON.stringify(aiContent)}\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
};

export const AiHistory = async (req, res) => {
  try {
    const history = await AiContent.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .limit(50); // latest 50 entries
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

const getRateLimitStatus = async (userId) => {
  const key = `aichat:${userId}`;

  const count = Number(await redis.get(key)) || 0;
  const ttlMs = await redis.pTTL(key);

  return {
    count,
    isLimited: count > MAX_REQUESTS,
    timeLeftMinutes: ttlMs > 0 ? Math.ceil(ttlMs / 1000 / 60) : 0,
  };
};

export const getRateLimit = async (req, res) => {
 const { userId } = req.params;

  const data = await getRateLimitStatus(userId);
  res.json(data);
};

export const semanticSearch = async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Perform vector search
    const results = await vectorSearch(
      AiContent,
      queryEmbedding,
      req.user.id,
      limit
    );

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
};
