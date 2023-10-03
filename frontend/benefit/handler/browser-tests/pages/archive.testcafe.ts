import requestLogger from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { RequestMock } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import jsonArchivedList from '../json/list-archived.json';
import ApplicationList from '../page-model/ApplicationList';
import MainIngress from '../page-model/MainIngress';
import handlerUser from '../utils/handlerUser';
import { getBackendDomain, getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/archive');

const mockHook = RequestMock()
  .onRequestTo(
    `${getBackendDomain()}/v1/handlerapplications/simplified_list/?status=accepted,rejected,cancelled&order_by=-handled_at&filter_archived=1`
  )
  .respond(jsonArchivedList);

fixture('Archive')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
  })
  .requestHooks(mockHook, requestLogger);

test('Archive has applications in state "accepted", "rejected" and "cancelled"', async () => {
  const mainIngress = new MainIngress(fi.header.navigation.archive, 'h1');
  await mainIngress.isVisible();

  const archivedApplications = new ApplicationList(['archived']);
  await archivedApplications.hasItemsListed(4);
});
