import { Selector } from 'testcafe';

export const getApplicationLinkByEmployeeName = (
  employeeName: string
): Selector => Selector('tr').filterVisible().withText(employeeName).find('a');
