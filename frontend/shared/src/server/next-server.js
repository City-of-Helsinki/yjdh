import express from 'express';
import next from 'next';

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const RESPONSES = {
  OK: 'OK',
  SERVER_IS_NOT_READY: 'SERVER_IS_NOT_READY',
};

let serverIsReady = false;

const signalReady = () => {
  serverIsReady = true;
};

const checkIsServerReady = (res) => {
  if (serverIsReady) {
    res.send(RESPONSES.OK);
  } else {
    res.status(503).send(RESPONSES.SERVER_IS_NOT_READY);
  }
};

const startHttpsServer = async (server) => {
  const { readFile } = await import('fs/promises');
  const https = await import('https');
  // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-module.md
  const httpsOptions = {
    key: await readFile(
      new URL('../../certificates/localhost.key', import.meta.url)
    ),
    cert: await readFile(
      new URL('../../certificates/localhost.crt', import.meta.url)
    ),
  };
  await https.createServer(httpsOptions, server).listen(port);
  console.log(`> Ready on https://localhost:${port}`); // eslint-disable-line no-console
};

(async () => {
  await app.prepare();
  const server = express();

  server.get('/healthz', (req, res) => {
    checkIsServerReady(res);
  });

  server.get('/readiness', (req, res) => {
    checkIsServerReady(res);
  });

  server.get('*', (req, res) => handle(req, res));

  if (dev) {
    await startHttpsServer(server);
  } else {
    await server.listen(port);
    console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console
  }

  signalReady();
})();
