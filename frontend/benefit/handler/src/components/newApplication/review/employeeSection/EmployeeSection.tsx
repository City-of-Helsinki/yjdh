import { ReviewChildProps } from 'benefit/handler/types/common';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import { $ViewField, $ViewFieldBold } from '../../ApplicationForm.sc';
import EditButton from '../summarySection/EditButton';
import SummarySection from '../summarySection/SummarySection';

const EmploymentSection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
  dispatchStep,
  fields,
}) => {
  const { t } = useTranslation();

  return (
    <SummarySection
      header={t(`${translationsBase}.headings.employment1`)}
      action={
        <EditButton
          section={fields.employee?.firstName.name}
          dispatchStep={dispatchStep}
        />
      }
    >
      <$GridCell $colSpan={6}>
        <$ViewFieldBold large>{`${data.employee?.firstName || ''} ${
          data.employee?.lastName || ''
        }`}</$ViewFieldBold>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.socialSecurityNumber.label`)}
        </$ViewFieldBold>
        <$ViewField>{data.employee?.socialSecurityNumber}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.isLivingInHelsinki.review`)}
        </$ViewFieldBold>
        <$ViewField>
          {t(
            `${translationsBase}.fields.isLivingInHelsinki.${
              data.employee?.isLivingInHelsinki ? 'yes' : 'no'
            }`
          )}
        </$ViewField>
      </$GridCell>
      {data?.company?.organizationType === ORGANIZATION_TYPES.ASSOCIATION && (
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(
              `${translationsBase}.fields.associationImmediateManagerCheck.label`
            )}
          </$ViewFieldBold>
          <$ViewField>
            {t(
              `${translationsBase}.fields.associationImmediateManagerCheck.${
                data.associationImmediateManagerCheck ? 'yes' : 'no'
              }`
            )}
          </$ViewField>
        </$GridCell>
      )}
    </SummarySection>
  );
};

export default EmploymentSection;
