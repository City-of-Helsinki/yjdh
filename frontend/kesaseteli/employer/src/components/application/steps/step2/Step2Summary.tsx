import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import ApplicationSummary from 'kesaseteli/employer/components/application/summary/ApplicationSummary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useWizard from 'shared/hooks/useWizard';

import Checkbox from '../../form/Checkbox';

const Step2Summary: React.FC = () => {
  const { t } = useTranslation();
  const { applicationQuery } = useApplicationApi();
  const { goToStep } = useWizard();

  const vouchers = React.useMemo(
    () => applicationQuery.data?.summer_vouchers || [],
    [applicationQuery.data?.summer_vouchers]
  );
  const lastVoucher = vouchers[vouchers.length - 1];

  React.useEffect(() => {
    if (applicationQuery.isSuccess && vouchers.length === 0) {
      goToStep(0);
    }
  }, [applicationQuery.isSuccess, vouchers.length, goToStep]);

  const title = t('common:application.step2.header');

  if (vouchers.length === 0) {
    return <PageLoadingSpinner />; // Avoid rendering empty summary while redirecting
  }

  return (
    <ApplicationForm title={title} step={2}>
      <ApplicationSummary header={title} filterVoucherId={lastVoucher?.id} />
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
      <ActionButtons />
    </ApplicationForm>
  );
};

export default Step2Summary;
