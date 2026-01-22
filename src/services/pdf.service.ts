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
      bottom: "18mm",
      left: "12mm",
    },
    displayHeaderFooter: true,
    footerTemplate: renderFooterTemplate(),
  };

  const pdfBuffer = await generatePdf(file, options);
  return pdfBuffer;
}

function renderOnePagerHtml(input: OnePagerPdfInput): string {
  const templatePath = join(process.cwd(), "src", "templates", "onepager.html");
  const template = readFileSync(templatePath, "utf-8");

  return template
    .replaceAll("{{title}}", escapeHtml(input.title))
    .replaceAll("{{summary}}", renderSummaryHtml(input.summary));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderSummaryHtml(summary: string): string {
  const lines = summary.split(/\r?\n/);
  const parts: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      parts.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        parts.push("<ul>");
        inList = true;
      }
      const item = escapeHtml(line.slice(2).trim());
      parts.push(`<li>${item}</li>`);
      continue;
    }

    closeList();

    if (line.startsWith("### ")) {
      parts.push(`<h3>${escapeHtml(line.slice(4).trim())}</h3>`);
    } else if (line.startsWith("## ")) {
      parts.push(`<h2>${escapeHtml(line.slice(3).trim())}</h2>`);
    } else if (line.startsWith("# ")) {
      parts.push(`<h1>${escapeHtml(line.slice(2).trim())}</h1>`);
    } else {
      parts.push(`<p>${escapeHtml(line)}</p>`);
    }
  }

  closeList();
  return parts.join("\n");
}

function renderFooterTemplate(): string {
  return `
    <style>
      .footer {
        font-size: 8px;
        color: #666666;
        width: 100%;
        padding: 0 12mm;
        box-sizing: border-box;
      }
      .row {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
      .brand {
        font-weight: bold;
        color: #2c3e50;
      }
    </style>
    <div class="footer">
      <div class="row">
        <span class="brand">ANDRON Game</span>
      </div>
      <div class="row">
        <span>GIZLI © ANDRON Game 2026, Izinsiz paylasilamaz.</span>
        <span class="pageNumber"></span>
        <span>/</span>
        <span class="totalPages"></span>
      </div>
    </div>
  `;
}
