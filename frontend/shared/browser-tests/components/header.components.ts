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

export const getHeaderComponents = <T extends HeaderTranslations>(
  t: TestController,
  translations: T
) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const getUserInfo = (user?: User) =>
    `${translations.header.userAriaLabelPrefix ?? ''} ${
      isRealIntegrationsEnabled() ? 'Mika Hietanen' : user?.name ?? ''
    }`;

  const withinHeader = (): ReturnType<typeof within> =>
    within(screen.getByRole('banner'));
  const navigationActions = Selector('div[class*="NavigationActions"]');
  const withinNavigationActions = (): ReturnType<typeof within> =>
    within(navigationActions);

  const languageDropdown = () => {
    const selectors = {
      languageSelector(lang = DEFAULT_LANGUAGE): SelectorPromise {
        setDataToPrintOnFailure(t, 'lang', lang);
        return withinNavigationActions().findByRole('button', {
          name: translations.header.languageMenuButtonAriaLabel,
        });
      },
      languageSelectorItem(toLang: Language): SelectorPromise {
        setDataToPrintOnFailure(t, 'expectedLanguage', toLang);
        return withinNavigationActions().findByRole('link', {
          name: translations.languages[toLang],
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
        if (fromLang !== toLang) {
          await t
            .click(selectors.languageSelector(fromLang))
            .click(selectors.languageSelectorItem(toLang));
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
          .findAllByText(new RegExp(`^${translations.appName}$`, 'i'), {})
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
          name: translations.header?.loginLabel,
        });
      },
      userInfoDropdown(user?: User): SelectorPromise {
        return withinNavigationActions().findByRole('button', {
          name: getUserInfo(user),
        });
      },
      logoutButton(): SelectorPromise {
        return withinNavigationActions().findByRole('link', {
          name: translations.header?.logoutLabel,
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
