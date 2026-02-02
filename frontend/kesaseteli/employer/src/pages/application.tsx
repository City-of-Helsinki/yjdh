import Step1EmployerAndEmployment from 'kesaseteli/employer/components/application/steps/step1/Step1EmployerAndEmployment';
import Step2Summary from 'kesaseteli/employer/components/application/steps/step2/Step2Summary';
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
    goToPage('/', 'replace');
    return null;
  }

  if (applicationQuery.isSuccess) {
    if (applicationQuery.data.status !== 'draft' && applicationId) {
      goToPage(`/thankyou?id=${applicationId}`, 'replace');
    }

    return (
      <Container>
        <Head>
          <title>
            {t('common:application.new')} | {t(`common:appName`)}
          </title>
        </Head>
        <ApplicationWizard initialStep={initialStep}>
          <Step1EmployerAndEmployment />
          <Step2Summary />
        </ApplicationWizard>
      </Container>
    );
  }
  return <PageLoadingSpinner />;
};


export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicationPage);
