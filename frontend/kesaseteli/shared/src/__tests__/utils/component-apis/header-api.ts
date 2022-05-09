import {
  screen,
  userEvent,
  waitFor,
  within,
} from 'shared/__tests__/utils/test-utils';
import { Language } from 'shared/i18n/i18n';
import User from 'shared/types/user';

const defaultTranslations = {
  fi: 'Suomeksi',
  sv: 'På svenska',
  en: 'In English',
};

const languageMenuButtonAriaLabels = {
  fi: 'Valitse kieli',
  sv: 'Ändra språk',
  en: 'Select language',
};

const expectations = {
  userIsLoggedIn: async (expectedUser?: User): Promise<void> => {
    await screen.findByRole('button', {
      name: new RegExp(
        `(käyttäjä)|(header.userAriaLabelPrefix) ${expectedUser?.name ?? ''}`,
        'i'
      ),
    });
  },
  userIsLoggedOut: async (): Promise<void> => {
    await waitFor(() => {
      expect(
        screen.queryAllByRole('button', {
          name: /(kirjaudu palveluun)|(header.loginlabel)/i,
        })
      ).toHaveLength(2); // this is due to ssr bug in hds header component, it's in the dom twice after ssr and before csr
    });
  },
  errorToastIsShown: async (
    errorMessage = /tapahtui tuntematon virhe/i
  ): Promise<void> => {
    await waitFor(() => {
      // eslint-disable-next-line unicorn/prefer-query-selector
      const toast = document.getElementById('HDSToastContainer');
      if (toast) {
        expect(
          within(toast).getByRole('heading', { name: errorMessage })
        ).toBeInTheDocument();
      }
    });
  },
};
const actions = {
  clickLoginButton: (): Promise<void> =>
    userEvent.click(
      screen.getAllByRole('button', {
        name: /(kirjaudu palveluun)|(header.loginlabel)/i,
      })[0] // this is due to ssr bug in hds header component, it's in the dom twice after ssr and before csr
    ),
  clickLogoutButton: async (user: User): Promise<void> => {
    await userEvent.click(
      screen.getByRole('button', {
        name: new RegExp(
          `(käyttäjä)|(header.userAriaLabelPrefix) ${user.name}`,
          'i'
        ),
      })
    );
    return userEvent.click(
      screen.getAllByRole('link', {
        name: /(kirjaudu ulos)|(header.logoutlabel)/i,
      })[0] // this is due to ssr bug in hds header component, it's in the dom twice after ssr and before csr
    );
  },
  changeLanguage: async (
    fromLang: Language,
    toLang: Language
  ): Promise<void> => {
    await userEvent.click(
      screen.getAllByRole('button', {
        name: new RegExp(languageMenuButtonAriaLabels[fromLang], 'i'),
      })[0]
    );
    return userEvent.click(
      screen.getAllByRole('link', {
        name: new RegExp(
          `(${defaultTranslations[toLang]})|(languages.${toLang})`,
          'i'
        ),
      })[0]
    );
  },
};

const headerApi = { expectations, actions };
export default headerApi;
