import TestController, { Selector } from 'testcafe';

import isRealIntegrationsEnabled from '../../src/flags/is-real-integrations-enabled';
import { DEFAULT_LANGUAGE, Language } from '../../src/i18n/i18n';
import User from '../../src/types/user';
import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
  withinContext,
} from '../utils/testcafe.utils';

const translations = {
  fi: {
    login: 'Kirjaudu palveluun',
    logout: 'Kirjaudu ulos',
    language: 'Suomeksi',
    userInfo: (user?: User) =>
      new RegExp(
        `Käyttäjä: ${
          // eslint-disable-next-line sonarjs/no-duplicate-string
          isRealIntegrationsEnabled() ? 'Mika Hietanen' : user?.name ?? ''
        }`
      ),
  },
  sv: {
    login: 'Logga in i tjänsten',
    logout: 'Logga ut',
    language: 'På svenska',
    userInfo: (user?: User) =>
      new RegExp(
        `Användare: ${
          isRealIntegrationsEnabled() ? 'Mika Hietanen' : user?.name ?? ''
        }`
      ),
  },
  en: {
    login: 'Sign in to the service',
    logout: 'Log out',
    language: 'In English',
    userInfo: (user?: User) =>
      new RegExp(
        `User: ${
          isRealIntegrationsEnabled() ? 'Mika Hietanen' : user?.name ?? ''
        }`
      ),
  },
};

export type Translation = {
  [key in Language]: string;
};

export const getHeaderComponents = (
  t: TestController,
  appName?: Translation
) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinHeader = (): ReturnType<typeof within> =>
    within(screen.findByRole('banner'));
  const navigationActions = Selector('div[class*="NavigationActions"]');
  const withinNavigationActions = (): ReturnType<typeof within> =>
    within(navigationActions);

  const languageDropdown = async () => {
    const selectors = {
      languageSelector(lang = DEFAULT_LANGUAGE): SelectorPromise {
        setDataToPrintOnFailure(t, 'lang', lang);
        return withinNavigationActions().findByRole('button', {
          name: new RegExp(lang, 'i'),
        });
      },
      languageSelectorItem(toLang: Language): SelectorPromise {
        setDataToPrintOnFailure(t, 'expectedLanguage', toLang);
        return withinNavigationActions().findByRole('link', {
          name: translations[toLang].language,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.languageSelector().exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async changeLanguage(fromLang: Language, toLang: Language) {
        await t
          .click(selectors.languageSelector(fromLang))
          .click(selectors.languageSelectorItem(toLang));
      },
    };
    await expectations.isPresent();
    return {
      expectations,
      actions,
    };
  };
  const header = async () => {
    const selectors = {
      headerTitle(asLang = DEFAULT_LANGUAGE) {
        if (!appName) {
          throw new Error(
            'Did you forgot to give expected app name translations?'
          );
        }
        return withinHeader()
          .findAllByText(new RegExp(`^${appName[asLang]}$`, 'i'), {})
          .nth(0);
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.headerTitle().exists)
          .ok(await getErrorMessage(t));
      },
      async titleIsTranslatedAs(asLang: Language) {
        await t
          .expect(selectors.headerTitle(asLang).exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {};
    await expectations.isPresent();
    return {
      expectations,
      actions,
    };
  };
  const headerUser = async () => {
    const selectors = {
      userComponent(): Selector {
        return Selector(navigationActions);
      },
      loginButton(asLang = DEFAULT_LANGUAGE): SelectorPromise {
        return withinNavigationActions().findByRole('button', {
          name: translations[asLang].login,
        });
      },
      userInfoDropdown(
        user?: User,
        asLang = DEFAULT_LANGUAGE
      ): SelectorPromise {
        return withinNavigationActions().findByRole('button', {
          name: translations[asLang].userInfo(user),
        });
      },
      logoutButton(asLang = DEFAULT_LANGUAGE): SelectorPromise {
        return withinNavigationActions().findByRole('link', {
          name: translations[asLang].logout,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.userComponent().exists)
          .ok(await getErrorMessage(t));
      },
      async userIsLoggedIn(user: User, asLang = DEFAULT_LANGUAGE) {
        await t
          .expect(selectors.userInfoDropdown(user, asLang).exists)
          .ok(await getErrorMessage(t), { timeout: 60_000 });
      },
      async userIsLoggedOut(asLang = DEFAULT_LANGUAGE) {
        await t
          .expect(selectors.loginButton(asLang).exists)
          .ok(await getErrorMessage(t), { timeout: 60_000 });
      },
      async loginButtonIsTranslatedAs(asLang: Language) {
        await t
          .expect(selectors.loginButton(asLang).exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async clickloginButton(asLang = DEFAULT_LANGUAGE) {
        await t.click(selectors.loginButton(asLang));
      },
      async clicklogoutButton(user?: User, asLang = DEFAULT_LANGUAGE) {
        await t
          .click(selectors.userInfoDropdown(user, asLang))
          .click(selectors.logoutButton(asLang));
      },
    };
    await expectations.isPresent();
    return {
      expectations,
      actions,
    };
  };
  return {
    header,
    languageDropdown,
    headerUser,
  };
};
