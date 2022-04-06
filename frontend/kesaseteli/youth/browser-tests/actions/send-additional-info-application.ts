import AdditionalInfoApplication from '@frontend/kesaseteli-shared/src/types/additional-info-application';
import { Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import { getAdditionalInfoPageComponents } from '../additional-info-page/additional-info.components';

const sendAdditionalInfoApplication = async (
  t: TestController,
  application: AdditionalInfoApplication,
  language?: Language
): Promise<void> => {
  const additionalInfoPage = await getAdditionalInfoPageComponents(t, language);
  await additionalInfoPage.expectations.isLoaded();
  await additionalInfoPage.actions.clickAndSelectReasonsFromDropdown(
    application.additional_info_user_reasons
  );
  await additionalInfoPage.actions.typeAdditionalInfoDescription(
    application.additional_info_description
  );
  await additionalInfoPage.actions.clickSendButton();
  await additionalInfoPage.expectations.showsNotification('sent');
};

export default sendAdditionalInfoApplication;
