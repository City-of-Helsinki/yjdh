import TestController from 'testcafe';

import { getNotificationPageComponents } from './notificationPage.components';

export const getActivatedPageComponents = async (t: TestController) =>
  getNotificationPageComponents(t, {
    headerText: /kesäsetelisi on nyt aktivoitu/i,
  });
