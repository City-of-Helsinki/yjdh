import HandlerForm from '@frontend/kesaseteli-shared/browser-tests/page-models/HandlerForm';
import {
  fakeActivatedYouthApplication,
  fakeAdditionalInfoApplication,
  fakeYouthApplication,
} from '@frontend/kesaseteli-shared/src/__tests__/utils/fake-objects';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getUrlParam } from '@frontend/shared/browser-tests/utils/url.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';

import getYouthTranslationsApi from '../src/__tests__/utils/i18n/get-youth-translations-api';
import AdditionalInfoPage from './page-models/AdditionalInfoPage';
import NotificationPage from './page-models/NotificationPage';
import ThankYouPage from './page-models/ThankYouPage';
import YouthForm from './page-models/YouthForm';
import {
  getFrontendUrl,
  goToBackendUrl,
  goToFrontPage,
} from './utils/url.utils';
import {
  applicationNeedsAdditionalInfo,
  attendsUnlistedSchool,
  autoAcceptedApplication,
  hasAge,
  livesInHelsinki,
  livesOutsideHelsinki,
  vtjDifferentLastName,
} from './utils/youth-application.utils';

const url = getFrontendUrl('/');
let youthForm: YouthForm;
let thankYouPage: ThankYouPage;

const translationsApi = getYouthTranslationsApi();

fixture('Handler Application')
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

if (!isRealIntegrationsEnabled()) {
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

  test('If I accidentally register application with wrong information, handler can reject it. Then I can send another application with same ssn', async (t) => {
    const application = autoAcceptedApplication({
      ...livesOutsideHelsinki,
      ...attendsUnlistedSchool,
    });
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
