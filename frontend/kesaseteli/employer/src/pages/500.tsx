import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import ServerErrorPage from 'shared/components/pages/ServerErrorPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const FiveHundred: NextPage = () => {
  const { mutate: logout } = useLogoutQuery();
  return <ServerErrorPage logout={logout as () => void} />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(FiveHundred);
