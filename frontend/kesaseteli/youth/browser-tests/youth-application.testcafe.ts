import HandlerForm from '@frontend/kesaseteli-shared/browser-tests/page-models/HandlerForm';
import {
  fakeActivatedYouthApplication,
  fakeAdditionalInfoApplication,
  fakeYouthApplicationIsDeadAccordingToVtj as isDeadAccordingToVtj,
  fakeYouthApplicationLivesInHelsinkiAccordingToVtj as validApplication,
  fakeYouthApplicationNotFoundFromVtj as notFoundFromVtj,
  fakeYouthApplicationUnlistedSchool as unlistedSchoolApplication,
  fakeYouthApplicationVtjLastNameMismatches as vtjLastNameMismatches,
  fakeYouthApplicationVtjTimeouts as vtjTimeouts,
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
import { getAdditionalInfoPageComponents } from './additional-info-page/additional-info.components';
import { getNotificationPageComponents } from './notification-page/notificationPage.components';
import ErrorPage from './page-models/ErrorPage';
import YouthForm from './page-models/YouthForm';
import { getThankYouPageComponents } from './thank-you-page/thankYouPage.components';
import {
  clickBrowserBackButton,
  getFrontendUrl,
  goToBackendUrl,
  goToFrontPage,
} from './utils/url.utils';

const url = getFrontendUrl('/');
let youthForm: YouthForm;

fixture('Youth Application')
  .page(url)
  .requestHooks(requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    youthForm = new YouthForm();
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('I can send application and return to front page', async (t) => {
  await youthForm.sendYouthApplication(validApplication());
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await youthForm.isLoaded();
});

test('If I send two applications with same email, I will see "email is in use" -message', async (t) => {
  const application = validApplication();
  await youthForm.sendYouthApplication(application);
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await youthForm.isLoaded();
  await youthForm.sendYouthApplication(
    validApplication({
      email: application.email,
    })
  );
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
    await new YouthForm('sv').sendYouthApplication(validApplication());
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
    await new YouthForm('en').sendYouthApplication(unlistedSchoolApplication());
    const thankYouPage = await getThankYouPageComponents(t, 'en');
    await thankYouPage.actions.clickActivationLink();
    const additionalInfo = fakeAdditionalInfoApplication();
    await sendAdditionalInfoApplication(t, additionalInfo, 'en');
  });

  test('If I send and activate application and then I try to activate it again, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    await youthForm.sendYouthApplication(validApplication());
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
    await youthForm.sendYouthApplication(validApplication());
    const thankYouPage = await getThankYouPageComponents(t);
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await thankYouPage.actions.clickActivationLink();
    const expiredPage = await getNotificationPageComponents(t, 'expired');
    await expiredPage.expectations.isLoaded();
  });

  test('If I send an application but it expires, I can send the same application again and activate it', async (t) => {
    const application = validApplication();
    await youthForm.sendYouthApplication(application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.expectations.isLoaded();
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(application);
    const thankYouPage2 = await getThankYouPageComponents(t);
    await thankYouPage2.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
  });

  test('If I have forgot that I already sent and activated an application, and then I send another application with same email, I see  "You already sent a Summer Job Voucher application" -message', async (t) => {
    const application = validApplication();
    await youthForm.sendYouthApplication(application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(
      validApplication({
        email: application.email,
      })
    );
    const alreadyAssignedPage = await getNotificationPageComponents(
      t,
      'alreadyAssigned'
    );
    await alreadyAssignedPage.expectations.isLoaded();
  });

  test('If I have forgot that I already sent and activated an application, and then I send another application with same ssn, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const application = validApplication();
    await youthForm.sendYouthApplication(application);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(
      validApplication({
        social_security_number: application.social_security_number,
      })
    );
    const alreadyAssignedPage = await getNotificationPageComponents(
      t,
      'alreadyAssigned'
    );
    await alreadyAssignedPage.expectations.isLoaded();
  });

  test('If I accidentally send two applications with different emails, and then I activate first application and then second application, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const application = validApplication();
    await youthForm.sendYouthApplication(application);
    await getThankYouPageComponents(t);
    const firstThankYouPageUrl = await getCurrentUrl();
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(
      validApplication({
        social_security_number: application.social_security_number,
      })
    );
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
    const application = validApplication();
    await youthForm.sendYouthApplication(application);
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
    const application = unlistedSchoolApplication();
    await youthForm.sendYouthApplication(application);
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
    await youthForm.sendYouthApplication(validApplication());
    await getThankYouPageComponents(t);
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.applicationIsNotYetActivated();
  });

  test('As a handler I can open automatically accepted application, but I will see "application is activated"-message', async (t) => {
    await youthForm.sendYouthApplication(validApplication());
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
    await youthForm.sendYouthApplication(unlistedSchoolApplication());
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
    await youthForm.sendYouthApplication(unlistedSchoolApplication());
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
    await handlerForm.clickAcceptButton();
    await handlerForm.confirmationDialogIsPresent();
    await handlerForm.clickConfirmAcceptButton();
    await handlerForm.applicationIsAccepted();
  });

  test('As a handler I can reject an application', async (t) => {
    await youthForm.sendYouthApplication(unlistedSchoolApplication());
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
    const application = unlistedSchoolApplication();
    await youthForm.sendYouthApplication(application);
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
    await youthForm.sendYouthApplication(
      validApplication({
        social_security_number: application.social_security_number,
      })
    );
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
  });

  for (const age of [12, 99]) {
    test(`If I'm not in target age group (${age}-years old), I have to give additional information and handler can see warning about the age`, async (t) => {
      await new YouthForm().sendYouthApplication(
        validApplication({
          social_security_number: FinnishSSN.createWithAge(age),
        })
      );
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

  test(`if I send the application but according to VTJ I'm dead, so I see that the data is inadmissible`, async (t) => {
    await youthForm.sendYouthApplication(isDeadAccordingToVtj());
    const inadmissiblePage = await getNotificationPageComponents(
      t,
      'inadmissibleData'
    );
    await inadmissiblePage.expectations.isLoaded();
  });

  test(`if I send the application but my ssn is not found from VTJ, so I see that the data is inadmissible`, async (t) => {
    await youthForm.sendYouthApplication(notFoundFromVtj());
    const inadmissiblePage = await getNotificationPageComponents(
      t,
      'inadmissibleData'
    );
    await inadmissiblePage.expectations.isLoaded();
  });

  test(`If I send the application but VTJ timeouts, I see error page`, async () => {
    await youthForm.sendYouthApplication(vtjTimeouts());
    const errorPage = new ErrorPage();
    await errorPage.isLoaded();
  });

  test(`if I typo my last name, I'm asked to recheck data. Then I can fix the name and activate application.`, async (t) => {
    await youthForm.sendYouthApplication(vtjLastNameMismatches());
    await youthForm.showsCheckNotification();
    await youthForm.typeInput('last_name', validApplication().last_name);
    await youthForm.clickSendButton();
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const acceptedPage = await getNotificationPageComponents(t, 'accepted');
    await acceptedPage.expectations.isLoaded();
  });

  test(`if I fill different last name as in VTJ, I'm asked to recheck data. I can still send it by clicking "send it anyway" -link. Then I have to apply additional info application. Handler is informed about the mismatching last name`, async (t) => {
    await youthForm.sendYouthApplication(vtjLastNameMismatches());
    await youthForm.showsCheckNotification();
    await youthForm.clickSendItAnywayLink();
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
    await handlerForm.applicantsLastnameMismatches();
  });
}
