import { getEnvUrl } from '../utils/settings';
import { clearDataToPrintOnFailure } from '../utils/testcafe.utils';
import { getUrlUtils } from '../utils/url.utils';
import { getFrontPageComponents } from './frontPage.components';

let components: ReturnType<typeof getFrontPageComponents>;
let urlUtils: ReturnType<typeof getUrlUtils>;

fixture('Frontpage')
  .page(getEnvUrl('/'))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    components = getFrontPageComponents(t);
    urlUtils = getUrlUtils(t);
  });

test('Header is present', async () => {
  await components.header();
});
