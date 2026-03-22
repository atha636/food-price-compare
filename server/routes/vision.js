const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ✅ VALIDATE API KEY ON STARTUP
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ CRITICAL: OPENAI_API_KEY not set in environment!");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/detect-item", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // ✅ CHECK IF API KEY EXISTS BEFORE PROCEEDING
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not configured");
      return res.status(500).json({ 
        error: "Server configuration error: Missing OpenAI API key",
        details: "Contact admin to set OPENAI_API_KEY"
      });
    }

    const base64Image = req.file.buffer.toString("base64");
    
    // ✅ USE ACTUAL MIME TYPE (not hardcoded)
    const mimeType = req.file.mimetype || "image/jpeg";

    console.log("🖼️ Processing image:", {
      size: req.file.size,
      mimeType: mimeType
    });

    // ✅ CORRECT MODEL NAME
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ✅ Correct vision model
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What food or grocery item is this? Reply only with the item name, nothing else.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    const item =
      response.choices?.[0]?.message?.content?.trim().toLowerCase() || "unknown";

    console.log("✅ Detected item:", item);
    res.json({ item });

  } catch (err) {
    console.error("❌ Vision API Error:", {
      message: err.message,
      status: err.status,
      code: err.code
    });

    // ✅ BETTER ERROR MESSAGES
    if (err.message?.includes("401") || err.code === "invalid_api_key") {
      return res.status(500).json({
        error: "API Authentication failed",
        details: "Invalid or expired OpenAI API key"
      });
    }

    if (err.message?.includes("429") || err.code === "rate_limit_exceeded") {
      return res.status(429).json({
        error: "Rate limited",
        details: "Too many requests to OpenAI. Try again in a moment."
      });
    }

    if (err.message?.includes("timeout")) {
      return res.status(504).json({
        error: "Request timeout",
        details: "OpenAI API took too long to respond"
      });
    }

    res.status(500).json({
      error: "Image detection failed",
      details: err.message
    });
  }
});

module.exports = router;