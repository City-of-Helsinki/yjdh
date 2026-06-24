export const maskitoExpressionFromLegacyFormat = (
  format: string
): Array<RegExp | string> =>
  [...format].map((token) => {
    const tokenMap: Record<string, RegExp> = {
      a: /[A-Za-z]/,
      A: /[A-Za-z]/,
      '*': /[\dA-Za-z]/,
      '9': /\d/,
    };

    return tokenMap[token] ?? token;
  });
