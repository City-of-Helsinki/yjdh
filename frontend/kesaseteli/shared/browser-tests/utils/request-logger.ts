import { escapeRegExp } from '@frontend/shared/src/utils/regex.utils';
import { RequestLogger } from 'testcafe';

import { getBackendDomain } from '../../src/backend-api/backend-api';

const requestLogger = RequestLogger(
  { url: escapeRegExp(getBackendDomain()), isAjax: true },
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
