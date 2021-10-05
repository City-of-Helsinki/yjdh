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

  if (benefitType === BENEFIT_TYPES.EMPLOYMENT) {
    months = 1;
    days = -1;
  } else if (benefitType === BENEFIT_TYPES.SALARY) {
    months = 12;
    days = -1;
  }
  const parsedStartDate = parseDate(startDate);
  if (!parsedStartDate || !isValid(parsedStartDate)) {
    return add(APPLICATION_START_DATE, {
      months,
      days,
    });
  }

  return add(parsedStartDate, {
    months,
    days,
  });
};
