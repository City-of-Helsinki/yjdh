import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import Checkbox from 'kesaseteli/employer/components/application/form/Checkbox';
import ApplicationSummary from 'kesaseteli/employer/components/application/summary/ApplicationSummary';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import useGoToPage from 'shared/hooks/useGoToPage';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';

const Step3Summary: React.FC = () => {
  const { t } = useTranslation();
  const goToPage = useGoToPage();
  const { applicationId } = useApplicationApi();
  const goToThankYouPage = React.useCallback(() => {
    if (applicationId) {
      void goToPage(`/thankyou?id=${applicationId}`);
    }
  }, [applicationId, goToPage]);
  const title = t('common:application.step3.header');
  const tooltip = t('common:application.step3.tooltip');
  return (
    <ApplicationForm title={title} step={3}>
      <ApplicationSummary header={title} tooltip={tooltip} />
      <FormSection columns={1}>
        <Checkbox
          id="termsAndConditions"
          validation={{ required: true }}
          label={
            <Trans
              i18nKey="common:application.form.inputs.termsAndConditions"
              components={{
                a: (
                  <a
                    href={t('common:termsAndConditionsLink')}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {}
                  </a>
                ),
              }}
            >
              {'Olen lukenut palvelun <a>käyttöehdot</a> ja hyväksyn ne.'}
            </Trans>
          }
        />
      </FormSection>
      <ActionButtons onAfterLastStep={goToThankYouPage} />
    </ApplicationForm>
  );
};
export default Step3Summary;
