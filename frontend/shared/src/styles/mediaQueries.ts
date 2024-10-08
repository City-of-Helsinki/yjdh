export const breakpoints: { [key: string]: number } = {
  xs: 576,
  sm: 768,
  md: 1024,
  lg: 1200,
  xlg: 1600,
};

export const respondAbove =
  (key: keyof typeof breakpoints) =>
  (style: TemplateStringsArray | string): string =>
    `@media screen and (min-width: ${
      breakpoints[key]
    }px) { ${style.toString()} }`;

export const respondAbovePx =
  (px: string | number) =>
  (style: TemplateStringsArray | string): string =>
    `@media screen and (min-width: ${String(px).replace(
      'px',
      ''
    )}px) { ${style.toString()} }`;

export const respondBelow =
  (key: keyof typeof breakpoints) =>
  (style: TemplateStringsArray | string): string =>
    `@media screen and (max-width: ${
      breakpoints[key] - 1
    }px) { ${style.toString()} }`;

export const respondBetween =
  (min: keyof typeof breakpoints, max: keyof typeof breakpoints) =>
  (style: TemplateStringsArray | string): string =>
    `@media screen and (min-width: ${breakpoints[min]}px) and (max-width: ${
      breakpoints[max] - 1
    }px) { ${style.toString()} }`;
