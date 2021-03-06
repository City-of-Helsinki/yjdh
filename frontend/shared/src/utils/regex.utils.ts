export const getDecimalNumberRegex = (decimals: number): RegExp =>
  // eslint-disable-next-line security/detect-unsafe-regex, security/detect-non-literal-regexp
  new RegExp(`^\\d{1,6}(\\.\\d{1,${decimals}})?$`);

// Why isn't this built into JavaScript? There is a proposal to add such a function to RegExp, but it was rejected by TC39.
// eslint-disable-next-line no-secrets/no-secrets
// Read more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
export const escapeRegExp = (unescapedString: string, flags?: string): RegExp =>
  // eslint-disable-next-line security/detect-non-literal-regexp
  new RegExp(
    unescapedString.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&'),
    flags ?? 'i'
  );

export const stripHtmlTags = (html: string): string =>
  html.replace(/<\/?[^>]+(>|$)/g, '');

// How to check if a string is a valid JSON string?
// https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string
export const isValidJsonString = (str: string): boolean =>
  typeof str === 'string' &&
  /^[\s,:\]{}]*$/.test(
    str
      .replace(/\\["/\\bfnrtu]/g, '@')
      .replace(
        // eslint-disable-next-line security/detect-unsafe-regex
        /"[^\n\r"\\]*"|true|false|null|-?\d+(?:\.\d*)?(?:[Ee][+-]?\d+)?/g,
        ']'
      )
      // eslint-disable-next-line security/detect-unsafe-regex
      .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
  );
