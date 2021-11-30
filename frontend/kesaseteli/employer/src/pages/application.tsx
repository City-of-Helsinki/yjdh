import Step1Employer from 'kesaseteli/employer/components/application/steps/step1/Step1Employer';
import Step2Employments from 'kesaseteli/employer/components/application/steps/step2/Step2Employments';
import Step3Summary from 'kesaseteli/employer/components/application/steps/step3/Step3Summary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useStepStorage from 'kesaseteli/employer/hooks/wizard/useStepStorage';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import ApplicationWizard from 'shared/components/application-wizard/ApplicationWizard';
import Container from 'shared/components/container/Container';
import withAuth from 'shared/components/hocs/withAuth';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

const ApplicationPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const locale = router.locale ?? DEFAULT_LANGUAGE;
  const { applicationId, applicationQuery } = useApplicationApi();

  const [initialStep] = useStepStorage('current');

  if (!applicationId) {
    void router.replace(`${locale}/`);
    return <PageLoadingSpinner />;
  }

  if (applicationQuery.isSuccess) {
    if (applicationQuery.data.status !== 'draft') {
      void router.replace(`${locale}/thankyou?id=${applicationId}`);
      return <PageLoadingSpinner />;
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
