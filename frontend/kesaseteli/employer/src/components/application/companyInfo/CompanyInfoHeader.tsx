import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import type Company from 'shared/types/company';

type Props = { field: keyof Company };

const CompanyInfoHeader: React.FC<Props> = ({ field }: Props) => {
  const { t } = useTranslation();
  return (
    <$GridCell role="gridcell" id={field}>
      {t(`common:application.step1.companyInfoGrid.header.${field}`)}
    </$GridCell>
  );
};

export default CompanyInfoHeader;
