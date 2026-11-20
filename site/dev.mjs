// Local preview of site/dist.
//
//   node site/build.mjs && node site/dev.mjs [port]
//
// It serves the files the way Vercel does: a file when one exists, the
// document of the folder, 404.html for a missing file, and otherwise the
// application in the language of the path.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.argv[2]) || 4792;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/markdown', '.txt': 'text/plain', '.json': 'application/json', '.xml': 'application/xml' };
const isFile = (file) => fs.existsSync(file) && fs.statSync(file).isFile();

http
  .createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
    catch { res.statusCode = 400; return res.end(); }
    if (pathname.split(/[\/\\]/).some(part => part.startsWith('.'))) { res.statusCode = 404; return res.end(); }
    const wanted = path.join(dist, pathname);
    const file = wanted !== dist && !wanted.startsWith(dist + path.sep) ? null
      : isFile(wanted) ? wanted
      : isFile(path.join(wanted, 'index.html')) ? path.join(wanted, 'index.html')
      : /\.[a-zA-Z0-9]+$/.test(pathname) ? path.join(dist, '404.html')
      : path.join(dist, pathname.startsWith('/pt/') || pathname === '/pt' ? 'pt/index.html' : 'index.html');
    if (!file) { res.statusCode = 400; return res.end(); }
    if (file.endsWith(`${path.sep}404.html`)) res.statusCode = 404;
    res.setHeader('content-type', `${TYPES[path.extname(file)] || 'application/octet-stream'}; charset=utf-8`);
    res.end(fs.readFileSync(file));
  })
  .listen(port, () => console.log(`http://localhost:${port}`));
