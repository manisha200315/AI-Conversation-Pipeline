const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "AI Conversation Pipeline backend is running!",
  });
});

// Streaming chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Tell the browser that this response will be streamed
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const response = await ai.models.generateContentStream({
      // Keep the model that is already working for you
      model: "gemini-3-flash-preview",

      contents: message,

      config: {
        systemInstruction:
          "You are a helpful conversational AI assistant. Give clear and concise answers.",
      },
    });

    // Send each Gemini chunk to the client
    for await (const chunk of response) {
      const text = chunk.text;

      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Tell the client that streaming is finished
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);

    res.end();
  } catch (error) {
    console.error("Gemini streaming error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Failed to get response from AI",
      });
    }

    res.write(
      `data: ${JSON.stringify({
        error: "Failed to get response from AI",
      })}\n\n`
    );

    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});