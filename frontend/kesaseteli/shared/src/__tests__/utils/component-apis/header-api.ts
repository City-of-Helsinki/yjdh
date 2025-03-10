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

const expectations = {
  userIsLoggedIn: async (expectedUser?: User): Promise<void> => {
    await screen.findByRole('button', {
      name: new RegExp(`${expectedUser?.name ?? ''}`, 'i'),
    });
  },
  userIsLoggedOut: async (): Promise<void> => {
    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /(kirjaudu palveluun)|(header.loginlabel)/i,
        })
      ).toBeInTheDocument();
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
  clickLoginButton: async (): Promise<void> => {
    await userEvent.click(
      screen.getAllByRole('button', {
        name: /(kirjaudu palveluun)|(header.loginlabel)/i,
      })[0] // this is due to ssr bug in hds header component, it's in the dom twice after ssr and before csr
    );
  },
  clickLogoutButton: async (user: User): Promise<void> => {
    await userEvent.click(
      screen.getByRole('button', {
        name: new RegExp(`${user.name}`, 'i'),
      })
    );
    return userEvent.click(
      screen.getAllByRole('button', {
        name: /(kirjaudu ulos)|(header.logoutlabel)/i,
      })[0] // this is due to ssr bug in hds header component, it's in the dom twice after ssr and before csr
    );
  },
  changeLanguage: async (toLang: Language): Promise<void> =>
    userEvent.click(
      screen.getByRole('button', {
        name: new RegExp(
          `(${defaultTranslations[toLang]})|(languages.${toLang})`,
          'i'
        ),
      })
    ),
};

const headerApi = { expectations, actions };
export default headerApi;
