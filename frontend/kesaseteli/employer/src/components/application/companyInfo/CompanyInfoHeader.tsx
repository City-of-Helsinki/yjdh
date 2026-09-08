import { $CompanyInfoHeader } from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo.sc';
import type Company from 'kesaseteli-shared/types/company';
import { useTranslation } from 'next-i18next';
import React from 'react';

type Props = { field: keyof Company };

const CompanyInfoHeader: React.FC<Props> = ({ field }: Props) => {
  const { t } = useTranslation();
  return (
    <$CompanyInfoHeader role="gridcell" id={field}>
      {t(`common:application.step1.companyInfoGrid.header.${field}`)}
    </$CompanyInfoHeader>
  );
};

export default CompanyInfoHeader;
