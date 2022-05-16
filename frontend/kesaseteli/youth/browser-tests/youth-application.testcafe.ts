import HandlerForm from '@frontend/kesaseteli-shared/browser-tests/page-models/HandlerForm';
import {
  fakeActivatedYouthApplication,
  fakeAdditionalInfoApplication,
  fakeYouthApplication,
  fakeYouthApplication as getApplication,
} from '@frontend/kesaseteli-shared/src/__tests__/utils/fake-objects';
import Header from '@frontend/shared/browser-tests/page-models/Header';
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

import getYouthTranslationsApi from '../src/__tests__/utils/i18n/get-youth-translations-api';
import getActivationLinkExpirationSeconds from '../src/utils/get-activation-link-expiration-seconds';
import AdditionalInfoPage from './page-models/AdditionalInfoPage';
import ErrorPage from './page-models/ErrorPage';
import NotificationPage from './page-models/NotificationPage';
import ThankYouPage from './page-models/ThankYouPage';
import YouthForm from './page-models/YouthForm';
import {
  clickBrowserBackButton,
  getFrontendUrl,
  goToBackendUrl,
  goToFrontPage,
} from './utils/url.utils';
import {
  applicationNeedsAdditionalInfo,
  attendsHelsinkianSchool,
  attendsUnlistedSchool,
  autoAcceptedApplication,
  hasAge,
  is9thGraderAge,
  isDead,
  isUpperSecondaryEducation1stYearStudentAge,
  livesInHelsinki,
  livesOutsideHelsinki,
  vtjDifferentLastName,
  vtjNotFound,
  vtjTimeout,
} from './utils/youth-application.utils';

const url = getFrontendUrl('/');
let youthForm: YouthForm;
let thankYouPage: ThankYouPage;

const translationsApi = getYouthTranslationsApi();

fixture('Youth Application')
  .page(url)
  .requestHooks(requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    youthForm = new YouthForm();
    thankYouPage = new ThankYouPage();
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test('I can send application and return to front page', async () => {
  await youthForm.sendYouthApplication(autoAcceptedApplication());
  await thankYouPage.isLoaded();
  await thankYouPage.clickGoToFrontPageButton();
  await youthForm.isLoaded();
});

test('If I send two applications with same email, I will see "email is in use" -message', async () => {
  const application = getApplication(autoAcceptedApplication());
  await youthForm.sendYouthApplication(application);
  await thankYouPage.isLoaded();
  await thankYouPage.clickGoToFrontPageButton();
  await youthForm.isLoaded();
  await youthForm.sendYouthApplication(
    getApplication({
      ...is9thGraderAge(),
      email: application.email,
    })
  );
  await new NotificationPage('emailInUse').isLoaded();
});

if (!isRealIntegrationsEnabled()) {
  test("If I'm 9th grader and attend helsinkian school, then application is automatically accepted", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...is9thGraderAge(),
        ...livesOutsideHelsinki,
        ...attendsHelsinkianSchool,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
  });

  test("If I'm 9th grader and live in Helsinki but I attend other unlisted school, then application is automatically accepted", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...is9thGraderAge(),
        ...livesInHelsinki,
        ...attendsUnlistedSchool,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
  });

  test("If I'm upper secondary education first year and I live in Helsinki but I attend other unlisted school, then application is automatically accepted", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...isUpperSecondaryEducation1stYearStudentAge(),
        ...livesInHelsinki,
        ...attendsUnlistedSchool,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
  });

  test('If I fill application in swedish, send it and activate it, I will see activation message in swedish', async () => {
    const header = new Header(translationsApi);
    await header.isLoaded();
    await header.changeLanguage('sv');
    await new YouthForm('sv').sendYouthApplication(autoAcceptedApplication());
    const thankYouPageSv = new ThankYouPage('sv');
    await thankYouPageSv.isLoaded();
    await thankYouPageSv.clickActivationLink();
    await new NotificationPage('accepted', 'sv').isLoaded();
  });

  test("If I'm 9th grader and live outside Helsinki and I attend other unlisted school, then application is automatically accepted", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...is9thGraderAge(),
        ...livesOutsideHelsinki,
        ...attendsUnlistedSchool,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().isLoaded();
  });

  test("If I'm upper secondary education first year and I live outside Helsinki, then I need to also give additional info application", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...isUpperSecondaryEducation1stYearStudentAge(),
        ...livesOutsideHelsinki,
        ...attendsHelsinkianSchool,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().isLoaded();
  });

  test('If I fill the application in english, I will see additional info form also in english', async () => {
    const header = new Header(translationsApi);
    await header.isLoaded();
    await header.changeLanguage('en');
    await new YouthForm('en').sendYouthApplication(
      applicationNeedsAdditionalInfo()
    );
    const thankYouPageEn = new ThankYouPage('en');
    await thankYouPageEn.isLoaded();
    await thankYouPageEn.clickActivationLink();
    await new AdditionalInfoPage('en').isLoaded();
  });

  test('If I send and activate application and then I try to activate it again, I see "You already sent a Summer Job Voucher application" -message', async () => {
    await youthForm.sendYouthApplication(autoAcceptedApplication());
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();

    // reactivating fails
    await clickBrowserBackButton();
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('alreadyActivated').isLoaded();
  });

  test('If I send application, but then I activate it too late, I see "confirmation link has expired" -message', async (t) => {
    await youthForm.sendYouthApplication(autoAcceptedApplication());
    await thankYouPage.isLoaded();
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await thankYouPage.clickActivationLink();
    await new NotificationPage('expired').isLoaded();
  });

  test('If I send an application but it expires, I can send the same application again and activate it', async (t) => {
    const application = autoAcceptedApplication();
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
  });

  test('If I have forgot that I already sent and activated an application, and then I send another application with same email, I see  "You already sent a Summer Job Voucher application" -message', async (t) => {
    const application = autoAcceptedApplication();
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    const acceptedPage = new NotificationPage('accepted');
    await acceptedPage.isLoaded();
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(
      autoAcceptedApplication({
        email: application.email,
      })
    );
    await new NotificationPage('alreadyAssigned').isLoaded();
  });

  test('If I have forgot that I already sent and activated an application, and then I send another application with same ssn, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const application = autoAcceptedApplication();
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(
      autoAcceptedApplication({
        social_security_number: application.social_security_number,
      })
    );
    await new NotificationPage('alreadyAssigned').isLoaded();
  });

  test('If I accidentally send two applications with different emails, and then I activate first application and then second application, I see "You already sent a Summer Job Voucher application" -message', async (t) => {
    const application = autoAcceptedApplication();
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    const firstThankYouPageUrl = await getCurrentUrl();
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(
      autoAcceptedApplication({
        social_security_number: application.social_security_number,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
    await goToUrl(t, firstThankYouPageUrl);
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('alreadyActivated').isLoaded();
  });

  test('As a handler I can open automatically accepted application in handler-ui and see correct application data', async (t) => {
    const application = autoAcceptedApplication();
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    const applicationId = await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
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
    await handlerForm.applicationIsAccepted();
  });

  test('As a handler I can open additional information provided application in handler-ui and see correct additional info data', async (t) => {
    const application = applicationNeedsAdditionalInfo();
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.clickActivationLink();
    const additionalInfo = fakeAdditionalInfoApplication();
    await new AdditionalInfoPage().sendAdditionalInfoApplication(
      additionalInfo
    );

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

  test('As a handler I can see notification when applicant lives outside helsinki and typed diffrent postcode than given in vtj', async (t) => {
    const wrongPostcode = '00100';
    await youthForm.sendYouthApplication(
      applicationNeedsAdditionalInfo({
        ...livesOutsideHelsinki,
        postcode: wrongPostcode,
      })
    );
    await thankYouPage.isLoaded();
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      throw new Error('cannot complete test without application id');
    }
    await thankYouPage.clickActivationLink();
    const additionalInfo = fakeAdditionalInfoApplication();
    await new AdditionalInfoPage().sendAdditionalInfoApplication(
      additionalInfo
    );

    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerFormPage = new HandlerForm();
    await handlerFormPage.isLoaded();
    await handlerFormPage.applicantsPostcodeMismatches(wrongPostcode);
    await handlerFormPage.applicantLivesOutsideHelsinki();
  });

  test('As a handler I can open non-activated application, but I will see "youth has not yet activated the application" -error message ', async (t) => {
    await youthForm.sendYouthApplication(autoAcceptedApplication());
    await thankYouPage.isLoaded();
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
    await youthForm.sendYouthApplication(autoAcceptedApplication());
    await thankYouPage.isLoaded();
    const applicationId = await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.applicationIsAccepted();
  });

  test('As a handler I can open application with additional info required, but I will see "youth has not yet sent the additional info application" -error message ', async (t) => {
    await youthForm.sendYouthApplication(applicationNeedsAdditionalInfo());
    await thankYouPage.isLoaded();
    const applicationId = await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().isLoaded();
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.additionalInformationRequested();
  });

  test('As a handler I can accept an application', async (t) => {
    await youthForm.sendYouthApplication(applicationNeedsAdditionalInfo());
    await thankYouPage.isLoaded();
    const applicationId = await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().sendAdditionalInfoApplication(
      fakeAdditionalInfoApplication()
    );
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    await new HandlerForm().acceptApplication();
  });

  test('As a handler I can reject an application', async (t) => {
    await youthForm.sendYouthApplication(applicationNeedsAdditionalInfo());
    await thankYouPage.isLoaded();
    const applicationId = await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().sendAdditionalInfoApplication(
      fakeAdditionalInfoApplication()
    );
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    await new HandlerForm().rejectApplication();
  });

  test('If I accidentally register application with wrong information, handler can reject it and I can sen another application with same ssn', async (t) => {
    const application = applicationNeedsAdditionalInfo();
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    const applicationId = await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().sendAdditionalInfoApplication(
      fakeAdditionalInfoApplication()
    );
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    await new HandlerForm().rejectApplication();
    // youth sends another application with same ssn
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(
      autoAcceptedApplication({
        social_security_number: application.social_security_number,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
  });

  test('If I accidentally register application with wrong information, handler can reject it and I can sen another application with same email', async (t) => {
    const application = applicationNeedsAdditionalInfo();
    await youthForm.sendYouthApplication(application);
    await thankYouPage.isLoaded();
    const applicationId = await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().sendAdditionalInfoApplication(
      fakeAdditionalInfoApplication()
    );
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    await new HandlerForm().rejectApplication();
    // youth sends another application with same ssn
    await goToFrontPage(t);
    await youthForm.sendYouthApplication(
      autoAcceptedApplication({
        email: application.email,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
  });

  for (const age of [12, 99]) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    test(`If I'm not in target age group (${age}-years old), I have to give additional information and handler can see warning about the age`, async (t) => {
      await new YouthForm().sendYouthApplication(
        fakeYouthApplication({ ...hasAge(age), ...livesInHelsinki })
      );
      await thankYouPage.isLoaded();
      const applicationId = await thankYouPage.clickActivationLink();
      await new AdditionalInfoPage().sendAdditionalInfoApplication(
        fakeAdditionalInfoApplication({
          additional_info_user_reasons: ['underage_or_overage'],
        })
      );
      await goToBackendUrl(
        t,
        `/v1/youthapplications/${applicationId}/process/`
      );
      const handlerForm = new HandlerForm();
      await handlerForm.isLoaded();
      await handlerForm.applicantIsNotInTargetGroup(age);
    });
  }

  test(`if I send the application but according to VTJ I'm dead, so I see that the data is inadmissible`, async () => {
    await youthForm.sendYouthApplication(fakeYouthApplication(isDead));
    await new NotificationPage('inadmissibleData').isLoaded();
  });

  test(`if I send the application but my ssn is not found from VTJ, so I see that the data is inadmissible`, async () => {
    await youthForm.sendYouthApplication(fakeYouthApplication(vtjNotFound));
    await new NotificationPage('inadmissibleData').isLoaded();
  });

  test(`If I send the application but VTJ timeouts, I see error page`, async () => {
    await youthForm.sendYouthApplication(fakeYouthApplication(vtjTimeout));
    await new ErrorPage().isLoaded();
  });

  test(`if I typo my last name, I'm asked to recheck data. Then I can fix the name and activate application.`, async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication(vtjDifferentLastName)
    );
    await youthForm.showsCheckNotification();
    await youthForm.typeInput('last_name', autoAcceptedApplication().last_name);
    await youthForm.clickSendButton();
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
  });

  test(`if I fill different last name as in VTJ, I'm asked to recheck data. I can still send it by clicking "send it anyway" -link. Then I have to apply additional info application. Handler is informed about the mismatching last name`, async (t) => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication(vtjDifferentLastName)
    );
    await youthForm.showsCheckNotification();
    await youthForm.clickSendItAnywayLink();
    await thankYouPage.isLoaded();
    const applicationId = await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().sendAdditionalInfoApplication(
      fakeAdditionalInfoApplication({
        additional_info_user_reasons: ['personal_info_differs_from_vtj'],
      })
    );
    await goToBackendUrl(t, `/v1/youthapplications/${applicationId}/process/`);
    const handlerForm = new HandlerForm();
    await handlerForm.isLoaded();
    await handlerForm.applicantsLastnameMismatches();
  });
}
