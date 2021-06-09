import { Button } from 'hds-react';
import withoutAuth from 'kesaseteli/employer/components/withoutAuth';
import useLogin from 'kesaseteli/employer/hooks/useLogin';
import useRouterClearQueryParams from 'kesaseteli/employer/hooks/useRouterClearQueryParams';
import { NextPage } from 'next';
import * as React from 'react';
import Layout from 'shared/components/Layout';

const Login: NextPage = () => {
  const router = useRouterClearQueryParams();
  const {
    query: { logout, error, sessionExpired },
  } = router;
  const login = useLogin();

  return (
    <Layout headingText="Työnantajan liittymä">
      <Button onClick={login}>Kirjaudu sisään</Button>
      {logout && <p>Olet kirjautunut ulos</p>}
      {error && <p>Tapahtui tuntematon virhe. Kirjaudu uudelleen sisään.</p>}
      {sessionExpired && (
        <p>Käyttäjäsessio vanhentui. Kirjaudu uudelleen sisään.</p>
      )}
    </Layout>
  );
};

export default withoutAuth(Login);
