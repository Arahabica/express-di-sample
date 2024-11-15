import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import WebServer from '../src/WebServer';
import MemoryStorage from '../src/storage/MemoryStorage';
import request from 'supertest';

describe('WebServer', () => {
  let webServer: WebServer;
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    webServer = new WebServer({ storage });
  });

  afterEach(async () => {
    await webServer.stop();
    storage.clear();
  });

  describe('start()', () => {
    it('should start server with specified port', async () => {
      const port = 3003;
      webServer = new WebServer({ storage }, { port });
      await webServer.start();
      expect(webServer.app()).toBeDefined();
      expect(webServer.runningPort()).toBe(port);
    });

    it('should start server with random port when port is not specified', async () => {
      await webServer.start();
      expect(webServer.app()).toBeDefined();
      expect(webServer.runningPort()).toBeGreaterThan(0);
    });

    it('should throw error when trying to access app before initialization', () => {
      expect(() => webServer.app()).toThrow('App is not initialized');
    });
  });

  describe('API endpoints', () => {
    beforeEach(async () => {
      await webServer.start();
    });

    describe('GET /', () => {
      it('should return Hello World', async () => {
        const response = await request(webServer.app())
          .get('/')
          .expect(200);
        
        expect(response.text).toBe('Hello World!');
      });
    });

    describe('GET /upload and /download', () => {
      it('should store and retrieve value', async () => {
        const key = 'testKey';
        const value = 'testValue';

        // Upload
        await request(webServer.app())
          .get('/upload')
          .query({ key, value })
          .expect(200);

        expect(await storage.download(key)).toBe(value);

        // Download
        const response = await request(webServer.app())
          .get('/download')
          .query({ key })
          .expect(200);

        expect(response.text).toBe(value);
      });

      it('should handle multiple key-value pairs', async () => {
        const pairs = [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
          { key: 'key3', value: 'value3' }
        ];

        // Upload all pairs
        for (const { key, value } of pairs) {
          await request(webServer.app())
            .get('/upload')
            .query({ key, value })
            .expect(200);
        }

        // Verify all pairs
        for (const { key, value } of pairs) {
          const response = await request(webServer.app())
            .get('/download')
            .query({ key })
            .expect(200);

          expect(response.text).toBe(value);
        }
      });

      it('should return Not found for non-existent key', async () => {
        const response = await request(webServer.app())
          .get('/download')
          .query({ key: 'nonexistentKey' })
          .expect(200);

        expect(response.text).toBe('Not found');
      });

      it('should overwrite existing value', async () => {
        const key = 'testKey';
        const originalValue = 'originalValue';
        const newValue = 'newValue';

        // Upload original value
        await request(webServer.app())
          .get('/upload')
          .query({ key, value: originalValue })
          .expect(200);

        // Upload new value
        await request(webServer.app())
          .get('/upload')
          .query({ key, value: newValue })
          .expect(200);

        // Verify new value
        const response = await request(webServer.app())
          .get('/download')
          .query({ key })
          .expect(200);

        expect(response.text).toBe(newValue);
      });
    });
  });
});
