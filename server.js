const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Force production mode for cPanel deployment
const dev = false; 
const app = next({ dev });
const handle = app.getRequestHandler();

// cPanel Passenger automatically passes PORT via process.env.PORT
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
