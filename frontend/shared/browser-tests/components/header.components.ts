import TestController, { Selector } from 'testcafe';

import { DEFAULT_LANGUAGE } from '../../src/i18n/i18n';
import { Language } from '../../src/types/common';
import User from '../../src/types/user';
import {
  getErrorMessage,
  setDataToPrintOnFailure,
  withinContext,
} from '../utils/testcafe.utils';

const langTranslations = {
  fi: 'Suomeksi',
  sv: 'På svenska',
  en: 'In english',
};

export const getHeaderComponents = (t: TestController) => {
  const within = withinContext(t);

  const navigationActions = Selector('div[class*="NavigationActions"]');
  const withinNavigationActions = (): ReturnType<typeof within> =>
    within(navigationActions);

  const languageDropdown = async (lang = DEFAULT_LANGUAGE) => {
    let currentLang = lang;
    const selectors = {
      languageSelector(): SelectorPromise {
        return withinNavigationActions().findByRole('button', {
          name: new RegExp(currentLang, 'i'),
        });
      },
      languageSelectorItem(toLang: Language): SelectorPromise {
        setDataToPrintOnFailure(t, 'expectedLanguage', toLang);
        currentLang = toLang;
        return withinNavigationActions().findByRole('link', {
          name: langTranslations[toLang],
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
      async changeLanguage(toLang: Language) {
        await t
          .click(selectors.languageSelector())
          .click(selectors.languageSelectorItem(toLang));
      },
    };
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
      loginButton(buttonTranslationText = 'Kirjaudu sisään'): SelectorPromise {
        return withinNavigationActions().findByRole('button', {
          name: buttonTranslationText,
        });
      },
      userInfoDropdown(user?: User): SelectorPromise {
        return withinNavigationActions().getByRole('button', {
          name: new RegExp(`käyttäjä: ${user?.name ?? ''}`, 'i'),
        });
      },
      logoutButton(): SelectorPromise {
        return withinNavigationActions().getByRole('link', {
          name: /kirjaudu ulos/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.userComponent().exists)
          .ok(await getErrorMessage(t));
      },
      async userIsLoggedIn(user?: User) {
        setDataToPrintOnFailure(t, 'user', user);
        await t
          .expect(selectors.userInfoDropdown(user).exists)
          .ok(await getErrorMessage(t));
      },
      async userIsLoggedOut() {
        await t
          .expect(selectors.loginButton().exists)
          .ok(await getErrorMessage(t));
      },
      async loginButtonIsTranslatedAs(loginButtonTranslation: string) {
        await t
          .expect(selectors.loginButton(loginButtonTranslation).exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async clickloginButton() {
        await t.click(selectors.loginButton());
      },
      async clicklogoutButton() {
        await t
          .click(selectors.userInfoDropdown())
          .click(selectors.logoutButton());
      },
    };
    await expectations.isPresent();
    return {
      expectations,
      actions,
    };
  };
  return {
    languageDropdown,
    headerUser,
  };
};
