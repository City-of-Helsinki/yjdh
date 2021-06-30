import SC from 'kesaseteli/employer/components/companyInfo/CompanyInfo.sc';
import { useTranslation } from 'next-i18next';
import React from 'react';
import type Company from 'shared/types/company';

export type CompanyProp = { field: keyof Company };

const CompanyInfoHeader: React.FC<CompanyProp> = ({ field }: CompanyProp) => {
  const { t } = useTranslation();
  return (
    <SC.CompanyInfoHeader>
      {t(`common:application.step1.companyInfo.header.${field}`)}
    </SC.CompanyInfoHeader>
  );
};

export default CompanyInfoHeader;
