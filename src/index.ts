import WebServer from './WebServer';

const server = new WebServer({ port: 3001 });
server.listen().catch(console.error);
