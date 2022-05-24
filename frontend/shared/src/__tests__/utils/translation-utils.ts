import { escapeRegExp, stripHtmlTags } from '../../utils/regex.utils';

export const replaceValues = <T = string | number>(
  text: string,
  replace: Record<string, T>
): string =>
  Object.entries(replace).reduce(
    (result, [key, val]) =>
      result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'i'), String(val)),
    text
  );
export const containsRegexp = (text: string): RegExp =>
  escapeRegExp(stripHtmlTags(text), 'i');
