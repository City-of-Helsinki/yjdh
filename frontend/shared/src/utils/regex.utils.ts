export const getDecimalNumberRegex = (decimals: number): RegExp =>
  // eslint-disable-next-line security/detect-unsafe-regex, security/detect-non-literal-regexp
  new RegExp(`^\\d{1,6}(\\.\\d{1,${decimals}})?$`);

// Why isn't this built into JavaScript? There is a proposal to add such a function to RegExp, but it was rejected by TC39.
// eslint-disable-next-line no-secrets/no-secrets
// Read more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
export const escapeRegExp = (unescapedString: string, flags?: string): RegExp =>
  // eslint-disable-next-line security/detect-non-literal-regexp
  new RegExp(unescapedString.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&'), flags);
