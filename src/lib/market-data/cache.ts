type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number): T {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function getStaleCached<T>(key: string): { value: T; expired: boolean } | null {
  const entry = store.get(key);
  if (!entry) return null;
  return {
    value: entry.value as T,
    expired: Date.now() > entry.expiresAt,
  };
}

export function clearCacheKey(key: string): void {
  store.delete(key);
}

export function clearAllCache(): void {
  store.clear();
}

/** In-flight request deduplication for identical upstream calls. */
const inflight = new Map<string, Promise<unknown>>();

export async function dedupeRequest<T>(
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const promise = factory().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}
