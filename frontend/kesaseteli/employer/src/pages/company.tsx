import withAuth from 'kesaseteli/employer/components/withAuth';
import useCompanyQuery from 'kesaseteli/employer/hooks/useCompanyQuery';
import { NextPage } from 'next';
import * as React from 'react';
import Layout from 'shared/components/Layout';

const CompanyPage: NextPage = () => {
  const { isLoading, data: company, error, isLoadingError } = useCompanyQuery();
  if (isLoading) {
    return <span>Ladataan...</span>;
  }

  if (error || isLoadingError) {
    return <span>Virhe: {error?.message}</span>;
  }

  if (!company) {
    return <span>Ei löytynyt mitään</span>;
  }

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

export default withAuth(CompanyPage);
