import type { SuomiFiData } from '@frontend/shared/browser-tests/actions/login-action';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { fakeInvoicer } from '@frontend/shared/src/__tests__/utils/fake-objects';
import type Application from '@frontend/shared/src/types/employer-application';
import type Invoicer from '@frontend/shared/src/types/invoicer';
import TestController from 'testcafe';

import { getApplicationPageComponents } from '../application-page/applicationPage.components';
import { getUrlUtils } from '../utils/url.utils';
import { doEmployerLogin } from './employer-header.actions';

type UserAndApplicationData = { id: Application['id'] } & Invoicer &
  SuomiFiData;

export const loginAndfillStep1Form = async (
  t: TestController
): Promise<UserAndApplicationData> => {
  const urlUtils = getUrlUtils(t);
  const applicationPageComponents = getApplicationPageComponents(t);
  const suomiFiData = await doEmployerLogin(t);
  const applicationId = await urlUtils.expectations.urlChangedToApplicationPage(
    'fi'
  );
  if (!applicationId) {
    throw new Error('application id is missing');
  }
  if (isRealIntegrationsEnabled() && suomiFiData?.company) {
    const companyTable = await applicationPageComponents.companyTable(
      suomiFiData.company
    );
    await companyTable.expectations.isCompanyDataPresent();
  }
  const step1 = await applicationPageComponents.step1();
  const invoicerFormData = fakeInvoicer();
  const { invoicer_name, invoicer_email, invoicer_phone_number } =
    invoicerFormData;

  await step1.actions.fillName(invoicer_name);
  await step1.actions.fillEmail(invoicer_email);
  await step1.actions.fillPhone(invoicer_phone_number);
  await step1.actions.clickSaveAndContinueButton();

  return { ...invoicerFormData, ...suomiFiData, id: applicationId };
};
