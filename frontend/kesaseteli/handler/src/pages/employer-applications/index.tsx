import EmployerApplicationList from 'kesaseteli/handler/components/applicationList/EmployerApplicationList';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import styled from 'styled-components';

const $PageContainer = styled(Container)`
  position: relative;
  z-index: 0;

  & > div {
    min-width: 0;
  }
`;

function EmployerApplicationsIndex(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <$PageContainer>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>
      <FormSectionHeading
        size="l"
        header={t('common:header.employerApplicationsLabel')}
        as="h1"
      />
      <EmployerApplicationList />
    </$PageContainer>
  );
}

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default EmployerApplicationsIndex;
