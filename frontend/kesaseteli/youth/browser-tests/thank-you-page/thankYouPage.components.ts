import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

const translations = {
  fi: {
    headerText: /hienoa! olet lähettänyt tietosi kesäsetelijärjestelmään/i,
    buttonText: /siirry kesäsetelin etusivulle/i,
  },
  sv: {
    headerText:
      /fint! du har skickat dina uppgifter till sommarsedelns digitala system./i,
    buttonText: /gå till sommarsedelns förstasida/i,
  },
  en: {
    headerText:
      /excellent! you sent your information to the summer job vouchers´ digital system./i,
    buttonText: /go to the summer job voucher front page/i,
  },
};

export const getThankYouPageComponents = async (
  t: TestController,
  lang?: Language
) => {
  const screen = screenContext(t);
  const selectors = {
    header() {
      return screen.findByRole('heading', {
        name: translations[lang ?? DEFAULT_LANGUAGE].headerText,
      });
    },
    goToFrontPageButton() {
      return screen.findByRole('button', {
        name: translations[lang ?? DEFAULT_LANGUAGE].buttonText,
      });
    },
    activationLink() {
      return screen.findByRole('link', {
        name: /aktivoi/i,
      });
    },
  };
  const expectations = {
    async isLoaded() {
      await t.expect(selectors.header().exists).ok(await getErrorMessage(t));
    },
  };
  const actions = {
    async clickGoToFrontPageButton() {
      await t.click(selectors.goToFrontPageButton());
    },
    async clickActivationLink() {
      const href = await selectors.activationLink().getAttribute('href');
      setDataToPrintOnFailure(t, 'activationLink', href);
      // eslint-disable-next-line no-console
      console.log('Clicking activation link', href);
      await t.click(selectors.activationLink());
    },
  };
  await expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
