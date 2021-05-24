import React from 'react';
import Layout from 'shared/components/Layout';

const AuthError = (): JSX.Element => (
  <Layout headingText="Työnantajan liittymä">
    <div>Autentikaatio epäonnistui</div>
  </Layout>
);

export default AuthError;
