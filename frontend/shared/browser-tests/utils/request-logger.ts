import { RequestLogger } from 'testcafe';

import { isValidJsonString } from '../../src/utils/regex.utils';

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

const getShortenedHeadersString = (
  headers: Record<string, string> | string
): string => {
  const headersJson =
    typeof headers === 'string' ? headers : JSON.stringify(headers, null, 2);
  if (headersJson.length > 5000) {
    return `${headersJson.slice(0, 5000)}...${
      headers === 'string' ? '' : '\n}'
    }`;
  }
  return headersJson;
};

const getShortenedBodyString = (body: string | Buffer): string => {
  if (typeof body !== 'string' || !isValidJsonString(body)) {
    return '<Blob>';
  }
  if (body.length > 5000) {
    return `${body.slice(0, 5000)}...`;
  }
  return body;
};

type FilteredLoggedRequest = Omit<LoggedRequest, 'request' | 'response'> & {
  request: {
    headers: string;
  };
  response: {
    headers: string;
  };
};

export const filterLoggedRequests = (
  logger: RequestLogger
): FilteredLoggedRequest[] =>
  logger.requests.map((request: LoggedRequest) => ({
    ...request,
    request: {
      ...request.request,
      headers: getShortenedHeadersString(request.request?.headers),
      body: getShortenedBodyString(request.request?.body),
    },
    response: {
      ...request.response,
      headers: getShortenedHeadersString(request.response?.headers),
      body: getShortenedBodyString(request.response?.body),
    },
  }));

export default requestLogger;
