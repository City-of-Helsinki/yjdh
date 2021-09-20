import formatDateStr from 'date-fns/format';
import isFutureFn from 'date-fns/isFuture';
import isValid from 'date-fns/isValid';
import { enGB as en, fi, sv } from 'date-fns/locale';
import parse from 'date-fns/parse';

import { DATE_BACKEND_REGEX, DATE_UI_REGEX } from '../constants';
import { DEFAULT_LANGUAGE, Language } from '../i18n/i18n';

export const DATE_FORMATS = {
  UI_DATE: 'd.M.yyyy',
  DATE_AND_TIME: 'd.M.yyyy. HH:mm',
  BACKEND_DATE: 'yyyy-MM-dd',
};

const locales: Record<Language, Locale> = { fi, sv, en };

export const isValidDate = (date?: string | number | Date | null): boolean =>
  date ? isValid(new Date(date)) : false;

// https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
export const isDateObject = (date?: unknown): boolean =>
  Object.prototype.toString.call(date) === '[object Date]';

/**
 * Format date string
 * @param date
 * @param format
 * @param locale
 * @returns {string}
 */
export const formatDate = (
  date?: Date | number | null,
  format = DATE_FORMATS.UI_DATE,
  locale: Language = DEFAULT_LANGUAGE
): string => {
  if (!date || !isValidDate(date)) {
    return '';
  }

  return formatDateStr(date, format, {
    locale: locales[locale],
  }).trim();
};

const getFormat = (dateAsString: string): string | undefined => {
  if (DATE_UI_REGEX.test(dateAsString)) {
    return DATE_FORMATS.UI_DATE;
  }
  if (DATE_BACKEND_REGEX.test(dateAsString)) {
    return DATE_FORMATS.BACKEND_DATE;
  }
  return undefined;
};

export const parseDate = (dateAsString?: string): Date | undefined => {
  if (!dateAsString) {
    return undefined;
  }
  const format = getFormat(dateAsString);
  if (!format) {
    return undefined;
  }
  return parse(dateAsString, format, new Date());
};

export const isFuture = (date: Date): boolean => isFutureFn(date);

export const convertDateFormat = (
  date: string | Date | number | undefined,
  toFormat = DATE_FORMATS.BACKEND_DATE
): string => {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  return formatDate(parsedDate, toFormat);
};

export const convertToUIDateFormat = (
  date: string | Date | number | undefined
): string => convertDateFormat(date, DATE_FORMATS.UI_DATE);
export const convertToBackendDateFormat = (
  date: string | Date | number | undefined
): string => convertDateFormat(date, DATE_FORMATS.BACKEND_DATE);
