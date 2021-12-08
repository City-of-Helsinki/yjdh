import {
  expectToLogout,
  expectUnauthorizedReply,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { Language } from 'shared/i18n/i18n';
import User from 'shared/types/user';

const defaultTranslations = {
  fi: 'Suomeksi',
  sv: 'På svenska',
  en: 'In English',
};

const expectations = {
  userIsLoggedIn: async (expectedUser: User): Promise<void> => {
    await screen.findByRole('button', {
      name: new RegExp(
        `(käyttäjä)|(header.userAriaLabelPrefix) ${expectedUser.name}`,
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
};
const actions = {
  clickLoginButton: (): void => {
    userEvent.click(
      screen.getAllByRole('button', {
        name: /(kirjaudu palveluun)|(header.loginlabel)/i,
      })[0] // this is due to ssr bug in hds header component, it's in the dom twice after ssr and before csr
    );
  },
  clickLogoutButton: async (user: User): Promise<void> => {
    const logout = expectToLogout(user);
    const unauthorizedReply = expectUnauthorizedReply();
    userEvent.click(
      screen.getByRole('button', {
        name: new RegExp(
          `(käyttäjä)|(header.userAriaLabelPrefix) ${user.name}`,
          'i'
        ),
      })
    );
    userEvent.click(
      screen.getAllByRole('link', {
        name: /(kirjaudu ulos)|(header.logoutlabel)/i,
      })[0] // this is due to ssr bug in hds header component, it's in the dom twice after ssr and before csr
    );
    await waitFor(() => logout.done());
    await waitFor(() => unauthorizedReply.done());
    await expectations.userIsLoggedOut();
  },
  changeLanguage: (fromLang: Language, toLang: Language): void => {
    userEvent.click(
      screen.getAllByRole('button', {
        name: new RegExp(fromLang, 'i'),
      })[0]
    );
    userEvent.click(
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
