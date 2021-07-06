import { useTranslation } from 'next-i18next';
import React from 'react';
import type Company from 'shared/types/company';

import { StyledCompanyInfoHeader } from './styled';

export type CompanyProp = { field: keyof Company };

const CompanyInfoHeader: React.FC<CompanyProp> = ({ field }: CompanyProp) => {
  const { t } = useTranslation();
  return (
    <StyledCompanyInfoHeader>
      {t(`common:application.step1.companyInfo.header.${field}`)}
    </StyledCompanyInfoHeader>
  );
};

export default CompanyInfoHeader;
