import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getFrontendUrl } from '../utils/url.utils';
import { RequestMock } from 'testcafe';
import ApplicationReview from '../page-model/ApplicationReview';
import fi from '../../public/locales/fi/common.json';
import responseReceivedApplication from '../json/single-received.json';
import responseToHandleApplication from '../json/single-handling.json';
import ActionBarReceived from '../page-model/ActionBarReceived';
import ActionBarHandling from '../page-model/ActionBarHandling';
import handlerUser from '../utils/handlerUser';

const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const applicationId = '87621891-6473-4185-92f3-8a87820a3998';

let states = [
  'received',
  'handling',
  'handling',
  'handling',
  'handling',
].reverse();

const mock = RequestMock()
  .onRequestTo(`${getBackendDomain()}/v1/handlerapplications/${applicationId}/`)
  .respond((req, res) => {
    console.log(req, res);
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
  .page(getFrontendUrl('/fi/login'))
  .requestHooks(mock)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
    await t.navigateTo(url);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('Page has a single application and is changed from "received" to "handling"', async () => {
  const applicationReview = new ApplicationReview();
  await applicationReview.isLoaded();

  const headings = [
    fi.review.headings.heading1,
    fi.review.headings.heading2,
    fi.review.headings.heading3,
    fi.review.headings.heading4,
    fi.review.headings.heading5,
    fi.review.headings.heading6,
    fi.review.headings.heading7,
    fi.review.headings.heading8,
    fi.review.headings.heading9,
  ];

  for (const heading of headings) {
    await applicationReview.hasHeading(heading, 'h2');
  }

  const receivedActionBar = new ActionBarReceived();
  await receivedActionBar.clickHandleButton();

  const handlingActionBar = new ActionBarHandling();
  await handlingActionBar.isLoaded();
  await handlingActionBar.clickSaveAndContinueButton();
});
