import { readFileSync } from "fs";
import { join } from "path";
import { generatePdf } from "html-pdf-node";

export type OnePagerPdfInput = {
  title: string;
  summary: string;
};

export async function generateOnePagerPdf(
  input: OnePagerPdfInput
): Promise<Buffer> {
  const html = renderOnePagerHtml(input);

  const file = { content: html };
  const options = {
    format: "A4",
    printBackground: true,
    margin: {
      top: "12mm",
      right: "12mm",
      bottom: "12mm",
      left: "12mm",
    },
  };

  const pdfBuffer = await generatePdf(file, options);
  return pdfBuffer;
}

function renderOnePagerHtml(input: OnePagerPdfInput): string {
  const templatePath = join(process.cwd(), "src", "templates", "onepager.html");
  const template = readFileSync(templatePath, "utf-8");

  return template
    .replaceAll("{{title}}", escapeHtml(input.title))
    .replaceAll("{{summary}}", escapeHtml(input.summary));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
