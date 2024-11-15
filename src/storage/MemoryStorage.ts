import type { AppStorage } from '../types';

class MemoryStorage implements AppStorage {
  private storage: Map<string, string>;

  constructor() {
    this.storage = new Map<string, string>();
  }

  download(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      resolve(this.storage.get(key) || null);
    });
  }

  upload(key: string, value: string): Promise<void> {
    return new Promise((resolve) => {
      this.storage.set(key, value);
      resolve();
    });
  }

  clear(): void {
    this.storage.clear();
  }
}

export default MemoryStorage;
