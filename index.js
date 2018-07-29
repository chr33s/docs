'use strict';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const { PORT = 8080 } = process.env;
const INDEX = 'index.html';

const file = uri => {
  let file = url.parse(uri).pathname;
  file = file.replace(/^(\.)+/, '.'); // prevent XSS
  file = `./${file}`;

  if (
    fs.existsSync(file) &&
    fs.statSync(file).isDirectory() &&
    fs.existsSync(`${file}/${INDEX}`)
  ) {
    file += INDEX;
  }

  return file;
};

const ext = file => {
  let { ext } = path.parse(file);
  ext = ext.substr(1);

  return ext;
};

const mimes = {
  css: 'text/css',
  html: 'text/html',
  ico: 'image/x-icon',
  js: 'text/javascript',
  md: 'text/markdown',
  svg: 'image/svg+xml'
};

const mime = file => {
  return mimes[ext(file)] || 'text/plain';
};

const server = http.createServer((req, res) => {
  let uri = file(req.url);

  res.setHeader('Content-type', mime(uri));

  if (!fs.existsSync(uri) || !fs.statSync(uri).isFile()) {
    res.writeHead(404);
    res.end('Not Found');

    return;
  }

  res.end(fs.readFileSync(uri));
});

if (!module.parent) {
  server.listen(PORT);
}

module.exports = server;
