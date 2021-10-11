import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import Checkbox from 'kesaseteli/employer/components/application/form/Checkbox';
import ApplicationSummary from 'kesaseteli/employer/components/application/summary/ApplicationSummary';
import useApplicationIdQueryParam from 'kesaseteli/employer/hooks/application/useApplicationIdQueryParam';
import useSetCurrentStep from 'kesaseteli/employer/hooks/application/useSetCurrentStep';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import { getApplicationFormFieldLabel } from 'shared/utils/application.utils';

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
  const title = t('common:application.step3.header');
  const tooltip = t('common:application.step3.tooltip');

  useSetCurrentStep();
  return (
    <ApplicationForm title={title}>
      <ApplicationSummary header={title} tooltip={tooltip} />
      <FormSection columns={1}>
        <Checkbox
          id="termsAndConditions"
          validation={{ required: true }}
          label={
            <Trans
              i18nKey={getApplicationFormFieldLabel(t, 'termsAndConditions')}
              t={t}
            >
              Olen lukenut palvelun{' '}
              <a
                href={t('common:termsAndConditionsLink')}
                rel="noopener noreferrer"
                target="_blank"
              >
                käyttöehdot
              </a>{' '}
              ja hyväksyn ne.
            </Trans>
          }
        />
      </FormSection>
      <ActionButtons onAfterLastStep={goToThankYouPage} />
    </ApplicationForm>
  );
};
export default Step3Summary;
