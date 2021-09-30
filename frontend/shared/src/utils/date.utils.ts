import formatDateStr from 'date-fns/format';
import isFutureFn from 'date-fns/isFuture';
import { enGB as en, fi, sv } from 'date-fns/locale';
import parse from 'date-fns/parse';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

export const DATE_FORMATS = {
  DATE: 'dd.MM.yyyy',
  DATE_AND_TIME: 'dd.MM.yyyy. HH:mm',
  DATE_BACKEND: 'yyyy-MM-dd',
};

const locales: Record<Language, Locale> = { fi, sv, en };
/**
 * Format date string
 * @param date
 * @param format
 * @param locale
 * @returns {string}
 */
export const formatDate = (
  date: Date | number | null,
  format = DATE_FORMATS.DATE,
  locale: Language = DEFAULT_LANGUAGE
): string => {
  if (!date) {
    return '';
  }

  return formatDateStr(date, format, {
    locale: locales[locale],
  }).trim();
};

// TODO: remove format argument
export const parseDate = (date: string, format = DATE_FORMATS.DATE): Date => {
  let parseFormat = format;

  // dd.MM.yyyy
  if (/^(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.\d{4}$/.test(date)) {
    parseFormat = DATE_FORMATS.DATE;
  } else if (
    // yyyy-MM-dd
    /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/.test(date)
  ) {
    parseFormat = DATE_FORMATS.DATE_BACKEND;
  }

  return parse(date, parseFormat, new Date());
};

export const isFuture = (date: Date): boolean => isFutureFn(date);
