import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'dist');
const PORT = process.env.PORT || 8100;
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.map': 'application/json',
};

http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(ROOT, urlPath);
    try {
      const s = await stat(filePath);
      if (s.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      // Not a real file → SPA fallback to index.html (client-side routing)
      filePath = path.join(ROOT, 'index.html');
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(500);
    res.end('err: ' + e.message);
  }
}).listen(PORT, '127.0.0.1', () => console.log('SPA server on http://127.0.0.1:' + PORT));
