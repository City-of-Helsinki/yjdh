import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Employment from 'shared/types/employment';

type Props = {
  index: number;
  employment: Employment;
  fieldName: string;
  children?: React.ReactNode;
};

const EmploymentFieldSummary: React.FC<Props> = ({
  index,
  employment,
  fieldName,
  children,
}) => {
  const { t } = useTranslation();
  const value =
    (fieldName in employment && employment[fieldName as keyof Employment]) ||
    '-';
  const content = !isEmpty(children)
    ? children
    : `${t(`common:application.form.inputs.${fieldName}`)}: ${value}`;
  return (
    <$GridCell as="pre" data-testid={`${fieldName}_${index}`}>
      {content}
    </$GridCell>
  );
};
export default EmploymentFieldSummary;
