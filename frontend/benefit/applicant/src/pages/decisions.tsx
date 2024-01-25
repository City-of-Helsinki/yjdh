import DecisionsApplicationList from 'benefit/applicant/components/decisions/DecisionsApplicationList';
import DecisionsMainIngress from 'benefit/applicant/components/mainIngress/decisions/DecisionsMainIngress';
import AppContext from 'benefit/applicant/context/AppContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';
import { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ApplicantDecisions: NextPage = () => {
  const { t } = useTranslation();
  const { setIsNavigationVisible } = React.useContext(AppContext);

  useEffect(() => {
    setIsNavigationVisible(true);

    return () => {
      setIsNavigationVisible(false);
    };
  }, [setIsNavigationVisible]);

  return (
    <>
      <Head>
        <title>{t('common:pageTitles.decisions')}</title>
      </Head>
      <DecisionsMainIngress />
      <Container>
        <DecisionsApplicationList />
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicantDecisions);
