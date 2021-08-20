
import Step1Employer from 'kesaseteli/employer/components/application/steps/step1/Step1Employer';
import Step2Employees from 'kesaseteli/employer/components/application/steps/step2/Step2Employees';
import Step3Summary from 'kesaseteli/employer/components/application/steps/step3/Step3Summary';
import useApplicationIdQueryParam from 'kesaseteli/employer/hooks/application/useApplicationIdQueryParam';
import useGetCurrentStep from 'kesaseteli/employer/hooks/application/useGetCurrentStep';
import { STEPS } from 'kesaseteli/employer/utils/application-wizard.utils';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import ApplicationWizard from 'shared/components/application-wizard/ApplicationWizard';
import withAuth from 'shared/components/hocs/withAuth';
import { StepProps } from 'shared/components/stepper/Step';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';


const ApplicationPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const currentStep = useGetCurrentStep();

  const steps = React.useMemo((): StepProps[] =>
    STEPS.map((number) => ({
      title: t(`common:application.step${number}.name`),
    })), [t]);

  const locale = router.locale ?? DEFAULT_LANGUAGE;
  const applicationId = useApplicationIdQueryParam();
  if (!applicationId) {
    void router.replace(`${locale}/`);
    return null;
  }

  return (
    <ApplicationWizard steps={steps} currentStep={currentStep}
                       header={t('common:application.new')}
    >
      <Step1Employer/>
      <Step2Employees />
      <Step3Summary/>
    </ApplicationWizard>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
  'common'
);

export default withAuth(ApplicationPage);
