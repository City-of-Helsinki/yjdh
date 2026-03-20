import {
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
  goToFrontPage,
} from './utils/url.utils';
import {
  applicationNeedsAdditionalInfo,
  attendsHelsinkianSchool,
  attendsUnlistedSchool,
  autoAcceptedApplication,
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
    getApplication({ email: application.email })
  );
  await new NotificationPage('emailInUse').isLoaded();
});

if (!isRealIntegrationsEnabled()) {
  test("If I'm 9th grader and I attend helsinkian school but I live outside Helsinki, then I need to also give additional info application", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...is9thGraderAge(),
        ...livesOutsideHelsinki,
        ...attendsHelsinkianSchool,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new AdditionalInfoPage().isLoaded();
  });

  test("If I'm 9th grader and live in Helsinki and I attend other unlisted school, then application is automatically accepted", async () => {
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

  test("If I'm 9th grader and live in Helsinki and I attend helsinkian school, then application is automatically accepted", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...is9thGraderAge(),
        ...livesInHelsinki,
        ...attendsHelsinkianSchool,
      })
    );
    await thankYouPage.isLoaded();
    await thankYouPage.clickActivationLink();
    await new NotificationPage('accepted').isLoaded();
  });

  test("If I'm upper secondary education first year and I attend helsinkian school but I live outside Helsinki, then I need to also give additional info application", async () => {
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

  test("If I'm upper secondary education first year and live in Helsinki and I attend other unlisted school, then application is automatically accepted", async () => {
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

  test("If I'm upper secondary education first year and live in Helsinki and I attend helsinkian school, then application is automatically accepted", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...isUpperSecondaryEducation1stYearStudentAge(),
        ...livesInHelsinki,
        ...attendsHelsinkianSchool,
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

  test("If I'm 9th grader and live outside Helsinki and I attend other unlisted school, then I need to also give additional info application", async () => {
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

  test("If I'm upper secondary education first year and I live outside Helsinki and I attend other unlisted school, then I need to also give additional info application", async () => {
    await youthForm.sendYouthApplication(
      fakeYouthApplication({
        ...isUpperSecondaryEducation1stYearStudentAge(),
        ...livesOutsideHelsinki,
        ...attendsUnlistedSchool,
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
}
