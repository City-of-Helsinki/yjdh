import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { RequestMock } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import jsonInfoNeededApplication from '../json/list-additional_information_needed.json';
import jsonInProgressApplication from '../json/list-handling.json';
import jsonReceivedApplication from '../json/list-received.json';
import responseReceivedApplication from '../json/single-received.json';
import ApplicationList from '../page-model/ApplicationList';
import MainIngress from '../page-model/MainIngress';
import handlerUser from '../utils/handlerUser';
import { getBackendDomain, getFrontendUrl } from '../utils/url.utils';

const applicationId = '87621891-6473-4185-92f3-8a87820a3998';

const url = getFrontendUrl(`/`);
const status = {
  all: [
    'received',
    'handling',
    'additional_information_needed',
    'accepted',
    'draft',
    'rejected',
  ],
  received: ['received'],
  infoNeeded: ['additional_information_needed'],
};
const mockHook = RequestMock()
  .onRequestTo(
    `${getBackendDomain()}/v1/handlerapplications/simplified_list/?status=${status.all.join(
      ','
    )}&order_by=-submitted_at&exclude_batched=1`
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
  });

test.skip('Index page has applications', async () => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  const inProgressApplications = new ApplicationList(['all']);
  await inProgressApplications.hasItemsListed(20);

  // TODO: refactor to check tabs
  // const infoNeededApplications = new ApplicationList(status.infoNeeded);
  // await infoNeededApplications.hasItemsListed(3);

  // const receivedApplications = new ApplicationList(status.received);
  // await receivedApplications.hasItemsListed(8);
  await inProgressApplications.clickListedItemLink('Salinas Inc');
});
