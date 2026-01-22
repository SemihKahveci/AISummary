import express from "express";
import multer from "multer";
import { summarizePdfToOnePager } from "../services/summary.service";
import { generateOnePagerPdf } from "../services/pdf.service";
import { storePdf } from "../services/storage.service";
import { sanitizeSummary } from "../utils/sanitize";
import { getCachedResult, setCachedResult } from "../utils/idempotency";

export type OnePagerRequest = {
  requestId?: string;
  fileBuffer: Buffer;
  fileName?: string;
  language?: string;
  publicBaseUrl?: string;
};

export type OnePagerResponse = {
  summary: string;
  pdfUrl?: string;
  pdfPath?: string;
};

export async function handleOnePagerRequest(
  input: OnePagerRequest
): Promise<OnePagerResponse> {
  if (input.requestId) {
    const cached = getCachedResult(input.requestId);
    if (cached) {
      return cached;
    }
  }

  const summary = await summarizePdfToOnePager({
    fileBuffer: input.fileBuffer,
    fileName: input.fileName,
    language: input.language ?? "tr",
  });

  const sanitizedSummary = sanitizeSummary(summary);
  const pdfBuffer = await generateOnePagerPdf({
    summary: sanitizedSummary,
    title: input.fileName ?? "AI Summary",
  });

  const storageResult = await storePdf({
    buffer: pdfBuffer,
    fileName: input.fileName ?? "onepager.pdf",
    publicBaseUrl: input.publicBaseUrl,
  });

  const response: OnePagerResponse = {
    summary: sanitizedSummary,
    pdfUrl: storageResult.url,
    pdfPath: storageResult.path,
  };

  if (input.requestId) {
    setCachedResult(input.requestId, response);
  }

  return response;
}

export function buildOnePagerRouter(): express.Router {
  const router = express.Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
  });

  router.post("/onepager", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "PDF dosyasi gerekli." });
    }

    const requestId =
      (req.headers["x-request-id"] as string | undefined) ??
      (req.body?.requestId as string | undefined);
    const language = (req.body?.language as string | undefined) ?? "tr";
    const publicBaseUrl = `${req.protocol}://${req.get("host")}`;

    try {
      const result = await handleOnePagerRequest({
        requestId,
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        language,
        publicBaseUrl,
      });

      return res.json(result);
    } catch (error) {
      console.error("Onepager error:", error);
      const message =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      return res.status(500).json({
        error: "Ozetleme basarisiz.",
        details: process.env.NODE_ENV === "production" ? undefined : message,
      });
    }
  });

  return router;
}
