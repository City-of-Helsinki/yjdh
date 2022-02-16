import useYouthApplicationQuery from 'kesaseteli/handler/hooks/backend/useYouthApplicationQuery';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
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

  if (youthApplicationQuery.isLoading) {
    return <PageLoadingSpinner />;
  }
  return (
    <Container>
      <Head>
        <title>{t(`common:appName`)}</title>
      </Head>
      <Heading size="s" header={t('common:handlerApplication.title')} as="h2" />
      {youthApplicationQuery.isSuccess ? (
        <pre>{JSON.stringify(youthApplicationQuery.data, null, 2)}</pre>
      ) : (
        t('common:handlerApplication.notFound')
      )}
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default handlerIndex;
