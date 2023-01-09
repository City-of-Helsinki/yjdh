import { isEmpty } from 'shared/utils/string.utils';
import { furthestUiEndDate } from 'tet-shared/constants/furthest-end-date';

export default (dateString?: string): string => {
  // if date string represents the furthest end date special value,
  // then show empty value on ui
  if (isEmpty(dateString) || dateString === furthestUiEndDate) {
    return '';
  }
  return dateString;
};
