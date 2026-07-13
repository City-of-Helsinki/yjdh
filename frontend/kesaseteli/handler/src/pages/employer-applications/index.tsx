import EmployerApplicationList from 'kesaseteli/handler/components/applicationList/EmployerApplicationList';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

function EmployerApplicationsIndex(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Container>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>
      <FormSectionHeading
        size="l"
        header={t('common:header.employerApplicationsLabel')}
        as="h1"
      />
      <EmployerApplicationList />
    </Container>
  );
}

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default EmployerApplicationsIndex;
