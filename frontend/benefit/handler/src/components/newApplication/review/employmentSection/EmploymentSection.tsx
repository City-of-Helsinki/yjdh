import { ReviewChildProps } from 'benefit/handler/types/common';
import { TRUTHY_SUBSIDIES } from 'benefit-shared/constants';
import camelCase from 'lodash/camelCase';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

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
    <>
      <SummarySection
        header={t(`${translationsBase}.headings.employment2`)}
        action={
          <EditButton
            section={fields.employee?.jobTitle.name}
            dispatchStep={dispatchStep}
          />
        }
      >
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.jobTitle.label`)}
          </$ViewFieldBold>
          <$ViewField>{data.employee?.jobTitle || '-'}</$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.workingHours.review`)}
          </$ViewFieldBold>
          <$ViewField>
            {parseFloat(data.employee?.workingHours).toLocaleString('fi-FI')}{' '}
            {t(`${translationsBase}.fields.workingHours.reviewText`)}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.monthlyPay.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {data.employee?.monthlyPay &&
              t(`${translationsBase}.fields.monthlyPay.review`, {
                monthlyPay: formatFloatToCurrency(
                  data.employee.monthlyPay,
                  'EUR',
                  'FI-fi',
                  0
                ),
              })}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.vacationMoney.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {data.employee?.vacationMoney &&
              t(`${translationsBase}.fields.vacationMoney.review`, {
                vacationMoney: formatFloatToCurrency(
                  data.employee.vacationMoney,
                  'EUR',
                  'FI-fi',
                  0
                ),
              })}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.otherExpenses.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {data.employee?.otherExpenses &&
              t(`${translationsBase}.fields.otherExpenses.review`, {
                otherExpenses: formatFloatToCurrency(
                  data.employee.otherExpenses,
                  'EUR',
                  'FI-fi',
                  0
                ),
              })}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(
              `${translationsBase}.fields.collectiveBargainingAgreement.review`
            )}
          </$ViewFieldBold>
          <$ViewField>
            {data.employee?.collectiveBargainingAgreement}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.paySubsidyGranted.review`)}
          </$ViewFieldBold>
          <$ViewField>
            {TRUTHY_SUBSIDIES.has(data.paySubsidyGranted)
              ? t(
                  `${translationsBase}.fields.paySubsidyGranted.${camelCase(
                    data.paySubsidyGranted
                  )}`
                )
              : '-'}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.apprenticeshipProgram.label`)}{' '}
          </$ViewFieldBold>
          <$ViewField>
            {t(
              `${translationsBase}.fields.apprenticeshipProgram.${
                data.apprenticeshipProgram ? 'yes' : 'no'
              }`
            )}
          </$ViewField>
        </$GridCell>
      </SummarySection>

      <SummarySection
        header={t(`${translationsBase}.headings.employment4`)}
        action={
          <EditButton
            section={fields.startDate.name}
            dispatchStep={dispatchStep}
          />
        }
      >
        <$GridCell $colStart={1} $colSpan={12}>
          <$ViewField large>
            {t(`${translationsBase}.dateExplanation`)}
          </$ViewField>
        </$GridCell>
        <$GridCell $colStart={1} $colSpan={2}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.startDate.review`)}
          </$ViewFieldBold>
          <$ViewField>
            {convertToUIDateFormat(data.startDate) || '-'}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={2}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.endDate.review`)}
          </$ViewFieldBold>
          <$ViewField>{convertToUIDateFormat(data.endDate) || '-'}</$ViewField>
        </$GridCell>
      </SummarySection>
    </>
  );
};

export default EmploymentSection;
