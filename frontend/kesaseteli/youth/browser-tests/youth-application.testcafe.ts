import { getHandlerFormPageComponents } from '@frontend/kesaseteli-shared/browser-tests/handler-form-page/handlerFormPage.components';
import {
  fakeActivatedYouthApplication,
  fakeAdditionalInfoApplication,
  fakeYouthApplication,
} from '@frontend/kesaseteli-shared/src/__tests__/utils/fake-objects';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import {
  getCurrentUrl,
  getUrlParam,
  goToUrl,
} from '@frontend/shared/browser-tests/utils/url.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';
import { DEFAULT_LANGUAGE } from '@frontend/shared/src/i18n/i18n';

import getYouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import getActivationLinkExpirationSeconds from '../src/utils/get-activation-link-expiration-seconds';
import sendAdditionalInfoApplication from './actions/send-additional-info-application';
import sendYouthApplication from './actions/send-youth-application';
import { getAdditionalInfoPageComponents } from './additional-info-page/additional-info.components';
import { getIndexPageComponents } from './index-page/indexPage.components';
import { getActivatedPageComponents } from './notification-page/activatedPage.components';
import { getAlreadyActivatedPageComponents } from './notification-page/alreadyActivatedPage.components';
import { getAlreadyAssignedPageComponents } from './notification-page/alreadyAssignedPage.components';
import { getEmailInUsePageComponents } from './notification-page/emailInUsePage.components';
import { getExpiredPageComponents } from './notification-page/expiredPage.components';
import { getThankYouPageComponents } from './thank-you-page/thankYouPage.components';
import {
  clickBrowserBackButton,
  getFrontendUrl,
  goToBackendUrl,
  goToFrontPage,
} from './utils/url.utils';

const url = getFrontendUrl('/');

fixture('Youth Application')
  .page(url)
  .requestHooks(requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('I can send application and return to front page', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
  const formData = fakeYouthApplication();
  await sendYouthApplication(t, formData);
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await indexPage.expectations.isLoaded();
});

test('If I send two applications with same email, I will see "email is in use" -message', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
  const application = fakeYouthApplication();
  await sendYouthApplication(t, application);
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await indexPage.expectations.isLoaded();
  const secondApplication = fakeYouthApplication({ email: application.email });
  await sendYouthApplication(t, secondApplication);
  const emailInUsePage = await getEmailInUsePageComponents(t);
  await emailInUsePage.expectations.isLoaded();
});

if (!isRealIntegrationsEnabled()) {
  test('If I fill application in swedish, send it and activate it, I will see activation message in swedish', async (t) => {
    const translations = await getYouthTranslations();
    const languageDropdown = getHeaderComponents(
      t,
      translations
    ).languageDropdown();
    await languageDropdown.actions.changeLanguage(DEFAULT_LANGUAGE, 'sv');
    const indexPage = await getIndexPageComponents(t, 'sv');
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication({ is_unlisted_school: false });
    await sendYouthApplication(t, application, 'sv');
    const thankYouPage = await getThankYouPageComponents(t, 'sv');
    await thankYouPage.actions.clickActivationLink();
    const activatedPage = await getActivatedPageComponents(t, 'sv');
    await activatedPage.expectations.isLoaded();
  });
  test('If I fill application with unlisted school in english, send it and activate it, I will see additional info form in english', async (t) => {
    const translations = await getYouthTranslations();
    const languageDropdown = getHeaderComponents(
      t,
      translations
    ).languageDropdown();
    await languageDropdown.actions.changeLanguage(DEFAULT_LANGUAGE, 'en');
    const indexPage = await getIndexPageComponents(t, 'en');
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication({ is_unlisted_school: true });
    await sendYouthApplication(t, application, 'en');
    const thankYouPage = await getThankYouPageComponents(t, 'en');
    await thankYouPage.actions.clickActivationLink();
    const additionalInfo = fakeAdditionalInfoApplication();
    await sendAdditionalInfoApplication(t, additionalInfo, 'en');
  });

  test('If I send and activate application and then I try to activate it again, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication({ is_unlisted_school: false });
    await sendYouthApplication(t, application);
    let thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const activatedPage = await getActivatedPageComponents(t);
    await activatedPage.expectations.isLoaded();

    // reactivating fails
    await clickBrowserBackButton();
    thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const alreadyActivatedPage = await getAlreadyActivatedPageComponents(t);
    await alreadyActivatedPage.expectations.isLoaded();
  });

  test('If I send application, but then I activate it too late, I see "confirmation link has expired" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication();
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await thankYouPage.actions.clickActivationLink();
    const expiredPage = await getExpiredPageComponents(t);
    await expiredPage.expectations.isLoaded();
  });

  test('If I send an application but it expires, I can send the same application again and activate it', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication({ is_unlisted_school: false });
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.expectations.isLoaded();
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await goToFrontPage(t);
    await sendYouthApplication(t, application);
    const thankYouPage2 = await getThankYouPageComponents(t);
    await thankYouPage2.actions.clickActivationLink();
    const activatedPage = await getActivatedPageComponents(t);
    await activatedPage.expectations.isLoaded();
  });

  test('If I have forgot that I already sent and activated an application, and then I send another application with same email, I see  "You already sent a Summer Job Voucher application" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication({ is_unlisted_school: false });
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getActivatedPageComponents(t);
    await goToFrontPage(t);
    const secondApplication = {
      ...fakeYouthApplication(),
      email: application.email,
    };
    await sendYouthApplication(t, secondApplication);
    const alreadyAssignedPage = await getAlreadyAssignedPageComponents(t);
    await alreadyAssignedPage.expectations.isLoaded();
  });

  test('If I have forgot that I already sent and activated an application, and then I send another application with same ssn, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication({ is_unlisted_school: false });
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getActivatedPageComponents(t);
    await goToFrontPage(t);
    const secondApplication = {
      ...fakeYouthApplication(),
      social_security_number: application.social_security_number,
    };
    await sendYouthApplication(t, secondApplication);
    const alreadyAssignedPage = await getAlreadyAssignedPageComponents(t);
    await alreadyAssignedPage.expectations.isLoaded();
  });

  test('If I accidentally send two applications with different emails, and then I activate first application and then second application, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication({ is_unlisted_school: false });
    await sendYouthApplication(t, application);
    await getThankYouPageComponents(t);
    const firstThankYouPageUrl = await getCurrentUrl();
    await goToFrontPage(t);
    const secondApplication = {
      ...fakeYouthApplication(),
      social_security_number: application.social_security_number,
    };
    await sendYouthApplication(t, secondApplication);
    let thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getActivatedPageComponents(t);
    await goToUrl(t, firstThankYouPageUrl);
    thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const alreadyActivatedPage = await getAlreadyActivatedPageComponents(t);
    await alreadyActivatedPage.expectations.isLoaded();
  });

  test('As a handler I can open activated application in handler-ui and see correct application data', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = fakeActivatedYouthApplication({
      is_unlisted_school: false,
    });
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const activatedPage = await getActivatedPageComponents(t);
    await activatedPage.expectations.isLoaded();
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const { first_name, last_name, is_unlisted_school } = application;
    const handlerFormPage = await getHandlerFormPageComponents(t, application);
    await handlerFormPage.expectations.isLoaded();
    await handlerFormPage.expectations.applicationFieldHasValue(
      'name',
      `${first_name} ${last_name}`
    );
    await handlerFormPage.expectations.applicationFieldHasValue(
      'social_security_number'
    );
    await handlerFormPage.expectations.applicationFieldHasValue('postcode');
    await handlerFormPage.expectations.applicationFieldHasValue('school');
    if (is_unlisted_school) {
      await handlerFormPage.expectations.applicationFieldHasValue(
        'school',
        '(Koulua ei löytynyt listalta)'
      );
    }
    await handlerFormPage.expectations.applicationFieldHasValue('phone_number');
    await handlerFormPage.expectations.applicationFieldHasValue('email');
  });

  test('As a handler I can open additional information provided application in handler-ui and see correct additional info data', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = fakeYouthApplication({ is_unlisted_school: true });
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const additionalInfoPage = await getAdditionalInfoPageComponents(t);
    await additionalInfoPage.expectations.isLoaded();
    const additionalInfo = fakeAdditionalInfoApplication();
    await sendAdditionalInfoApplication(t, additionalInfo);
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const activatedApplication = fakeActivatedYouthApplication({
      ...application,
      ...additionalInfo,
    });
    const handlerFormPage = await getHandlerFormPageComponents(
      t,
      activatedApplication
    );
    await handlerFormPage.expectations.isLoaded();
    const translations = await getYouthTranslations();
    await handlerFormPage.expectations.applicationFieldHasValue(
      'additional_info_user_reasons',
      activatedApplication.additional_info_user_reasons
        ?.map((reason) => translations.additionalInfo.reasons[reason])
        .join('. ') ?? ''
    );
    await handlerFormPage.expectations.applicationFieldHasValue(
      'additional_info_description'
    );
  });

  test('As a handler I can open non-activated application, but I will see "youth has not yet activated the application" -error message ', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthApplication();
    await sendYouthApplication(t, formData);
    await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerFormPage = await getHandlerFormPageComponents(t);
    await handlerFormPage.expectations.isLoaded();
    await handlerFormPage.expectations.applicationIsNotYetActivated();
  });

  test('As a handler I can open application with additional info required, but I will see "youth has not yet sent the additional info application" -error message ', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthApplication({ is_unlisted_school: true });
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getAdditionalInfoPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerFormPage = await getHandlerFormPageComponents(t);
    await handlerFormPage.expectations.isLoaded();
    await handlerFormPage.expectations.additionalInformationRequested();
  });

  test('As a handler I can accept an application', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthApplication({ is_unlisted_school: false });
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const activatedPage = await getActivatedPageComponents(t);
    await activatedPage.expectations.isLoaded();
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerFormPage = await getHandlerFormPageComponents(t);
    await handlerFormPage.expectations.isLoaded();
    await handlerFormPage.actions.clickAcceptButton();
    await handlerFormPage.expectations.confirmationDialogIsPresent();
    await handlerFormPage.actions.clickConfirmAcceptButton();
    await handlerFormPage.expectations.applicationIsAccepted();
  });
  test('As a handler I can reject an application', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthApplication({ is_unlisted_school: false });
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const activatedPage = await getActivatedPageComponents(t);
    await activatedPage.expectations.isLoaded();
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerFormPage = await getHandlerFormPageComponents(t);
    await handlerFormPage.expectations.isLoaded();
    await handlerFormPage.actions.clickRejectButton();
    await handlerFormPage.expectations.confirmationDialogIsPresent();
    await handlerFormPage.actions.clickConfirmRejectButton();
    await handlerFormPage.expectations.applicationIsRejected();
  });
}
