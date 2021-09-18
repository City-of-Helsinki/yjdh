export const getDecimalNumberRegex = (decimals: number): RegExp =>
  // eslint-disable-next-line security/detect-unsafe-regex, security/detect-non-literal-regexp
  new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`);
