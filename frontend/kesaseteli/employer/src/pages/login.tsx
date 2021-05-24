import withoutAuth from 'employer/components/withoutAuth';
import useLogin from 'employer/hooks/useLogin';
import useRouterClearQueryParams from 'employer/hooks/useRouterClearQueryParams';
import { Button } from 'hds-react';
import { NextPage } from 'next';
import * as React from 'react';
import Layout from 'shared/components/Layout';

const Login: NextPage = () => {
  const router = useRouterClearQueryParams();
  const {
    query: { logout, error },
  } = router;
  const login = useLogin();

  return (
    <Layout headingText="Työnantajan liittymä">
      <Button onClick={login}>Kirjaudu sisään</Button>
      {error && <p>Tapahtui virhe: error</p>}
      {logout && <p>Olet kirjautunut ulos</p>}
    </Layout>
  );
};

export default withoutAuth(Login);
