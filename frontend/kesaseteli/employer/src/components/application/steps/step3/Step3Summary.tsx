import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import Checkbox from 'kesaseteli/employer/components/application/form/Checkbox';
import ApplicationSummary from 'kesaseteli/employer/components/application/summary/ApplicationSummary';
import useApplicationIdQueryParam from 'kesaseteli/employer/hooks/application/useApplicationIdQueryParam';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

const Step3Summary: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LANGUAGE;
  const applicationId = useApplicationIdQueryParam();
  const goToThankYouPage = React.useCallback(() => {
    if (applicationId) {
      void router.push(`${locale}/thankyou?id=${applicationId}`);
    }
  }, [applicationId, router, locale]);

  return (
    <ApplicationForm stepTitle={t('common:application.step3.header')}>
      <ApplicationSummary />
      <FormSection columns={1}>
        <Checkbox id="termsAndConditions" validation={{ required: true }} />
      </FormSection>
      <ActionButtons onAfterLastStep={goToThankYouPage} />
    </ApplicationForm>
  );
};
export default Step3Summary;
