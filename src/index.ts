import CloudStorage from './storage/CloudStorage';
import WebServer from './WebServer';

const storage = new CloudStorage();
const server = new WebServer({ storage }, { port: 3000 });
server.start().catch(console.error);
