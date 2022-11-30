import { convertToUIDateFormat } from 'shared/utils/date.utils';
/*
 * special value used as furthest possible end date
 */
export const furthestServerEndDate = '2999-12-31';
export const furthestUiEndDate = convertToUIDateFormat(furthestServerEndDate);
