import TestController from 'testcafe';

import { getNotificationPageComponents } from './notificationPage.components';

export const getEmailInUsePageComponents = async (t: TestController) =>
  getNotificationPageComponents(t, {
    headerText: /hups!/i,
  });
