import TestController from 'testcafe';

import { getNotificationPageComponents } from './notificationPage.components';

export const getEmailInUsePaegComponents = async (t: TestController) =>
  getNotificationPageComponents(t, {
    headerText: /hups!/i,
  });
