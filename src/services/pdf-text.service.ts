import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-"));
  const pdfPath = path.join(dir, "in.pdf");
  const txtPath = path.join(dir, "out.txt");

  try {
    await fs.writeFile(pdfPath, buffer);
    await execFileAsync("pdftotext", ["-layout", pdfPath, txtPath], {
      timeout: 60_000,
    });
    const text = await fs.readFile(txtPath, "utf8");
    return text;
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
