import { Notification } from 'hds-react';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

const EmployerIndex: NextPage = () => {
  const {
    data: applications,
    isLoading,
    error: loadApplicationsError,
  } = useApplicationsQuery();
  const { mutate: createApplication, error: createApplicationError } =
    useCreateApplicationQuery();

  const errorMessage = (loadApplicationsError ?? createApplicationError)
    ?.message;
  const isError = !!errorMessage;
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LANGUAGE;

  React.useEffect(() => {
    if (!isLoading && !isError) {
      if (applications && applications.length > 0) {
        const draftApplication = applications[0];
        void router.push(`${locale}/application?id=${draftApplication.id}`);
      } else {
        createApplication();
      }
    }
  }, [isLoading, applications, createApplication, router, locale, isError]);

  const { t } = useTranslation();
  if (errorMessage) {
    return (
      <Notification
        label={`${t(`common:application.common_error`)} ${errorMessage}`}
        type="error"
      />
    );
  }

  return <></>;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(EmployerIndex);
