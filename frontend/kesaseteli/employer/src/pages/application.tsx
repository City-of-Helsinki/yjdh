import withAuth from 'kesaseteli/employer/hocs/withAuth';
import { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import * as React from 'react';
import Layout from 'shared/components/Layout';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import useApplicationQuery from 'kesaseteli/employer/hooks/useApplicationQuery';

const ApplicationPage: NextPage = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const { isLoading, data: application, error } = useApplicationQuery(id);
  if (isLoading) {
    return <span>Ladataan...</span>;
  }

  if (error) {
    return <span>Virhe: {error?.message}</span>;
  }

  if (!application || !application.company) {
    return <span>Ei löytynyt mitään</span>;
  }

  const { company } = application;

  return (
    <Layout headingText="Hakemus">
      <h3>{company.name}</h3>
      <ul>
        <li>{company.business_id}</li>
        <li>{company.industry}</li>
        <li>{company.street_address}</li>
        <li>{company.postcode}</li>
        <li>{company.city}</li>
      </ul>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
  'common'
);

export default withAuth(ApplicationPage);
