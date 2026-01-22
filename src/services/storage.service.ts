import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

export type StorePdfInput = {
  buffer: Buffer;
  fileName: string;
  publicBaseUrl?: string;
};

export type StorePdfResult = {
  path: string;
  url?: string;
};

export async function storePdf(
  input: StorePdfInput
): Promise<StorePdfResult> {
  const outputDir = join(process.cwd(), "storage");
  mkdirSync(outputDir, { recursive: true });

  const safeFileName = input.fileName.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
  const outputPath = join(outputDir, safeFileName);
  writeFileSync(outputPath, input.buffer);

  const url = input.publicBaseUrl
    ? `${input.publicBaseUrl}/storage/${safeFileName}`
    : undefined;

  return {
    path: outputPath,
    url,
  };
}
