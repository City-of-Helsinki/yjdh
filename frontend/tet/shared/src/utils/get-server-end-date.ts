import { isEmpty } from 'shared/utils/string.utils';
import { furthestServerEndDate } from 'tet-shared/constants/furthest-end-date';

export default (dateString?: string): string => {
  // if end date is undetermined, return the furthest end date special value
  if (isEmpty(dateString)) {
    return furthestServerEndDate;
  }
  return dateString;
};
