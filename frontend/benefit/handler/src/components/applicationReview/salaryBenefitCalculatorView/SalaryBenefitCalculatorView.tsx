import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import {
  CALCULATION_SUMMARY_ROW_TYPES,
  CALCULATION_TOTAL_ROW_TYPE,
  CALCULATION_DESCRIPTION_ROW_TYPES,
} from 'benefit/handler/constants';
import { SalaryBenefitCalculatorViewProps } from 'benefit/handler/types/application';
import { Button, DateInput, Select, TextInput } from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { formatStringFloatValue } from 'shared/utils/string.utils';

import {
  $CalculatorHr,
  $CalculatorTableRow,
  $CalculatorText,
  $DateTimeDuration,
} from '../ApplicationReview.sc';
import { useSalaryBenefitCalculatorData } from './useSalaryBenefitCalculatorData';

const SalaryBenefitCalculatorView: React.FC<
  SalaryBenefitCalculatorViewProps
> = ({ application }) => {
  const {
    t,
    translationsBase,
    theme,
    formik,
    fields,
    language,
    grantedPeriod,
    paySubsidyPeriod,
    getErrorMessage,
    handleSubmit,
    stateAidMaxPercentageOptions,
    getStateAidMaxPercentageSelectValue,
    paySubsidyPercentageOptions,
    getPaySubsidyPercentageSelectValue,
  } = useSalaryBenefitCalculatorData(application);

  return (
    <ReviewSection withMargin>
      <$GridCell $colSpan={5}>
        <$CalculatorText
          css={`
            margin: 0 0 ${theme.spacing.xs2} 0;
            font-weight: 500;
          `}
        >
          {t(`${translationsBase}.header`)}
        </$CalculatorText>
      </$GridCell>

      {formik.values.startDate && formik.values.endDate && (
        <$GridCell $colStart={1} $colSpan={3} style={{ alignSelf: 'center' }}>
          <$ViewField>
            {t(`${translationsBase}.startEndDates`, {
              startDate: formik.values.startDate,
              endDate: formik.values.endDate,
              period: formatStringFloatValue(grantedPeriod),
            })}
          </$ViewField>
        </$GridCell>
      )}

      <$GridCell $colStart={4} $colSpan={2}>
        <TextInput
          id=""
          name=""
          label={t(`${translationsBase}.monthlyPay`)}
          onBlur={undefined}
          onChange={(e) =>
            formik.setFieldValue(fields.monthlyPay.name, e.target.value)
          }
          value={formik.values.monthlyPay}
          invalid={false}
          aria-invalid={false}
          errorText=""
        />
      </$GridCell>

      <$GridCell $colStart={6} $colSpan={2}>
        <TextInput
          id=""
          name=""
          label={t(`${translationsBase}.otherExpenses`)}
          onBlur={undefined}
          onChange={(e) =>
            formik.setFieldValue(fields.otherExpenses.name, e.target.value)
          }
          value={formik.values.otherExpenses}
          invalid={false}
          aria-invalid={false}
          errorText=""
        />
      </$GridCell>

      <$GridCell $colStart={8} $colSpan={2}>
        <TextInput
          id=""
          name=""
          label={t(`${translationsBase}.vacationMoney`)}
          onBlur={undefined}
          onChange={(e) =>
            formik.setFieldValue(fields.vacationMoney.name, e.target.value)
          }
          value={formik.values.vacationMoney}
          invalid={false}
          aria-invalid={false}
          errorText=""
        />
      </$GridCell>

      <$GridCell $colSpan={11}>
        <$CalculatorHr />
        <$Checkbox
          css={`
            input {
              background-color: ${theme.colors.white};
            }
          `}
          id=""
          name=""
          label={t(`${translationsBase}.manualInput`)}
          checked={false}
          onChange={noop}
        />
        <$CalculatorHr
          css={`
            margin-top: ${theme.spacing.m};
          `}
        />
      </$GridCell>

      <$GridCell $colStart={1}>
        <Select
          value={getStateAidMaxPercentageSelectValue()}
          helper=""
          optionLabelField="label"
          label={t(`${translationsBase}.maximumAid`)}
          onChange={(stateAidMaxPercentage: Option) =>
            formik.setFieldValue(
              fields.stateAidMaxPercentage.name,
              stateAidMaxPercentage.value
            )
          }
          options={stateAidMaxPercentageOptions}
          id="stateAidMaxPercentage"
          placeholder={t('common:select')}
          invalid={false}
          aria-invalid={false}
        />
      </$GridCell>

      <$GridCell $colStart={1}>
        <Select
          value={getPaySubsidyPercentageSelectValue()}
          helper=""
          optionLabelField="label"
          label={t(`${translationsBase}.salarySubsidyPercentage`)}
          onChange={(paySubsidyPercent: Option) =>
            formik.setFieldValue(
              fields.paySubsidyPercent.name,
              paySubsidyPercent.value
            )
          }
          options={paySubsidyPercentageOptions}
          id="paySubsidyPercent"
          placeholder={t('common:select')}
          invalid={false}
          aria-invalid={false}
        />
      </$GridCell>

      <$GridCell $colStart={3} $colSpan={6}>
        <$CalculatorText
          css={`
            margin: 0 0 ${theme.spacing.xs3} 0;
            font-weight: 500;
          `}
        >
          {t(`${translationsBase}.salarySupportPeriod`, {
            period: formatStringFloatValue(paySubsidyPeriod),
          })}
        </$CalculatorText>

        <$DateTimeDuration>
          <DateInput
            id={fields.paySubsidyStartDate.name}
            name={fields.paySubsidyStartDate.name}
            placeholder={fields.paySubsidyStartDate.placeholder}
            onChange={(value) => {
              formik.setFieldValue(fields.paySubsidyStartDate.name, value);
            }}
            value={formik.values.paySubsidyStartDate}
          />
          <div style={{ padding: `0 ${theme.spacing.s}`, fontWeight: 500 }}>
            -
          </div>
          <DateInput
            id={fields.paySubsidyEndDate.name}
            name={fields.paySubsidyEndDate.name}
            placeholder={fields.paySubsidyEndDate.placeholder}
            onChange={(value) => {
              formik.setFieldValue(fields.paySubsidyEndDate.name, value);
            }}
            value={formik.values.paySubsidyEndDate}
          />
        </$DateTimeDuration>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={5}>
        <$CalculatorText
          css={`
            font-weight: 500;
            margin: 0 0 ${theme.spacing.xs3} 0;
          `}
        >
          {t(`${translationsBase}.grantedPeriod`, {
            period: formatStringFloatValue(grantedPeriod),
          })}
        </$CalculatorText>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={2}>
        <$DateTimeDuration>
          <DateInput
            id={fields.startDate.name}
            name={fields.startDate.name}
            placeholder={fields.startDate.placeholder}
            language={language}
            onChange={(value) => {
              formik.setFieldValue(fields.startDate.name, value);
            }}
            value={formik.values.startDate ?? ''}
            invalid={!!getErrorMessage(fields.startDate.name)}
            aria-invalid={!!getErrorMessage(fields.startDate.name)}
            errorText={getErrorMessage(fields.startDate.name)}
          />

          <div style={{ paddingLeft: `${theme.spacing.s}`, fontWeight: 500 }}>
            -
          </div>
        </$DateTimeDuration>
      </$GridCell>

      <$GridCell $colStart={3} $colSpan={3}>
        <DateInput
          id={fields.endDate.name}
          name={fields.endDate.name}
          placeholder={fields.endDate.placeholder}
          language={language}
          onChange={(value) => {
            formik.setFieldValue(fields.endDate.name, value);
          }}
          value={formik.values.endDate ?? ''}
          invalid={!!getErrorMessage(fields.endDate.name)}
          aria-invalid={!!getErrorMessage(fields.endDate.name)}
          errorText={getErrorMessage(fields.endDate.name)}
          style={{ paddingRight: `${theme.spacing.xs}` }}
        />
      </$GridCell>

      <$GridCell $colStart={1}>
        <Button
          onClick={handleSubmit}
          theme="coat"
          style={{ marginTop: 'var(--spacing-xs)' }}
        >
          {t(`${translationsBase}.calculate`)}
        </Button>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={11}>
        <$CalculatorHr />
      </$GridCell>

      <$GridCell $colSpan={7}>
        {application?.calculation?.rows &&
          application?.calculation?.rows.map((row) => {
            const isSummaryRowType = CALCULATION_SUMMARY_ROW_TYPES.includes(
              row.rowType
            );
            const isTotalRowType = CALCULATION_TOTAL_ROW_TYPE === row.rowType;
            return (
              <div key={row.id}>
                <$CalculatorTableRow isTotal={isSummaryRowType}>
                  <$ViewField isBold={isTotalRowType}>
                    {row.descriptionFi}
                  </$ViewField>
                  {!CALCULATION_DESCRIPTION_ROW_TYPES.includes(row.rowType) && (
                    <$ViewField isBold={isTotalRowType}>
                      {row.amount}
                    </$ViewField>
                  )}
                </$CalculatorTableRow>
              </div>
            );
          })}
      </$GridCell>
    </ReviewSection>
  );
};

export default SalaryBenefitCalculatorView;
