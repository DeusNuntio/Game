/** Minimal key/value persistence contract, so SaveManager works against localStorage, an in-memory fake for tests, or a future filesystem/cloud backend. */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
