import { Button, IconPlus } from 'hds-react';
import withAuth from 'kesaseteli/employer/hocs/withAuth';
import useUserQuery from 'kesaseteli/employer/hooks/useUserQuery';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import * as React from 'react';
import Layout from 'shared/components/Layout';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

const EmployerIndex: NextPage = () => {
  const {
    data: user,
    isLoading: isLoadingUser,
    error: loadingUserError,
  } = useUserQuery();
  const isLoading = isLoadingUser || !user;
  const errorMessage = loadingUserError?.message;

  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LANGUAGE;
  const handleNewApplicationClick = (): void => {
    void router.push(`${locale}/company`);
  };

  return (
    <Layout headingText="Työnantajan liittymä">
      {user && <p>Tervetuloa {user.name}!</p>}
      {!isLoading && errorMessage && <p>Tapahtui virhe: {errorMessage}</p>}
      <Button iconLeft={<IconPlus />} onClick={handleNewApplicationClick}>
        Luo uusi hakemus
      </Button>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
  'common'
);

export default withAuth(EmployerIndex);
