import express from "express";
import multer from "multer";
import crypto from "crypto";
import { extractPdfText } from "../services/pdf-text.service";
import { sanitizeText } from "../utils/sanitize";
import { answerPdfQuestion } from "../services/chat.service";

type ChatSession = {
  text: string;
  fileName?: string;
  language: string;
  createdAt: number;
};

const chatSessions = new Map<string, ChatSession>();
const CHAT_SESSION_TTL_MS = Number(
  process.env.CHAT_SESSION_TTL_MS ?? 60 * 60 * 1000
);

function cleanupChatSessions() {
  const now = Date.now();
  for (const [key, session] of chatSessions.entries()) {
    if (!session || session.createdAt + CHAT_SESSION_TTL_MS <= now) {
      chatSessions.delete(key);
    }
  }
}

setInterval(cleanupChatSessions, 10 * 60 * 1000);

export function buildChatRouter(): express.Router {
  const router = express.Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
  });

  router.post("/chat/init", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "PDF dosyasi gerekli." });
    }

    const language = (req.body?.language as string | undefined) ?? "tr";
    try {
      const rawText = await extractPdfText(req.file.buffer);
      const cleanedText = sanitizeText(rawText);
      const sessionId = crypto.randomBytes(16).toString("hex");
      chatSessions.set(sessionId, {
        text: cleanedText,
        fileName: req.file.originalname,
        language,
        createdAt: Date.now(),
      });

      return res.json({
        sessionId,
        fileName: req.file.originalname,
      });
    } catch (error) {
      console.error("Chat init error:", error);
      const message =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      return res.status(500).json({
        error: "Dosya islenemedi.",
        details: process.env.NODE_ENV === "production" ? undefined : message,
      });
    }
  });

  router.post("/chat/message", async (req, res) => {
    const sessionId = req.body?.sessionId as string | undefined;
    const message = req.body?.message as string | undefined;
    const language = (req.body?.language as string | undefined) ?? "tr";
    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId ve message gerekli." });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Oturum bulunamadi." });
    }

    try {
      const answer = await answerPdfQuestion({
        text: session.text,
        question: message,
        language,
        fileName: session.fileName,
      });
      return res.json({ answer });
    } catch (error) {
      console.error("Chat message error:", error);
      const message =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      return res.status(500).json({
        error: "Yanıt olusturulamadi.",
        details: process.env.NODE_ENV === "production" ? undefined : message,
      });
    }
  });

  return router;
}
