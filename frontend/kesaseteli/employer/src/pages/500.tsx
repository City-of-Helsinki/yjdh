import useLogout from 'kesaseteli/employer/hooks/backend/useLogout';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import ServerErrorPage from 'shared/components/pages/ServerErrorPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const FiveHundred: NextPage = () => {
  const logout = useLogout();
  return <ServerErrorPage logout={logout} />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(FiveHundred);
