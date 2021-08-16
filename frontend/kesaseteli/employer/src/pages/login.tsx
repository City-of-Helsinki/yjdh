import useRouterClearQueryParams from 'kesaseteli/employer/hooks/useRouterClearQueryParams';
import { GetStaticProps, NextPage } from 'next';
import * as React from 'react';
import withoutAuth from 'shared/components/hocs/withoutAuth';
import Layout from 'shared/components/Layout';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const Login: NextPage = () => {
  const router = useRouterClearQueryParams();
  const {
    query: { logout, error, sessionExpired },
  } = router;
  return (
    <Layout headingText="Työnantajan liittymä">
      {logout && <p>Olet kirjautunut ulos</p>}
      {error && <p>Tapahtui tuntematon virhe. Kirjaudu uudelleen sisään.</p>}
      {sessionExpired && (
        <p>Käyttäjäsessio vanhentui. Kirjaudu uudelleen sisään.</p>
      )}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
  'common'
);

export default withoutAuth(Login);
