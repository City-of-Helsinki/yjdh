import { isValidJsonString } from '@frontend/shared/src/utils/regex.utils';
import { RequestLogger } from 'testcafe';

const requestLogger = RequestLogger(
  { url: /^https:\/\/(?:(?!_next).)*$/, isAjax: true },
  {
    logRequestHeaders: true,
    logResponseHeaders: true,
    logRequestBody: true,
    logResponseBody: true,
    stringifyRequestBody: true,
    stringifyResponseBody: true,
  }
);

const getShortenedBodyString = (body: string | Buffer): string => {
  if (typeof body !== 'string' || !isValidJsonString(body)) {
    return '<Blob>';
  }
  if (body.length > 5000) {
    return `${body.slice(0, 5000)}...`;
  }
  return body;
};

export const filterLoggedRequests = (logger: RequestLogger): LoggedRequest[] =>
  logger.requests.map((request) => ({
    ...request,
    request: {
      ...request.request,
      body: getShortenedBodyString(request.request.body),
    },
    response: {
      ...request.response,
      body: getShortenedBodyString(request.response.body),
    },
  }));

export default requestLogger;
