import { format as formatDateStr } from 'date-fns';
import { enGB as en, fi, sv } from 'date-fns/locale';

const locales = { en, fi, sv };
/**
 * Format date string
 * @param date
 * @param format
 * @param locale
 * @returns {string}
 */
export const formatDate = (
  date: Date | number | null,
  format = 'dd.MM.yyyy',
  locale = 'fi'
): string => {
  if (!date) {
    return '';
  }

  return formatDateStr(date, format, {
    locale: locales[locale] as Locale,
  }).trim();
};
