import withAuth from 'employer/components/withAuth';
import useLogout from 'employer/hooks/useLogout';
import useUserQuery from 'employer/hooks/useUserQuery';
import { Button } from 'hds-react';
import { NextPage } from 'next';
import * as React from 'react';
import Layout from 'shared/components/Layout';

const EmployerIndex: NextPage = () => {
  const { data: user, isLoading, error: loadingUserError } = useUserQuery();
  const logout = useLogout();
  return (
    <Layout headingText="Työnantajan liittymä">
      {isLoading ? 'Ladataan...' : `Hello ${JSON.stringify(user)}!`}
      {loadingUserError && `Tapahtui virhe: ${loadingUserError.message}`}
      <Button onClick={logout} disabled={isLoading}>
        Kirjaudu ulos
      </Button>
    </Layout>
  );
};

export default withAuth(EmployerIndex);
