const express = require('express');
const next = require('next');
const https = require('https');
const fs = require('fs');
const port = process.env.PORT || 3000;
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

const RESPONSES = {
  OK: 'OK',
  SERVER_IS_NOT_READY: 'SERVER_IS_NOT_READY',
};

let serverIsReady = false;

const signalReady = () => {
  serverIsReady = true;
};

const checkIsServerReady = (response) => {
  if (serverIsReady) {
    response.send(RESPONSES.OK);
  } else {
    response.status(503).send(RESPONSES.SERVER_IS_NOT_READY);
  }
};

(async () => {
  await app.prepare();

  const server = express();

  server.disable('x-powered-by');

  server.get('/healthz', (req, res) => {
    checkIsServerReady(res);
  });

  server.get('/readiness', (req, res) => {
    checkIsServerReady(res);
  });

  server.get('*', (req, res) => handle(req, res));

  if (process.env.NEXT_SERVE_WITH_CUSTOM_CERTS) {
    let options;
    try {
      options = {
        key: fs.readFileSync(
          process.cwd() + '/../../shared/src/server/localhost.key'
        ),
        cert: fs.readFileSync(
          process.cwd() + '/../../shared/src/server/localhost.crt'
        ),
      };
    } catch (e) {
      console.error(
        'No certificate file(s) found. Copy it from the local-proxy container.'
      );
      return;
    }
    https.createServer(options, server).listen(port);
  } else {
    await server.listen(port);
  }
  signalReady();
  console.log(`> Ready on https://localhost:${port}`); // eslint-disable-line no-console
})();
