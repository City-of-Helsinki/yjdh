import TestController from 'testcafe';

import { getNotificationPageComponents } from './notificationPage.components';

export const getAlreadyAssignedPageComponents = async (t: TestController) =>
  getNotificationPageComponents(t, {
    headerText: /hups! antamallasi tiedoilla on jo myönnetty kesäseteli/i,
  });
