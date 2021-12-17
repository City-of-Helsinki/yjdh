import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import ServerErrorPage from 'shared/components/pages/ServerErrorPage';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const FiveHundred: NextPage = () => {
  const logoutQuery = useLogoutQuery();
  const onError = useErrorHandler(false);
  const logout = React.useCallback(
    () => logoutQuery.mutate({}, { onError }),
    [logoutQuery, onError]
  );
  return <ServerErrorPage logout={logout} />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(FiveHundred);
