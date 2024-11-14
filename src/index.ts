import WebServer from './WebServer';

const server = new WebServer({ port: 3001 });
server.start().catch(console.error);
