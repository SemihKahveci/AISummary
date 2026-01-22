import type { OnePagerResponse } from "../api/onepager.routes";

const cache = new Map<string, OnePagerResponse>();

export function getCachedResult(requestId: string): OnePagerResponse | null {
  return cache.get(requestId) ?? null;
}

export function setCachedResult(
  requestId: string,
  result: OnePagerResponse
): void {
  cache.set(requestId, result);
}
