import Step1Employer from 'kesaseteli/employer/components/application/steps/step1/Step1Employer';
import Step2Employments from 'kesaseteli/employer/components/application/steps/step2/Step2Employments';
import Step3Summary from 'kesaseteli/employer/components/application/steps/step3/Step3Summary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useStepStorage from 'kesaseteli/employer/hooks/wizard/useStepStorage';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import ApplicationWizard from 'shared/components/application-wizard/ApplicationWizard';
import Container from 'shared/components/container/Container';
import withAuth from 'shared/components/hocs/withAuth';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useGoToPage from 'shared/hooks/useGoToPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ApplicationPage: NextPage = () => {
  const { t } = useTranslation();
  const { applicationId, isRouterLoading, applicationQuery } =
    useApplicationApi();
  const [initialStep] = useStepStorage('current');
  const goToPage = useGoToPage();

  if (!isRouterLoading && !applicationId) {
    void goToPage('/', { operation: 'replace' });
    return null;
  }

  if (applicationQuery.isSuccess) {
    if (applicationQuery.data.status !== 'draft' && applicationId) {
      void goToPage(`/thankyou?id=${applicationId}`, { operation: 'replace' });
    }

    return (
      <Container>
        <Head>
          <title>
            {t('common:application.new')} | {t(`common:appName`)}
          </title>
        </Head>
        <ApplicationWizard initialStep={initialStep}>
          <Step1Employer />
          <Step2Employments />
          <Step3Summary />
        </ApplicationWizard>
      </Container>
    );
  }
  return <PageLoadingSpinner />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicationPage);
