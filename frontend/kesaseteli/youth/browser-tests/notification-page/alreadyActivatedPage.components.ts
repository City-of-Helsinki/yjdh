import TestController from 'testcafe';

import { getNotificationPageComponents } from './notificationPage.components';

export const getAlreadyActivatedPageComponents = async (t: TestController) =>
  getNotificationPageComponents(t, {
    headerText: /hups! vahvistuslinkki on jo aktivoitu/i,
  });
