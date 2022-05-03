import HandlerForm from '@frontend/kesaseteli-shared/browser-tests/page-models/HandlerForm';
import {
  fakeActivatedYouthApplication,
  fakeAdditionalInfoApplication,
  fakeYouthApplicationLivesInHelsinkiAccordingToVtj as applicationLivesInHelsinkiAccordingToVtj,
  fakeYouthApplicationUnlistedSchool as applicationUnlistedSchool,
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
import { FinnishSSN } from 'finnish-ssn';

import getYouthTranslationsApi from '../src/__tests__/utils/i18n/get-youth-translations-api';
import getActivationLinkExpirationSeconds from '../src/utils/get-activation-link-expiration-seconds';
import sendAdditionalInfoApplication from './actions/send-additional-info-application';
import sendYouthApplication from './actions/send-youth-application';
import { getAdditionalInfoPageComponents } from './additional-info-page/additional-info.components';
import { getIndexPageComponents } from './index-page/indexPage.components';
import { getNotificationPageComponents } from './notification-page/notificationPage.components';
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
  const formData = applicationLivesInHelsinkiAccordingToVtj();
  await sendYouthApplication(t, formData);
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await indexPage.expectations.isLoaded();
});

test('If I send two applications with same email, I will see "email is in use" -message', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
  const application = applicationLivesInHelsinkiAccordingToVtj();
  await sendYouthApplication(t, application);
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await indexPage.expectations.isLoaded();
  const secondApplication = applicationLivesInHelsinkiAccordingToVtj({
    email: application.email,
  });
  await sendYouthApplication(t, secondApplication);
  const emailInUsePage = await getNotificationPageComponents(t, 'emailInUse');
  await emailInUsePage.expectations.isLoaded();
});

if (!isRealIntegrationsEnabled()) {
  test('If I fill application in swedish, send it and activate it, I will see activation message in swedish', async (t) => {
    const { translations } = getYouthTranslationsApi();
    const languageDropdown = getHeaderComponents(
      t,
      translations
    ).languageDropdown();
    await languageDropdown.actions.changeLanguage('sv');
    const indexPage = await getIndexPageComponents(t, 'sv');
    await indexPage.expectations.isLoaded();
    const application = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, application, 'sv');
    const thankYouPage = await getThankYouPageComponents(t, 'sv');
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(
      t,
      'accepted',
      'sv'
    );
    await acceptedPage.expectations.isLoaded();
  });
  test('If I fill application with unlisted school in english, send it and activate it, I will see additional info form in english', async (t) => {
    const { translations } = getYouthTranslationsApi();
    const languageDropdown = getHeaderComponents(
      t,
      translations
    ).languageDropdown();
    await languageDropdown.actions.changeLanguage('en');
    const indexPage = await getIndexPageComponents(t, 'en');
    await indexPage.expectations.isLoaded();
    const application = applicationUnlistedSchool();
    await sendYouthApplication(t, application, 'en');
    const thankYouPage = await getThankYouPageComponents(t, 'en');
    await thankYouPage.actions.clickActivationLink();
    const additionalInfo = fakeAdditionalInfoApplication();
    await sendAdditionalInfoApplication(t, additionalInfo, 'en');
  });

  test('If I send and activate application and then I try to activate it again, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, application);
    let thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();

    // reactivating fails
    await clickBrowserBackButton();
    thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const alreadyacceptedPage = await getNotificationPageComponents(
      t,
      'alreadyActivated'
    );
    await alreadyacceptedPage.expectations.isLoaded();
  });

  test('If I send application, but then I activate it too late, I see "confirmation link has expired" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await thankYouPage.actions.clickActivationLink();
    const expiredPage = await getNotificationPageComponents(t, 'expired');
    await expiredPage.expectations.isLoaded();
  });

  test('If I send an application but it expires, I can send the same application again and activate it', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.expectations.isLoaded();
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await goToFrontPage(t);
    await sendYouthApplication(t, application);
    const thankYouPage2 = await getThankYouPageComponents(t);
    await thankYouPage2.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
  });

  test('If I have forgot that I already sent and activated an application, and then I send another application with same email, I see  "You already sent a Summer Job Voucher application" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
    await goToFrontPage(t);
    const secondApplication = applicationLivesInHelsinkiAccordingToVtj({
      email: application.email,
    });
    await sendYouthApplication(t, secondApplication);
    const alreadyAssignedPage = await getNotificationPageComponents(
      t,
      'alreadyAssigned'
    );
    await alreadyAssignedPage.expectations.isLoaded();
  });

  test('If I have forgot that I already sent and activated an application, and then I send another application with same ssn, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
    await goToFrontPage(t);
    const secondApplication = applicationLivesInHelsinkiAccordingToVtj({
      social_security_number: application.social_security_number,
    });
    await sendYouthApplication(t, secondApplication);
    const alreadyAssignedPage = await getNotificationPageComponents(
      t,
      'alreadyAssigned'
    );
    await alreadyAssignedPage.expectations.isLoaded();
  });

  test('If I accidentally send two applications with different emails, and then I activate first application and then second application, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, application);
    await getThankYouPageComponents(t);
    const firstThankYouPageUrl = await getCurrentUrl();
    await goToFrontPage(t);
    const secondApplication = applicationLivesInHelsinkiAccordingToVtj({
      social_security_number: application.social_security_number,
    });
    await sendYouthApplication(t, secondApplication);
    let thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
    await goToUrl(t, firstThankYouPageUrl);
    thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const alreadyacceptedPage = await getNotificationPageComponents(
      t,
      'alreadyActivated'
    );
    await alreadyacceptedPage.expectations.isLoaded();
  });

  test('As a handler I can open activated application in handler-ui and see correct application data', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const { first_name, last_name, is_unlisted_school } = application;
    const handlerForm = new HandlerForm(
      fakeActivatedYouthApplication(application)
    );
    await handlerForm.isLoaded();
    await handlerForm.applicationFieldHasValue(
      'name',
      `${first_name} ${last_name}`
    );
    await handlerForm.applicationFieldHasValue('social_security_number');
    await handlerForm.applicationFieldHasValue('postcode');
    await handlerForm.applicationFieldHasValue('school');
    if (is_unlisted_school) {
      await handlerForm.applicationFieldHasValue(
        'school',
        '(Koulua ei löytynyt listalta)'
      );
    }
    await handlerForm.applicationFieldHasValue('phone_number');
    await handlerForm.applicationFieldHasValue('email');
  });

  test('As a handler I can open additional information provided application in handler-ui and see correct additional info data', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationUnlistedSchool();
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
    const handlerFormPage = new HandlerForm(activatedApplication);
    await handlerFormPage.isLoaded();
    const {
      translations: { fi },
    } = getYouthTranslationsApi();
    await handlerFormPage.applicationFieldHasValue(
      'additional_info_user_reasons',
      activatedApplication.additional_info_user_reasons
        ?.map((reason) => fi.additionalInfo.reasons[reason])
        .join('. ') ?? ''
    );
    await handlerFormPage.applicationFieldHasValue(
      'additional_info_description'
    );
  });

  test('As a handler I can open non-activated application, but I will see "youth has not yet activated the application" -error message ', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, formData);
    await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = await new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.applicationIsNotYetActivated();
  });

  test('As a handler I can open automatically accepted application, but I will see "application is activated"-message', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = applicationLivesInHelsinkiAccordingToVtj();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.applicationIsAccepted();
  });

  test('As a handler I can open application with additional info required, but I will see "youth has not yet sent the additional info application" -error message ', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = applicationUnlistedSchool();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getAdditionalInfoPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.additionalInformationRequested();
  });

  test('As a handler I can accept an application with additional info', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = applicationUnlistedSchool();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const additionalInfoPage = await getAdditionalInfoPageComponents(t);
    await additionalInfoPage.expectations.isLoaded();
    const additionalInfo = fakeAdditionalInfoApplication();
    await sendAdditionalInfoApplication(t, additionalInfo);
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = await new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.clickAcceptButton();
    await handlerForm.confirmationDialogIsPresent();
    await handlerForm.clickConfirmAcceptButton();
    await handlerForm.applicationIsAccepted();
  });

  test('As a handler I can reject an application', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = applicationUnlistedSchool();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const additionalInfoPage = await getAdditionalInfoPageComponents(t);
    await additionalInfoPage.expectations.isLoaded();
    const additionalInfo = fakeAdditionalInfoApplication();
    await sendAdditionalInfoApplication(t, additionalInfo);
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.clickRejectButton();
    await handlerForm.confirmationDialogIsPresent();
    await handlerForm.clickConfirmRejectButton();
    await handlerForm.applicationIsRejected();
  });

  test.skip('If I accidentally register application with wrong information, handler can reject it and I can sen another application with same ssn', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const application = applicationUnlistedSchool();
    await sendYouthApplication(t, application);
    const thankYouPage = await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.actions.clickActivationLink();
    const additionalInfoPage = await getAdditionalInfoPageComponents(t);
    await additionalInfoPage.expectations.isLoaded();
    const additionalInfo = fakeAdditionalInfoApplication();
    await sendAdditionalInfoApplication(t, additionalInfo);
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.clickRejectButton();
    await handlerForm.confirmationDialogIsPresent();
    await handlerForm.clickConfirmRejectButton();
    await handlerForm.applicationIsRejected();
    // youth sends another application with same ssn
    await goToFrontPage(t);
    const secondApplication = applicationLivesInHelsinkiAccordingToVtj({
      social_security_number: application.social_security_number,
    });
    await sendYouthApplication(t, secondApplication);
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
  });

  for (const age of [12, 99]) {
    test(`If I'm not in target age group (${age}-years old), I have to give additional information and handler can see warning about the age`, async (t) => {
      const indexPage = await getIndexPageComponents(t);
      await indexPage.expectations.isLoaded();
      const application = applicationLivesInHelsinkiAccordingToVtj({
        social_security_number: FinnishSSN.createWithAge(age),
      });
      await sendYouthApplication(t, application);
      const thankYouPage = await getThankYouPageComponents(t);
      const applicationId = await getUrlParam('id');
      if (!applicationId) {
        throw new Error('cannot complete test without application id');
      }
      await thankYouPage.actions.clickActivationLink();
      const additionalInfoPage = await getAdditionalInfoPageComponents(t);
      await additionalInfoPage.expectations.isLoaded();
      const additionalInfo = fakeAdditionalInfoApplication({
        additional_info_user_reasons: ['underage_or_overage'],
      });
      await sendAdditionalInfoApplication(t, additionalInfo);
      await goToBackendUrl(
        t,
        `/v1/youthapplications/${applicationId}/process/`
      );
      const handlerForm = new HandlerForm();
      await handlerForm.isLoaded();
      await handlerForm.applicantIsNotInTargetGroup(age);
    });
  }
}
