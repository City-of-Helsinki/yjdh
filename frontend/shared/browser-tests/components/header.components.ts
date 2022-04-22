import TestController, { Selector } from 'testcafe';

import isRealIntegrationsEnabled from '../../src/flags/is-real-integrations-enabled';
import { DEFAULT_LANGUAGE, Language } from '../../src/i18n/i18n';
import User from '../../src/types/user';
import { escapeRegExp } from '../../src/utils/regex.utils';
import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
  withinContext,
} from '../utils/testcafe.utils';

type HeaderTranslations = {
  appName: string;
  header: {
    loginLabel?: string;
    logoutLabel?: string;
    userAriaLabelPrefix?: string;
    linkSkipToContent: string;
    menuToggleAriaLabel: string;
    languageMenuButtonAriaLabel: string;
  };
  languages: {
    fi: string;
    sv: string;
    en: string;
  };
};

type Translations = {
  fi: HeaderTranslations;
  sv: HeaderTranslations;
  en: HeaderTranslations;
};

export const getHeaderComponents = <T extends Translations>(
  t: TestController,
  translations: T,
  lang?: Language
) => {
  const within = withinContext(t);
  const screen = screenContext(t);
  let currentLang = lang ?? DEFAULT_LANGUAGE;

  const getUserInfo = (user?: User) =>
    `${translations[currentLang].header.userAriaLabelPrefix ?? ''} ${
      isRealIntegrationsEnabled() ? 'Mika Hietanen' : user?.name ?? ''
    }`;

  const withinHeader = (): ReturnType<typeof within> =>
    within(screen.getByRole('banner'));
  const navigationActions = Selector('div[class*="NavigationActions"]');
  const withinNavigationActions = (): ReturnType<typeof within> =>
    within(navigationActions);

  const languageDropdown = () => {
    const selectors = {
      languageSelector(): SelectorPromise {
        setDataToPrintOnFailure(t, 'lang', lang);
        return withinNavigationActions().findByRole('button', {
          name: translations[currentLang].header.languageMenuButtonAriaLabel,
        });
      },
      languageSelectorItem(toLang: Language): SelectorPromise {
        setDataToPrintOnFailure(t, 'expectedLanguage', toLang);
        return withinNavigationActions().findByRole('link', {
          name: translations[currentLang].languages[toLang],
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
        if (currentLang !== toLang) {
          await t
            .click(selectors.languageSelector())
            .click(selectors.languageSelectorItem(toLang));
          currentLang = toLang;
        }
      },
    };
    return {
      expectations,
      actions,
    };
  };
  const header = () => {
    const selectors = {
      headerTitle() {
        return withinHeader()
          .findAllByText(translations[currentLang].appName)
          .nth(0);
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.headerTitle().exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {};
    return {
      expectations,
      actions,
    };
  };
  const headerUser = () => {
    const selectors = {
      userComponent(): Selector {
        return Selector(navigationActions);
      },
      loginButton(): SelectorPromise {
        return withinNavigationActions().findByRole('button', {
          name: translations[currentLang].header?.loginLabel,
        });
      },
      userInfoDropdown(user?: User): SelectorPromise {
        return withinNavigationActions().findByRole('button', {
          name: escapeRegExp(getUserInfo(user), 'i'),
        });
      },
      logoutButton(): SelectorPromise {
        return withinNavigationActions().findByRole('link', {
          name: escapeRegExp(
            translations[currentLang].header?.logoutLabel ?? '',
            'i'
          ),
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.userComponent().exists)
          .ok(await getErrorMessage(t));
      },
      async userIsLoggedIn(user: User) {
        await t
          .expect(selectors.userInfoDropdown(user).exists)
          .ok(await getErrorMessage(t));
      },
      async userIsLoggedOut() {
        await t
          .expect(selectors.loginButton().exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async clickloginButton() {
        await t.click(selectors.loginButton());
      },
      async clicklogoutButton(user?: User) {
        await t
          .click(selectors.userInfoDropdown(user))
          .click(selectors.logoutButton());
      },
    };
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
