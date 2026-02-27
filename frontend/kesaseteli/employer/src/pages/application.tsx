import Step1EmployerAndEmployment from 'kesaseteli/employer/components/application/steps/step1/Step1EmployerAndEmployment';
import Step2Summary from 'kesaseteli/employer/components/application/steps/step2/Step2Summary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useStepStorage from 'kesaseteli/employer/hooks/wizard/useStepStorage';
import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import ApplicationWizard from 'shared/components/application-wizard/ApplicationWizard';
import withAuth from 'shared/components/hocs/withAuth';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useGoToPage from 'shared/hooks/useGoToPage';
import useLeaveConfirm from 'shared/hooks/useLeaveConfirm';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ApplicationPage: NextPage = () => {
  const { t } = useTranslation();
  const { applicationId, isRouterLoading, applicationQuery } =
    useApplicationApi();
  const [initialStep] = useStepStorage('current');
  const goToPage = useGoToPage();

  useLeaveConfirm(
    Boolean(applicationId) && applicationQuery.data?.status === 'draft',
    t('common:application.buttons.leave_confirmation')
  );

  if (!isRouterLoading && !applicationId) {
    goToPage('/', 'replace');
    return null;
  }

  if (applicationQuery.isSuccess) {
    if (applicationQuery.data.status !== 'draft' && applicationId) {
      goToPage(`/thankyou?id=${applicationId}`, 'replace');
    }

    return (
      <ApplicationWizard initialStep={initialStep}>
        <Step1EmployerAndEmployment />
        <Step2Summary />
      </ApplicationWizard>
    );
  }
  return <PageLoadingSpinner />;
};


export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicationPage);
