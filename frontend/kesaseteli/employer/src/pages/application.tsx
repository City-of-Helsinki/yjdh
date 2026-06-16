import Axios from 'axios';
import Step1EmployerAndEmployment from 'kesaseteli/employer/components/application/steps/step1/Step1EmployerAndEmployment';
import Step2Summary from 'kesaseteli/employer/components/application/steps/step2/Step2Summary';
import withEmployerAuth from 'kesaseteli/employer/hocs/withEmployerAuth';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useStepStorage from 'kesaseteli/employer/hooks/wizard/useStepStorage';
import { GetStaticProps, NextPage } from 'next';
import * as React from 'react';
import ApplicationWizard from 'shared/components/application-wizard/ApplicationWizard';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useGoToPage from 'shared/hooks/useGoToPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ApplicationPage: NextPage = () => {
  const { applicationId, isRouterLoading, applicationQuery } =
    useApplicationApi();
  const [initialStep] = useStepStorage('current');
  const goToPage = useGoToPage();

  if (!isRouterLoading && !applicationId) {
    goToPage('/', 'replace');
    return null;
  }

  if (applicationQuery.isError && 
      Axios.isAxiosError(applicationQuery.error) &&
      applicationQuery.error.response?.status === 404
    ) {
      goToPage('/404', 'replace');
      return null;
    }
    // Non-404 errors (5xx, network failures, etc.) are handled by
    // useApplicationQuery's onError, which redirects to /500 or /login.
    // Show the spinner while that redirect is in progress.

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

export default withEmployerAuth(ApplicationPage);
