import type { SuomiFiData } from '@frontend/shared/browser-tests/actions/login-action';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import type Application from '@frontend/shared/src/types/employer-application';
import type Invoicer from '@frontend/shared/src/types/invoicer';
import { fakeInvoicer } from '@frontend/shared/test/fake-objects';
import TestController from 'testcafe';

import { getApplicationPageComponents } from '../index-page/applicationPage.components';
import { getUrlUtils } from '../utils/url.utils';
import { doEmployerLogin } from './employer-header.actions';

type UserAndApplicationData = { id: Application['id'] } & Invoicer &
  SuomiFiData;

export const loginAndfillInvoicerForm = async (
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
  const invoicerForm = await applicationPageComponents.invoicerForm();
  const invoicerFormData = fakeInvoicer();
  const {
    invoicer_name,
    invoicer_email,
    invoicer_phone_number,
  } = invoicerFormData;
  await invoicerForm.actions.fillName(invoicer_name);
  await invoicerForm.actions.fillEmail(invoicer_email);
  await invoicerForm.actions.fillPhone(invoicer_phone_number);
  await invoicerForm.actions.clickSaveAndContinueButton();
  return { ...invoicerFormData, ...suomiFiData, id: applicationId };
};
