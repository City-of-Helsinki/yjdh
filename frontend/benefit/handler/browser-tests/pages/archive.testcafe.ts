import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import ApplicationList from '../page-model/ApplicationList';
import { RequestMock } from 'testcafe';

import MainIngress from '../page-model/MainIngress';
import { getFrontendUrl } from '../utils/url.utils';

const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

const url = getFrontendUrl('/archive');
import jsonArchivedList from '../fixtures/list-archived.json';

const mockHook = RequestMock()
  .onRequestTo(
    `${getBackendDomain()}/v1/handlerapplications/simplified_list/?status=accepted,rejected,cancelled`
  )
  .respond(jsonArchivedList);

fixture('Archive')
  .page(url)
  .requestHooks(mockHook, requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('Archive has applications "handled"', async () => {
  const mainIngress = new MainIngress();

  await mainIngress.isLoaded();
  await mainIngress.hasHeading('Arkisto', 'h1');

  const archivedApplications = new ApplicationList('archived');
  await archivedApplications.hasItemsListed();
});
