import OpenAI from "openai";
import { onepagerPromptTrV1 } from "../prompts/onepager_tr_v1";
import { sanitizeText } from "../utils/sanitize";
import { extractPdfText } from "./pdf-text.service";

export type SummarizePdfInput = {
  fileBuffer: Buffer;
  fileName?: string;
  language: string;
};

export async function summarizePdfToOnePager(
  input: SummarizePdfInput
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY bulunamadi.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const prompt = onepagerPromptTrV1({
    fileName: input.fileName ?? "Belge",
    language: input.language,
  });

  const rawText = await extractPdfText(input.fileBuffer);
  const cleanedText = sanitizeText(rawText).slice(0, 20000);

  const userContent = [
    prompt.user,
    "",
    "PDF Metni:",
    cleanedText || "[PDF metni cikmadi]",
  ].join("\n");

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 1200,
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: userContent },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Model bos cevap dondu.");
  }

  return content;
}
