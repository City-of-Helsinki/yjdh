import {
  APPLICATION_START_DATE,
  BENEFIT_TYPES,
} from 'benefit/applicant/constants';
import add from 'date-fns/add';
import isValid from 'date-fns/isValid';
import { parseDate } from 'shared/utils/date.utils';

export const getMinEndDate = (
  startDate: string | undefined,
  benefitType: BENEFIT_TYPES | undefined | ''
): Date => {
  let months = 0;
  let days = 0;

  if (
    benefitType === BENEFIT_TYPES.EMPLOYMENT ||
    benefitType === BENEFIT_TYPES.SALARY
  ) {
    months = 1;
    days = -1;
  }
  const parsedStartDate = parseDate(startDate);

  return add(
    parsedStartDate && isValid(parsedStartDate)
      ? parsedStartDate
      : APPLICATION_START_DATE,
    {
      months,
      days,
    }
  );
};

export const getMaxEndDate = (
  startDate: string | undefined,
  benefitType: BENEFIT_TYPES | undefined | ''
): Date | undefined => {
  if (!benefitType || benefitType === BENEFIT_TYPES.COMMISSION) {
    return undefined;
  }

  let months = 0;
  let days = 0;

  if (
    benefitType === BENEFIT_TYPES.EMPLOYMENT ||
    benefitType === BENEFIT_TYPES.SALARY
  ) {
    months = 12;
    days = -1;
  }
  const parsedStartDate = parseDate(startDate);

  return add(
    parsedStartDate && isValid(parsedStartDate)
      ? parsedStartDate
      : APPLICATION_START_DATE,
    {
      months,
      days,
    }
  );
};
