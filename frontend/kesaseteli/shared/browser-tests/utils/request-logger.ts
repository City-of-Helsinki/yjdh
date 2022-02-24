import { escapeRegExp } from '@frontend/shared/src/utils/regex.utils';
import { RequestLogger } from 'testcafe';

import {
  BackendEndpoint,
  getBackendDomain,
} from '../../src/backend-api/backend-api';

// Type is determined here: https://testcafe.io/documentation/402769/reference/test-api/requestlogger/constructor#select-requests-to-be-handled-by-the-hook
type Request = {
  url: string;
  method: string;
  isAjax: boolean;
  body: string;
};

const requestLogger = RequestLogger(
  async (request: Request) =>
    // eslint-disable-next-line security/detect-non-literal-regexp
    new RegExp(escapeRegExp(getBackendDomain())).test(request.url) &&
    request.isAjax &&
    request.body.length <= 5000 &&
    (!request.url.endsWith(BackendEndpoint.EMPLOYER_APPLICATIONS) ||
      request.method !== 'get'),
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
