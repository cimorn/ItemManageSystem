const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 8000;

const server = http.createServer((req, res) => {
    console.log(`Requested URL: ${req.url}`);
    const parsedUrl = url.parse(req.url);
    const fileName = parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname;
    const filePath = path.join(__dirname, fileName);
    console.log(`Serving file: ${filePath}`);

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1>');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});