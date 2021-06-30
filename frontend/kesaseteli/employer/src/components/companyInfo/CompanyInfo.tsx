import useCompanyQuery from 'kesaseteli/employer/hooks/useCompanyQuery';
import { useTranslation } from 'next-i18next';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import isServerSide from 'shared/server/is-server-side';
import Company from 'shared/types/company';

import SC from './CompanyInfo.sc';

type CompanyProp = { field: keyof Company };

const CompanyInfoHeader: React.FC<CompanyProp> = ({ field }: CompanyProp) => {
  const { t } = useTranslation();
  return (
    <SC.CompanyInfoHeader>
      {t(`common:application.step1.companyInfo.header.${field}`)}
    </SC.CompanyInfoHeader>
  );
};

type Props = {
  applicationId: string;
};

const CompanyInfo: React.FC<Props> = ({ applicationId }: Props) => {
  const { data: company, error, isLoading } = useCompanyQuery(applicationId);
  const CompanyFieldCell: React.FC<CompanyProp> = ({ field }: CompanyProp) => (
    <SC.CompanyInfoRow>
      {isLoading && !isServerSide() && <LoadingSkeleton width="90%" />}
      {(!isLoading && !error && company?.[field]) || ''}
    </SC.CompanyInfoRow>
  );

  return (
    <SC.CompanyInfoContainer>
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
    </SC.CompanyInfoContainer>
  );
};

export default CompanyInfo;
