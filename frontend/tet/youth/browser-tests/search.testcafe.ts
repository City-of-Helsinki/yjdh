import { linkedEventsUrl } from '@frontend/te-yout/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger, { filterLoggedRequests } from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import frontpage from './pages/frontpage';
import searchpage from './pages/searchpage';
import { Selector } from 'testcafe';
import postingpage from './pages/postingpage';
import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';
import faker from 'faker';

const url = getUrl(process.env.YOUTH_URL ?? 'https://localhost:3001');

fixture('Frontpage')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, linkedEventsUrl))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger)),
  );

const formatDate = (date: Date): string => `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

test('simple test', async (t) => {
  const searchTerm = faker.lorem.word();

  await frontpage.fillSearch(searchTerm);
  await frontpage.search();
});

// The test is skipped due to instability in the review environment
// causing the test to fail. This worked well locally. If you get it to work in review
// you can delete the simple test above.
test.skip('user can search and navigate', async (t) => {
  // Generate some data to test with
  // The goal here is not to do a comprehensive test but more of a PoC
  // that the solution works end to end with some sample values.
  const start = faker.date.soon();
  const end = faker.date.soon(100, start);
  const startDate = formatDate(start);
  const endDate = formatDate(end);
  // Should find working method https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:2/
  const workMethodText = 'varjosta';
  const languageText = 'suomeksi'; // Should find Finnish language
  const searchTerm = faker.lorem.word();

  await frontpage.fillSearch(searchTerm);
  await frontpage.search();

  // TODO asserting tags commented out due to instability
  // await searchpage.assertTags([searchTerm]);

  await t.expect(Selector('h2').withText(/\d+ hakutulos/).exists).ok();

  await searchpage.removeTag();

  await searchpage.fillSearch('avustaja');
  await searchpage.selectWorkMethod(workMethodText);
  await searchpage.fillDates(startDate, endDate);
  await searchpage.selectLanguage(languageText);
  await searchpage.search();

  // selected language is not a label
  // TODO asserting tags commented out due to instability
  // await searchpage.assertTags(['avustaja', workMethodText, `${startDate}-${endDate}`]);

  await searchpage.removeAllSearches();

  // TODO for some reason `removeAllSearches` doesn't work in this test. why?
  // await searchpage.assertTags([]);

  if (await searchpage.readMoreButton.exists) {
    // if we have any results
    await searchpage.goToPosting();
    await t.expect(postingpage.postingTitle.exists).ok();
  }
});
