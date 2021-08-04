import CompanyInfoHeader, {
  CompanyProp,
} from 'kesaseteli/employer/components/companyInfo/CompanyInfoHeader';
import useCompanyQuery from 'kesaseteli/employer/hooks/useCompanyQuery';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import isServerSide from 'shared/server/is-server-side';

import { $CompanyInfoContainer, $CompanyInfoRow } from './CompanyInfo.sc';

type Props = {
  applicationId: string;
};

const CompanyInfo: React.FC<Props> = ({ applicationId }: Props) => {
  const { data: company, error, isLoading } = useCompanyQuery(applicationId);
  const CompanyFieldCell: React.FC<CompanyProp> = ({ field }: CompanyProp) => (
    <$CompanyInfoRow>
      {isLoading && !isServerSide() && <LoadingSkeleton width="90%" />}
      {(!isLoading && !error && company?.[field]) || ''}
    </$CompanyInfoRow>
  );

  return (
    <$CompanyInfoContainer>
      <CompanyInfoHeader field="name" />
      <CompanyInfoHeader field="business_id" />
      <CompanyInfoHeader field="industry" />
      <CompanyInfoHeader field="company_form" />
      <CompanyInfoHeader field="postcode" />
      <CompanyInfoHeader field="city" />
      <CompanyFieldCell field="name" />
      <CompanyFieldCell field="business_id" />
      <CompanyFieldCell field="industry" />
      <CompanyFieldCell field="company_form" />
      <CompanyFieldCell field="postcode" />
      <CompanyFieldCell field="city" />
    </$CompanyInfoContainer>
  );
};

export default CompanyInfo;
