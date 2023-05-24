import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import ApplicationList from '../page-model/ApplicationList';
import MainIngress from '../page-model/MainIngress';
import { getBackendDomain, getFrontendUrl } from '../utils/url.utils';
import { RequestMock } from 'testcafe';
import fi from '../../public/locales/fi/common.json';
import jsonInProgressApplication from '../json/list-handling.json';
import jsonReceivedApplication from '../json/list-received.json';
import jsonInfoNeededApplication from '../json/list-additional_information_needed.json';
import responseReceivedApplication from '../json/single-received.json';

import handlerUser from '../utils/handlerUser';
import { applicationId } from './single.testcafe';

const url = getFrontendUrl(`/`);
const status = {
  handling: ['handling'],
  received: ['received'],
  infoNeeded: ['additional_information_needed'],
};
const mockHook = RequestMock()
  .onRequestTo(
    `${getBackendDomain()}/v1/handlerapplications/simplified_list/?status=${status.handling.join(
      ','
    )}&order_by=-submitted_at`
  )
  .respond(jsonInProgressApplication)
  .onRequestTo(
    `${getBackendDomain()}/v1/handlerapplications/simplified_list/?status=${status.received.join(
      ','
    )}&order_by=-submitted_at`
  )
  .respond(jsonReceivedApplication)
  .onRequestTo(
    `${getBackendDomain()}/v1/handlerapplications/simplified_list/?status=${status.infoNeeded.join(
      ','
    )}&order_by=-submitted_at`
  )
  .respond(jsonInfoNeededApplication)
  .onRequestTo(`${getBackendDomain()}/v1/handlerapplications/${applicationId}/`)
  .respond((_, res) => {
    res.setBody(responseReceivedApplication);
  });

fixture('Index page')
  .page(url)
  .requestHooks(mockHook, requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('Index page has applications in states "received" and "handling"', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  const inProgressApplications = new ApplicationList(status.handling);
  await inProgressApplications.hasItemsListed(20);

  const infoNeededApplications = new ApplicationList(status.infoNeeded);
  await infoNeededApplications.hasItemsListed(3);

  const receivedApplications = new ApplicationList(status.received);
  await receivedApplications.hasItemsListed(8);
  await receivedApplications.clickListedItemLink('Salinas Inc');
});
