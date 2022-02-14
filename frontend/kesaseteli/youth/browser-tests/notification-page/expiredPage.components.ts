import TestController from 'testcafe';

import { getNotificationPageComponents } from './notificationPage.components';

export const getExpiredPageComponents = async (t: TestController) =>
  getNotificationPageComponents(t, {
    headerText: /hups! vahvistuslinkki on vanhentunut./i,
  });
