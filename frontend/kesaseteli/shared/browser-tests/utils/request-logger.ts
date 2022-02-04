import { RequestLogger } from 'testcafe';

import { getBackendDomain } from '../../src/backend-api/backend-api';

const requestLogger = RequestLogger(
  { url: new RegExp(getBackendDomain()), isAjax: true },
  {
    logRequestHeaders: true,
    logResponseHeaders: true,
    logRequestBody: true,
    logResponseBody: true,
    stringifyRequestBody: true,
    stringifyResponseBody: true,
  }
);

export default requestLogger;
