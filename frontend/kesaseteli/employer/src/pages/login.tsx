import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import withoutAuth from 'shared/components/hocs/withoutAuth';
import Layout from 'shared/components/Layout';
import useClearQueryParams from 'shared/hooks/useClearQueryParams';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const Login: NextPage = () => {
  useClearQueryParams();
  const {
    query: { logout, error, sessionExpired },
  } = useRouter();
  return (
    <Container>
      <Layout headingText="Työnantajan liittymä">
        {logout && <p>Olet kirjautunut ulos</p>}
        {error && <p>Tapahtui tuntematon virhe. Kirjaudu uudelleen sisään.</p>}
        {sessionExpired && (
          <p>Käyttäjäsessio vanhentui. Kirjaudu uudelleen sisään.</p>
        )}
      </Layout>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
  'common'
);

export default withoutAuth(Login);
