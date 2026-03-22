const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/detect-item", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const base64Image = req.file.buffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What food or grocery item is this? Reply only item name.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const item =
      response.choices?.[0]?.message?.content?.trim().toLowerCase() || "unknown";

    res.json({ item });

  } catch (err) {
    console.error("Vision error:", err.message);

    res.status(500).json({
      error: "Image detection failed",
      details: err.message
    });
  }
});

module.exports = router;