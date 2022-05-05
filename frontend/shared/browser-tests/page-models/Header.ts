import { Selector, t } from 'testcafe';

import TranslationsApi from '../../src/__tests__/types/translations';
import isRealIntegrationsEnabled from '../../src/flags/is-real-integrations-enabled';
import { Language } from '../../src/i18n/i18n';
import User from '../../src/types/user';
import TranslatedComponent, { CommonTranslations } from './TranslatedComponent';

class Header<
  Translations extends CommonTranslations
> extends TranslatedComponent<Translations> {
  public constructor(
    translationsApi: TranslationsApi<Translations>,
    lang?: Language
  ) {
    super(translationsApi, { lang, datatestId: 'header' });
  }

  private withinNavigationActions = this.within(
    Selector('div[class*="NavigationActions"]')
  );

  public getUserInfo(user?: User): string {
    return `${this.translations.header.userAriaLabelPrefix ?? ''} ${
      isRealIntegrationsEnabled() ? 'Mika Hietanen' : user?.name ?? ''
    }`;
  }

  private headerTitle = this.within(this.component.findByRole('banner'))
    .findAllByText(this.translations.appName)
    .nth(0);

  public async isLoaded(timeout?: number): Promise<void> {
    await super.isLoaded(timeout);
    return this.expect(this.headerTitle);
  }

  private languageSelector = this.withinNavigationActions.findByRole('button', {
    name: this.translations.header.languageMenuButtonAriaLabel,
  });

  private languageSelectorItem(toLang: Language): SelectorPromise {
    return this.withinNavigationActions.findByRole('link', {
      name: this.translations.languages[toLang],
    });
  }

  private loginButton = this.withinNavigationActions.findByRole('button', {
    name: this.translations.header?.loginLabel,
  });

  private userInfoDropdown(user?: User) {
    return this.withinNavigationActions.findByRole('button', {
      name: this.regexp(this.getUserInfo(user)),
    });
  }

  private logoutButton = this.withinNavigationActions.findByRole('link', {
    name: this.regexp(this.translations.header?.logoutLabel ?? ''),
  });

  public userIsLoggedIn(user: User) {
    return this.expect(this.userInfoDropdown(user));
  }

  public userIsLoggedOut() {
    return this.expect(this.loginButton);
  }

  public async changeLanguage(toLang: Language) {
    return t
      .click(this.languageSelector)
      .click(this.languageSelectorItem(toLang));
  }

  public clickLoginButton() {
    return t.click(this.loginButton);
  }

  public async clickLogoutButton(user?: User) {
    return t.click(this.userInfoDropdown(user)).click(this.logoutButton);
  }
}

export default Header;
