import { format as formatDateStr, Locale, parse } from 'date-fns';
import { enGB as en, fi, sv } from 'date-fns/locale';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

export const DATE_FORMATS = {
  DATE: 'dd.MM.yyyy',
  DATE_AND_TIME: 'dd.MM.yyyy. mm:ss',
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

export const parseDate = (date: string, format = 'dd.MM.yyyy'): Date =>
  parse(date, format, new Date());
