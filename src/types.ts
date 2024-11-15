export interface AppStorage {
  upload(key: string, value: string): Promise<void>;
  download(key: string): Promise<string | null>;
}
