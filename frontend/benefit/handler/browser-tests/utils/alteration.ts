import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';

export const navigateToAlterationTestApplication = async (
  t: TestController
): Promise<void> => {
  // Navigate to archive
  await t.click(Selector('a').withText(fi.header.navigation.archive));

  const applicationLink = Selector('td')
    .withText('Enkilö, Koeh')
    .sibling('td')
    .nth(0)
    .find('a');

  // Click on the application
  // If the link is on multiple lines, it's possible for the test runner to try to click the
  // middle point of its bounding box which may not actually trigger the link.
  // Thus, offset is used instead.
  await t.expect(applicationLink.visible).ok();
  await t.click(applicationLink, {
    offsetX: 10,
    offsetY: 10,
  });
};
