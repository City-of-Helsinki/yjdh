import { Selector, t } from 'testcafe';

import TranslationsApi from '../../src/__tests__/types/translations';
import isRealIntegrationsEnabled from '../../src/flags/is-real-integrations-enabled';
import { Language } from '../../src/i18n/i18n';
import User from '../../src/types/user';
import TranslatedComponent, { CommonTranslations } from './TranslatedComponent';

class Header<
  Translations extends CommonTranslations,
  Api extends TranslationsApi<Translations>
> extends TranslatedComponent<Translations> {
  public constructor(translationsApi: Api, lang?: Language) {
    super(translationsApi, { lang, datatestId: 'header' });
  }

  private withinNavigationActions = this.within(
    Selector('div[class*="NavigationActions"]')
  );

  private getUserInfo(user?: User): string {
    return `${this.translations.header.userAriaLabelPrefix ?? ''} ${
      isRealIntegrationsEnabled() ? 'Mika Hietanen' : user?.name ?? ''
    }`;
  }

  private headerTitle(): Selector {
    return this.within(this.component.findByRole('banner'))
      .findAllByText(this.translations.appName)
      .nth(0);
  }

  private languageSelector(): SelectorPromise {
    return this.withinNavigationActions.findByRole('button', {
      name: this.translations.header.languageMenuButtonAriaLabel,
    });
  }

  private languageSelectorItem(toLang: Language): SelectorPromise {
    return this.withinNavigationActions.findByRole('link', {
      name: this.translations.languages[toLang],
    });
  }

  public async isLoaded(timeout?: number): Promise<void> {
    await super.isLoaded(timeout);
    return this.expect(this.headerTitle());
  }

  private loginButton(): SelectorPromise {
    return this.withinNavigationActions.findByRole('button', {
      name: this.translations.header?.loginLabel,
    });
  }

  private userInfoDropdown(user?: User): SelectorPromise {
    return this.withinNavigationActions.findByRole('button', {
      name: this.regexp(this.getUserInfo(user)),
    });
  }

  private logoutButton(): SelectorPromise {
    return this.withinNavigationActions.findByRole('link', {
      name: this.regexp(this.translations.header?.logoutLabel ?? ''),
    });
  }

  public userIsLoggedIn(user: User): Promise<void> {
    return this.expect(this.userInfoDropdown(user));
  }

  public userIsLoggedOut(): Promise<void> {
    return this.expect(this.loginButton());
  }

  public async changeLanguage(toLang: Language): Promise<void> {
    return t
      .click(this.languageSelector())
      .click(this.languageSelectorItem(toLang));
  }

  public clickLoginButton(): Promise<void> {
    return t.click(this.loginButton());
  }

  public async clickLogoutButton(user?: User): Promise<void> {
    return t.click(this.userInfoDropdown(user)).click(this.logoutButton());
  }
}

export default Header;
