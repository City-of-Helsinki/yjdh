import {
  APPLICATION_START_DATE,
  BENEFIT_TYPES,
} from 'benefit-shared/constants';
import addMonths from 'date-fns/addMonths';
import isAfter from 'date-fns/isAfter';
import isEqual from 'date-fns/isEqual';
import isFuture from 'date-fns/isFuture';
import parse from 'date-fns/parse';
import startOfDay from 'date-fns/startOfDay';
import startOfYear from 'date-fns/startOfYear';
import subDays from 'date-fns/subDays';
import subMonths from 'date-fns/subMonths';
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

export const getDateFromDateString = (value: string): Date | null => {
  if (!value || value.length < 8) {
    return null;
  }

  const isFinnishDate = validateFinnishDatePattern(value);
  const date = isFinnishDate
    ? parse(value, 'd.M.yyyy', new Date())
    : parseDate(value);

  if (!date || !date?.toJSON()) {
    return null;
  }

  return date;
};

export const validateDateIsFromCurrentYearOnwards = (
  value: string
): boolean => {
  const date = getDateFromDateString(value);

  return date ? date >= startOfYear(new Date()) : false;
};

export const validateIsTodayOrPastDate = (value: string): boolean => {
  const date = getDateFromDateString(value);

  if (!date || isFuture(date)) {
    return false;
  }
  return true;
};

export const validateDateWithinMonths = (
  value: string,
  months: number
): boolean => {
  const date = getDateFromDateString(value);

  if (!date) {
    return false;
  }
  const startOfDayDate = startOfDay(date);
  const nMonthsAgo = startOfDay(subMonths(new Date(), months));
  return (
    isEqual(startOfDayDate, nMonthsAgo) || isAfter(startOfDayDate, nMonthsAgo)
  );
};

export const validateIsAfterOrOnDate = (
  value: string,
  otherValue: string
): boolean => {
  const date = getDateFromDateString(value);
  const otherDate = getDateFromDateString(otherValue);

  if (!date || !otherDate || date < otherDate) {
    return false;
  }
  return true;
};

export const validateIsBeforeOrOnDate = (
  value: string,
  otherValue: string
): boolean => {
  const date = getDateFromDateString(value);
  const otherDate = getDateFromDateString(otherValue);

  if (!date || !otherDate || date > otherDate) {
    return false;
  }
  return true;
};
