import { useTranslation } from 'next-i18next';
import React from 'react';
import type Company from 'shared/types/company';

import { $CompanyInfoHeader } from './CompanyInfo.sc';

export type CompanyProp = { field: keyof Company };

const CompanyInfoHeader: React.FC<CompanyProp> = ({ field }: CompanyProp) => {
  const { t } = useTranslation();
  return (
    <$CompanyInfoHeader>
      {t(`common:application.step1.companyInfo.header.${field}`)}
    </$CompanyInfoHeader>
  );
};

export default CompanyInfoHeader;
