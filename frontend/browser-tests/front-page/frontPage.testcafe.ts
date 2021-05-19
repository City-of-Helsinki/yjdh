import { getEmployerUiUrl } from '../../shared/browser-tests/utils/settings';
import { clearDataToPrintOnFailure } from '../../shared/browser-tests/utils/testcafe.utils';
import { getUrlUtils } from '../../shared/browser-tests/utils/url.utils';
import { getPageLayoutComponents } from '../common-components/pageLayout.components';
import { getFrontPageComponents } from './frontPage.components';

let components: ReturnType<typeof getFrontPageComponents>;
let pageLayoutComponents: ReturnType<typeof getPageLayoutComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;

fixture('Frontpage')
  .page(getEmployerUiUrl('/'))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    components = getFrontPageComponents(t);
    pageLayoutComponents = getPageLayoutComponents(t);
    urlUtils = getUrlUtils(t);
  });

test('user can authenticate and logout', async () => {
  const header = await pageLayoutComponents.header();
  await header.actions.clickLoginbutton();
  await urlUtils.expectations.urlChangedToAuthorizationEndpoint();
  // TODO select user and wait for frontpage
});
