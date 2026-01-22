export function sanitizeText(input: string): string {
  return input.replaceAll(/\s+/g, " ").trim();
}

export function sanitizeSummary(input: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => line.replaceAll(/[ \t]+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}
