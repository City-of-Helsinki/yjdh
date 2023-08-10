import { ReviewChildProps } from 'benefit/handler/types/common';
import { BENEFIT_TYPES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';

import { $ViewField, $ViewFieldBold } from '../../ApplicationForm.sc';
import SummarySection from '../summarySection/SummarySection';

const EmploymentSection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <SummarySection
        header={t(`${translationsBase}.headings.employment3`)}
        withoutDivider
      >
        <$GridCell $colSpan={5}>
          <$ViewField>
            {`${t(`${translationsBase}.fields.benefitType.label`)}: `}
            <$ViewFieldBold>
              {t(
                `${translationsBase}.fields.benefitType.${
                  data.benefitType?.split('_')[0] || ''
                }`
              )}
            </$ViewFieldBold>
          </$ViewField>
        </$GridCell>
      </SummarySection>
      <SummarySection>
        <$GridCell $colStart={1} $colSpan={2}>
          <$ViewField>
            {t(`${translationsBase}.fields.startDate.label`)}
          </$ViewField>
          <$ViewField>
            {convertToUIDateFormat(data.startDate) || '-'}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={2}>
          <$ViewField>
            {t(`${translationsBase}.fields.endDate.label`)}
          </$ViewField>
          <$ViewField>{convertToUIDateFormat(data.endDate) || '-'}</$ViewField>
        </$GridCell>
      </SummarySection>
      {(data.benefitType === BENEFIT_TYPES.SALARY ||
        data.benefitType === BENEFIT_TYPES.EMPLOYMENT) && (
        <SummarySection
          header={t(`${translationsBase}.headings.employment5Employment`)}
        >
          <$GridCell $colSpan={5}>
            <$ViewField>
              {`${t(`${translationsBase}.fields.jobTitle.label`)}: ${
                data.employee?.jobTitle || '-'
              }`}
            </$ViewField>
            <$ViewField>
              {t(`${translationsBase}.fields.workingHours.view`, {
                workingHours: formatStringFloatValue(
                  data.employee?.workingHours
                ),
              })}
            </$ViewField>
            <$ViewField>
              {t(`${translationsBase}.fields.monthlyPay.view`, {
                monthlyPay: formatStringFloatValue(data.employee?.monthlyPay),
              })}
            </$ViewField>
            <$ViewField>
              {t(`${translationsBase}.fields.otherExpenses.view`, {
                otherExpenses: formatStringFloatValue(
                  data.employee?.otherExpenses
                ),
              })}
            </$ViewField>
            <$ViewField
              css={`
                &&& {
                  padding-bottom: 0;
                }
              `}
            >
              {t(`${translationsBase}.fields.vacationMoney.view`, {
                vacationMoney: formatStringFloatValue(
                  data.employee?.vacationMoney
                ),
              })}
            </$ViewField>
            <$ViewField>
              {data.employee?.collectiveBargainingAgreement}
            </$ViewField>
          </$GridCell>
        </SummarySection>
      )}
    </>
  );
};

export default EmploymentSection;
