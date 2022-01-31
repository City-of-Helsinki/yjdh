import differenceInDays from 'date-fns/differenceInDays';
import formatDateStr from 'date-fns/format';
import isFutureFn from 'date-fns/isFuture';
import isValid from 'date-fns/isValid';
import { enGB as en, fi, sv } from 'date-fns/locale';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';

import { DATE_BACKEND_REGEX, DATE_UI_REGEX } from '../constants';
import { DEFAULT_LANGUAGE, Language } from '../i18n/i18n';
import { isString } from './type-guards';

export const DATE_FORMATS = {
  UI_DATE: 'd.M.yyyy',
  DATE_AND_TIME: 'd.M.yyyy. HH:mm',
  BACKEND_DATE: 'yyyy-MM-dd',
  UTC: 'yyyy-MM-ddTHH:mm:ss.sssZ',
};

const locales: Record<Language, Locale> = { fi, sv, en };

export const isValidDate = (date?: string | number | Date | null): boolean =>
  date ? isValid(new Date(date)) : false;

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
  if (isValidDate(parseISO(dateAsString))) {
    return DATE_FORMATS.UTC;
  }
  return undefined;
};

export const parseDate = (dateAsString?: string | null): Date | undefined => {
  if (!dateAsString) {
    return undefined;
  }
  const format = getFormat(dateAsString);
  if (!format) {
    return undefined;
  }
  if (format === DATE_FORMATS.UTC) {
    return parseISO(dateAsString);
  }
  return parse(dateAsString, format, new Date());
};

export const isFuture = (date: Date): boolean => isFutureFn(date);

export const convertDateFormat = (
  date: string | Date | number | undefined,
  toFormat = DATE_FORMATS.BACKEND_DATE
): string => {
  const parsedDate = isString(date) ? parseDate(date) : date;
  return formatDate(parsedDate, toFormat);
};

export const convertToUIDateFormat = (
  date: string | Date | number | undefined
): string => convertDateFormat(date, DATE_FORMATS.UI_DATE);

export const convertToBackendDateFormat = (
  date: string | Date | number | undefined
): string => convertDateFormat(date, DATE_FORMATS.BACKEND_DATE);

export const convertToUIDateAndTimeFormat = (
  date: string | Date | number | undefined
): string => convertDateFormat(date, DATE_FORMATS.DATE_AND_TIME);

export const diffDays = (
  dateLeft: Date | number,
  dateRight: Date | number
): number => {
  if (dateLeft === 0 || dateRight === 0) return 0;
  return Number((differenceInDays(dateLeft, dateRight) / 30).toFixed(2));
};
