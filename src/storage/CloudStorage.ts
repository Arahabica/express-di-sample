import type { AppStorage } from '../types';

class CloudStorage implements AppStorage {
  download(key: string): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  upload(key: string, value: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export default CloudStorage;
