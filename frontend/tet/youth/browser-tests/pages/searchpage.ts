import { Selector, t } from 'testcafe';

class Searchpage {
  searchInput = Selector('input').withAttribute('placeholder', /kirjoita hakusana/i);

  workMethodButton = Selector('#workMethod-toggle-button');

  startDate = Selector('#start_time');

  endDate = Selector('#end_time');

  selectLanguageButton = Selector('#language-toggle-button');

  searchTags = Selector('#searchTags');

  searchTagButton = Selector('#hds-tag > button');

  removeAllSearchesButton = Selector('#removeAllSearches');

  submitButton = Selector('button').withText('Etsi');

  readMoreButton = Selector('button').withText('Lue lisää');

  fillSearch = (query: string) => t.typeText(this.searchInput, query);

  search = () => t.click(this.submitButton);

  removeAllSearches = () => t.click(this.removeAllSearchesButton);

  // This doesn't currently work because the value in `SearchInput` is always empty and the
  // searched string is shown as a tag
  assertSearchTerm = (searchTerm: string) => t.expect(this.searchInput.value).eql(searchTerm, 'Search term matches');

  async assertTags(labels: string[]): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const label of labels) {
      // eslint-disable-next-line no-await-in-loop
      await t.expect(this.searchTags.withText(new RegExp(label, 'i')).exists).ok();
    }

    await t.expect(this.searchTags.find('.searchTag').count).eql(labels.length, 'correct amount of tags');
  }

  selectWorkMethod = (text: string) =>
    t.click(this.workMethodButton).click(Selector('li').withText(new RegExp(text, 'i')));

  selectLanguage = (text: string) =>
    t.click(this.selectLanguageButton).click(Selector('li').withText(new RegExp(text, 'i')));

  fillDates = (startDate: string, endDate: string) =>
    t.typeText(this.startDate, startDate).typeText(this.endDate, endDate);

  removeTag = () => t.click(this.searchTagButton);

  goToPosting = () => t.click(this.readMoreButton);
}

export default new Searchpage();
