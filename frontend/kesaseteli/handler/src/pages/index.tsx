import HandlerForm from 'kesaseteli/handler/components/form/HandlerForm';
import useYouthApplicationQuery from 'kesaseteli/handler/hooks/backend/useYouthApplicationQuery';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import NotificationPage from 'shared/components/pages/NotificationPage';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useIdQueryParam from 'shared/hooks/useIdQueryParam';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const handlerIndex: NextPage = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const applicationId = useIdQueryParam();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const youthApplicationQuery = useYouthApplicationQuery(applicationId);

  if (youthApplicationQuery.isError || !applicationId) {
    return (
      <NotificationPage
        title={t('common:handlerApplication.notFound')}
        type="alert"
      />
    );
  }
  if (youthApplicationQuery.isSuccess) {
    return (
      <Container>
        <Head>
          <title>{t(`common:appName`)}</title>
        </Head>
        <HandlerForm application={youthApplicationQuery.data} />
      </Container>
    );
  }
  return <PageLoadingSpinner />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default handlerIndex;
