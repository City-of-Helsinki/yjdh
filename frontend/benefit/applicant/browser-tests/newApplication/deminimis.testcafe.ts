import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Role, Selector } from 'testcafe';

import Login from '../page-model/login';
import MainIngress from '../page-model/MainIngress';
import Step1 from '../page-model/step1';
import Step2 from '../page-model/step2';

import TermsOfService from '../page-model/TermsOfService';
import { getFrontendUrl } from '../utils/url.utils';
import WizardStep from '../page-model/WizardStep';
import ApplicantPageComponent from '../page-model/ApplicantPageComponent';

const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

const url = getFrontendUrl('/');

const applicantRole = Role(
  url,
  async (t: TestController) => {
    await t.click(Login.loginButton);
    const termsAndConditions = new TermsOfService();
    await termsAndConditions.isLoaded();
    await termsAndConditions.clickContinueButton();
  },
  {
    preserveUrl: true,
  }
);

let step1: Step1;
let step2: Step2;

fixture('Frontpage')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (testController) => {
    step1 = new Step1();
    step2 = new Step2();
    clearDataToPrintOnFailure(testController);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

const fillMandatoryFields = async (t: TestController) => {
  const mainIngress = new MainIngress();
  await mainIngress.isLoaded();
  await mainIngress.clickCreateNewApplicationButton();

  await step1.isLoaded(60_000);

  await step1.fillEmployerInfo('6051437344779954', false);
  await step1.fillContactPerson(
    'Raven',
    'Stamm',
    '050001234',
    'Raven_Stamm@example.net'
  );
  await step1.selectNocoOperationNegotiations();
};

test('De Minimis aid form', async (t: TestController) => {
  await t.useRole(applicantRole);
  await fillMandatoryFields(t);

  await step1.selectYesDeMinimis();
  await step1.fillDeminimisAid(
    'De minimis -tuen ystävät',
    '199999',
    '1.1.2023'
  );
  await step1.fillDeminimisAid('Foo', '2', '1.1.2023');
  await step1.clickSubmit();

  const toastError = Selector('.Toastify__toast-body[role="alert"]')
    .withText('Tapahtui virhe')
    .with({ timeout: 500 });
  await t
    .expect(toastError.visible)
    .ok('', { timeout: 500, allowUnawaitedPromise: true });

  const deminimisMaxError = Selector(
    '[data-testid="deminimis-maxed-notification"]'
  ).with({ timeout: 500 });
  await t
    .expect(deminimisMaxError.visible)
    .ok('', { timeout: 500, allowUnawaitedPromise: true });

  await step1.clickDeminimisRemove(1);
  await step1.fillDeminimisAid('Bar', '1', '');
  await step1.fillDeminimisAid('Baz', '1', '2.2.2023');

  await step1.clickSubmit();
});
