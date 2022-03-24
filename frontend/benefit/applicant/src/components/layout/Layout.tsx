import Footer from 'benefit/applicant/components/footer/Footer';
import Header from 'benefit/applicant/components/header/Header';
import TermsOfService from 'benefit/applicant/components/termsOfService/TermsOfService';
import useUserQuery from 'benefit/applicant/hooks/useUserQuery';
import camelcaseKeys from 'camelcase-keys';
import * as React from 'react';

import { $Main } from './Layout.sc';

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children, ...rest }) => {
  const userQuery = useUserQuery('checkTermsOfServiceApproval', (data) =>
    camelcaseKeys(data, { deep: true })
  );
  const { data: userData, isLoading } = userQuery;

  if (isLoading)
    return (
      <>
        <Header />
        <Footer />
      </>
    );

  return (
    <$Main {...rest}>
      {userData?.termsOfServiceApprovalNeeded ? (
        <TermsOfService />
      ) : (
        <>
          <Header />
          {children}
        </>
      )}
      <Footer />
    </$Main>
  );
};

export default Layout;
