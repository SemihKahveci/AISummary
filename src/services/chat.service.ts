import OpenAI from "openai";
import { sanitizeText } from "../utils/sanitize";
import { chatPromptTrV1 } from "../prompts/chat_tr_v1";

type AnswerQuestionInput = {
  text: string;
  question: string;
  language: string;
  fileName?: string;
};

export async function answerPdfQuestion(
  input: AnswerQuestionInput
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY bulunamadi.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const prompt = chatPromptTrV1({
    fileName: input.fileName ?? "Rapor",
    language: input.language ?? "tr",
  });

  const cleanedText = sanitizeText(input.text).slice(0, 20000);
  const userContent = [
    prompt.user,
    "",
    "Rapor Metni:",
    cleanedText || "[Rapor metni cikmadi]",
    "",
    "Kullanıcı Sorusu:",
    input.question,
  ].join("\n");

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 900,
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
