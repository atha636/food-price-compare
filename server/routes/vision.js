import express from "express";
import multer from "multer";
import OpenAI from "openai";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/detect-item", upload.single("image"), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;

    const base64Image = imageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What food or grocery item is this? Reply with only item name.",
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

    const item = response.choices[0].message.content.trim().toLowerCase();

    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image detection failed" });
  }
});

export default router;