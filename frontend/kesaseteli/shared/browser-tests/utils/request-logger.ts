import { escapeRegExp } from '@frontend/shared/src/utils/regex.utils';
import { RequestLogger } from 'testcafe';

import {
  BackendEndpoint,
  getBackendDomain,
} from '../../src/backend-api/backend-api';

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

export const filterLoggedRequests = (logger: RequestLogger): LoggedRequest[] =>
  logger.requests.map((request) => {
    if (
      request.request.url.endsWith('attachments/') &&
      request.request.method === 'post'
    ) {
      return {
        ...request,
        request: {
          ...request.request,
          body: '<CUT>',
        },
      };
    }
    if (request.request.url.endsWith(BackendEndpoint.EMPLOYER_APPLICATIONS)) {
      return {
        ...request,
        request: {
          ...request.request,
          body: '<CUT>',
        },
      };
    }
    return request;
  });

export default requestLogger;
