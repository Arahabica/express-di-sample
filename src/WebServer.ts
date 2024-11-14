import express from 'express';
import type { Express, Request, Response } from 'express';
import type { Server } from 'http';

type WebServerConfig = {
  port?: number;
};

export default class WebServer {
  private readonly specifiedPort?: number;
  private expressApp: Express | undefined;
  private server: Server | undefined;

  constructor(config: WebServerConfig) {
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
      this.server = app
        .listen(specifiedPort || 0, () => {
          console.log('Server running at PORT: ', this.runningPort());
          resolve();
        })
        .on('error', reject);
      this.expressApp = app;
    });
  }

  stop(): void {
    const { server } = this;
    if (server) {
      server.close();
    }
  }

  private build(): Express {
    const app = express();
    app.get('/', (req: Request, res: Response) => {
      res.send('Hello World!');
    });
    return app;
  }
  private runningPort(): number | undefined {
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
