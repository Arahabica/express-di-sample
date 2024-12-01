import express from 'express';
import type { Express, Request, Response } from 'express';
import type { Server } from 'http';
import { AppStorage } from './types';

type WebServerConfig = {
  port?: number;
};

type WebServerDependencies = {
  storage: AppStorage;
};

export default class WebServer {
  private expressApp: Express | undefined;
  private server: Server | undefined;
  private readonly specifiedPort?: number;
  private readonly storage: AppStorage;

  constructor(
    dependencies: WebServerDependencies,
    config: WebServerConfig = {},
  ) {
    this.storage = dependencies.storage;
    this.specifiedPort = config.port;
  }

  app(): Express {
    if (!this.expressApp) {
      throw new Error('App is not initialized');
    }
    return this.expressApp;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const { specifiedPort } = this;
      const app = this.build();

      const server = app.listen(specifiedPort || 0);
      this.server = server;
      this.expressApp = app;

      server
        .on('error', reject)
        .on('listening', () => {
          console.log('Server running at PORT: ', this.runningPort());
          resolve();
        });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      const { server } = this;
      if (!server) return resolve();
      server.close((err) => {
        if (err) return reject();
        resolve();
      });
    });
  }

  private build(): Express {
    const app = express();
    app.get('/', (req: Request, res: Response) => {
      res.send('Hello World!');
    });
    app.get('/upload', async (req: Request, res: Response) => {
      const { key, value } = req.query;
      await this.storage.upload(key as string, value as string);
      res.send('OK');
    });
    app.get('/download', async (req: Request, res: Response) => {
      const { key } = req.query;
      const value = await this.storage.download(key as string);
      res.send(value || 'Not found');
    });
    return app;
  }
  runningPort(): number | undefined {
    if (!this.server) {
      return undefined;
    }
    const address = this.server.address();
    if (address === null || typeof address === 'string') {
      return undefined;
    }
    return address.port;
  }
}
