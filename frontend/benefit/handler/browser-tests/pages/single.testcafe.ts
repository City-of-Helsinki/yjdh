import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { RequestMock } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import responseToHandleApplication from '../json/single-handling.json';
import responseReceivedApplication from '../json/single-received.json';
import ActionBarHandling from '../page-model/ActionBarHandling';
import ActionBarReceived from '../page-model/ActionBarReceived';
import ApplicationReview from '../page-model/ApplicationReview';
import handlerUser from '../utils/handlerUser';
import { getFrontendUrl } from '../utils/url.utils';

const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

const applicationId = '87621891-6473-4185-92f3-8a87820a3998';

const states = [
  'received',
  'handling',
  'handling',
  'handling',
  'handling',
].reverse();

const mock = RequestMock()
  .onRequestTo(`${getBackendDomain()}/v1/handlerapplications/${applicationId}/`)
  .respond((_, res) => {
    if (states.pop() === 'received') {
      res.setBody(responseReceivedApplication);
    } else if (states.pop() === 'handling') {
      res.setBody(responseToHandleApplication);
    } else {
      res.setBody({});
    }
  });

const url = getFrontendUrl(`/application?id=${applicationId}`);

fixture('Single application')
  .page(url)
  .requestHooks(mock, requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
  });

test('Page has a single application', async () => {
  const applicationReview = new ApplicationReview();
  await applicationReview.isLoaded();

  const headings = [
    fi.review.headings.heading1,
    fi.review.headings.heading2,
    fi.review.headings.heading3,
    fi.review.headings.heading4,
    fi.review.headings.heading5,
    fi.review.headings.heading7,
    fi.review.headings.heading8,
    fi.review.headings.heading9,
  ];

  for (const heading of headings) {
    await applicationReview.hasHeading(heading, 'h2');
  }
});

test.skip('Application is changed from "received" to "handling', async () => {
  const applicationReview = new ApplicationReview();
  await applicationReview.isLoaded();

  const receivedActionBar = new ActionBarReceived();
  await receivedActionBar.clickHandleButton();

  const handlingActionBar = new ActionBarHandling();
  await handlingActionBar.isLoaded();
  await handlingActionBar.clickSaveAndContinueButton();
});
