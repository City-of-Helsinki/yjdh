import { Button } from 'hds-react';
import withAuth from 'kesaseteli/employer/components/withAuth';
import useLogoutQuery from 'kesaseteli/employer/hooks/useLogoutQuery';
import useUserQuery from 'kesaseteli/employer/hooks/useUserQuery';
import { NextPage } from 'next';
import * as React from 'react';
import Layout from 'shared/components/Layout';

const EmployerIndex: NextPage = () => {
  const {
    data: user,
    isLoading: isLoadingUser,
    error: loadingUserError,
  } = useUserQuery();
  const {
    mutate: logout,
    isLoading: isLoadingLogout,
    error: logoutError,
  } = useLogoutQuery();
  const isLoading = isLoadingUser || isLoadingLogout || !user;
  const errorMessage = (loadingUserError ?? logoutError)?.message;

  const onLogout = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    logout();
  };

  return (
    <Layout headingText="Työnantajan liittymä">
      {user && <p>Tervetuloa {user.name}!</p>}
      <Button onClick={onLogout} disabled={isLoading}>
        {isLoadingLogout ? 'Kirjaudutaan ulos...' : 'Kirjaudu ulos'}
      </Button>
      {!isLoading && errorMessage && <p>Tapahtui virhe: {errorMessage}</p>}
    </Layout>
  );
};

export default withAuth(EmployerIndex);
