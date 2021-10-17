import Step1Employer from 'kesaseteli/employer/components/application/steps/step1/Step1Employer';
import Step2Employments from 'kesaseteli/employer/components/application/steps/step2/Step2Employments';
import Step3Summary from 'kesaseteli/employer/components/application/steps/step3/Step3Summary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useGetCurrentStep from 'kesaseteli/employer/hooks/application/useGetCurrentStep';
import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import ApplicationWizard from 'shared/components/application-wizard/ApplicationWizard';
import withAuth from 'shared/components/hocs/withAuth';
import ErrorPage from 'shared/components/pages/ErrorPage';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

const ApplicationPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const initialStep = useGetCurrentStep();

  const locale = router.locale ?? DEFAULT_LANGUAGE;
  const { applicationId, applicationQuery } = useApplicationApi();

  const { mutate: logout } = useLogoutQuery();

  const refreshPage = (): void => {
    router.reload();
  };

  if (!applicationId) {
    void router.replace(`${locale}/`);
    return <PageLoadingSpinner />;
  }

  if (applicationQuery.isSuccess) {
    return (
      <ApplicationWizard initialStep={initialStep}>
        <Step1Employer />
        <Step2Employments />
        <Step3Summary />
      </ApplicationWizard>
    );
  }
  if (applicationQuery.isError) {
    return (
      <ErrorPage
        title={t('common:errorPage.title')}
        message={t('common:errorPage.message')}
        logout={logout as () => void}
        retry={refreshPage}
      />
    );
  }
  return <PageLoadingSpinner />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicationPage);
