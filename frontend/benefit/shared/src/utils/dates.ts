import {
  APPLICATION_START_DATE,
  BENEFIT_TYPES,
} from 'benefit-shared/constants';
import {
  addMonths,
  isAfter,
  isEqual,
  isFuture,
  parse,
  startOfDay,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import { parseDate } from 'shared/utils/date.utils';

export const getMinEndDate = (
  startDate: string | undefined,
  benefitType: BENEFIT_TYPES | undefined | ''
): Date => {
  const parsedStartDate = parseDate(startDate) ?? APPLICATION_START_DATE;

  switch (benefitType) {
    case BENEFIT_TYPES.EMPLOYMENT:
    case BENEFIT_TYPES.SALARY:
      return subDays(addMonths(parsedStartDate, 1), 1);

    case BENEFIT_TYPES.COMMISSION:
    default:
      return parsedStartDate;
  }
};

export const getMaxEndDate = (
  startDate: string | undefined,
  benefitType: BENEFIT_TYPES | undefined | ''
): Date | undefined => {
  const parsedStartDate = parseDate(startDate) ?? APPLICATION_START_DATE;

  switch (benefitType) {
    case BENEFIT_TYPES.EMPLOYMENT:
    case BENEFIT_TYPES.SALARY:
      return subDays(addMonths(parsedStartDate, 12), 1);

    case BENEFIT_TYPES.COMMISSION:
    default:
      return undefined;
  }
};

export const validateFinnishDatePattern = (value = ''): boolean =>
  /^([1-9]|[12]\d|3[01])\.([1-9]|1[0-2])\.20\d{2}/.test(value);

export const validateDateIsFromCurrentYearOnwards = (
  value: string
): boolean => {
  if (!value || value.length < 8) return false;

  const isFinnishDate = validateFinnishDatePattern(value);
  const date = isFinnishDate
    ? parse(value, 'd.M.yyyy', new Date())
    : parseDate(value);

  if (!date || !date?.toJSON()) {
    return false;
  }
  return date ? date >= startOfYear(new Date()) : false;
};

export const validateIsTodayOrPastDate = (value: string): boolean => {
  if (!value || value.length < 8) return false;

  const isFinnishDate = validateFinnishDatePattern(value);
  const date = isFinnishDate
    ? parse(value, 'd.M.yyyy', new Date())
    : parseDate(value);

  if (!date || !date?.toJSON() || isFuture(date)) {
    return false;
  }
  return true;
};

export const validateDateWithinMonths = (
  value: string,
  months: number
): boolean => {
  const isFinnishDate = validateFinnishDatePattern(value);
  const date = isFinnishDate
    ? parse(value, 'd.M.yyyy', new Date())
    : parseDate(value);

  if (!date || !date?.toJSON()) {
    return false;
  }
  const startOfDayDate = startOfDay(date);
  const nMonthsAgo = startOfDay(subMonths(new Date(), months));
  return (
    isEqual(startOfDayDate, nMonthsAgo) || isAfter(startOfDayDate, nMonthsAgo)
  );
};
