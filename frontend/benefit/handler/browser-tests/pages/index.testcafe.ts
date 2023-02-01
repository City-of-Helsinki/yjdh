import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import ApplicationList from '../page-model/ApplicationList';

import MainIngress from '../page-model/MainIngress';
import { getFrontendUrl } from '../utils/url.utils';
import { RequestMock } from 'testcafe';

const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

import jsonInProgressApplication from '../json/list-handling.json';
import jsonReceivedApplication from '../json/list-received.json';

const url = getFrontendUrl(`/`);

const mockHook = RequestMock()
  .onRequestTo(
    `${getBackendDomain()}/v1/handlerapplications/simplified_list/?status=handling,additional_information_needed&order_by=-submitted_at`
  )
  .respond(jsonInProgressApplication)
  .onRequestTo(
    `${getBackendDomain()}/v1/handlerapplications/simplified_list/?status=received&order_by=-submitted_at`
  )
  .respond(jsonReceivedApplication);

fixture('Index page')
  .page(url)
  .requestHooks(mockHook, requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('Index page has applications in states "received" and "handling"', async () => {
  const mainIngress = new MainIngress();
  await mainIngress.isLoaded();
  await mainIngress.hasHeading('Hakemukset', 'h1');

  const inProgressApplications = new ApplicationList(
    'handling,additional_information_needed'
  );
  await inProgressApplications.hasItemsListed();

  const receivedApplications = new ApplicationList('received');
  await receivedApplications.hasItemsListed();
  await receivedApplications.clickListedItemLink('Salinas Inc');
});
