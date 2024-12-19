import { Selector, t } from 'testcafe';

import TranslationsApi from '../../src/__tests__/types/translations';
import { Language } from '../../src/i18n/i18n';
import TranslatedComponent, { CommonTranslations } from './TranslatedComponent';

class Header<
  Translations extends CommonTranslations,
  Api extends TranslationsApi<Translations>
> extends TranslatedComponent<Translations> {
  public constructor(translationsApi: Api, lang?: Language) {
    super(translationsApi, { lang, datatestId: 'header' });
  }

  private withinNavigationActions = this.within(
    // eslint-disable-next-line no-secrets/no-secrets
    Selector('div[class*="HeaderActionBar-module_headerActions"]')
  );

  private headerTitle(): Selector {
    return this.within(this.component.findByRole('banner'))
      .findAllByText(this.translations.appName)
      .nth(0);
  }

  private languageSelectorItem(toLang: Language): SelectorPromise {
    return this.withinNavigationActions.findByRole('button', {
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

  // eslint-disable-next-line class-methods-use-this
  private userInfoDropdown(): Selector {
    return Selector('button').withAttribute(
      'aria-controls',
      'sign-out-dropdown'
    );
  }

  private logoutButton(): SelectorPromise {
    return this.withinNavigationActions.findByRole('button', {
      name: this.regexp(this.translations.header?.logoutLabel ?? ''),
    });
  }

  public userIsLoggedIn(): Promise<void> {
    return this.expect(this.userInfoDropdown());
  }

  public userIsLoggedOut(): Promise<void> {
    return this.expect(this.loginButton());
  }

  public async changeLanguage(toLang: Language): Promise<void> {
    return t.click(this.languageSelectorItem(toLang));
  }

  public clickLoginButton(): Promise<void> {
    return t.click(this.loginButton());
  }

  public async clickLogoutButton(): Promise<void> {
    return t.click(this.userInfoDropdown()).click(this.logoutButton());
  }
}

export default Header;
