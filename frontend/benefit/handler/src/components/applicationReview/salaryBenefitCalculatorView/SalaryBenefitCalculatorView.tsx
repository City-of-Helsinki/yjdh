import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import {
  CALCULATION_DESCRIPTION_ROW_TYPES,
  CALCULATION_SUMMARY_ROW_TYPES,
  CALCULATION_TOTAL_ROW_TYPE,
  CALCULATION_TYPES,
} from 'benefit/handler/constants';
import { useCalculatorData } from 'benefit/handler/hooks/useCalculatorData';
import { SalaryBenefitCalculatorViewProps } from 'benefit/handler/types/application';
import { Button, DateInput, Select, TextArea, TextInput } from 'hds-react';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import DateFieldsSeparator from 'shared/components/forms/fields/dateFieldsSeparator/DateFieldsSeparator';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';

import {
  $CalculatorHr,
  $CalculatorTableRow,
  $CalculatorText,
  $DateTimeDuration,
} from '../ApplicationReview.sc';
import CalculatorErrors from '../calculatorErrors/CalculatorErrors';
import { useSalaryBenefitCalculatorData } from './useSalaryBenefitCalculatorData';

const SalaryBenefitCalculatorView: React.FC<
  SalaryBenefitCalculatorViewProps
> = ({ data }) => {
  const {
    formik,
    fields,
    calculationsErrors,
    paySubsidyPeriod,
    grantedPeriod,
    stateAidMaxPercentageOptions,
    getStateAidMaxPercentageSelectValue,
    paySubsidyPercentageOptions,
    getPaySubsidyPercentageSelectValue,
    isManualCalculator,
    changeCalculatorMode,
  } = useSalaryBenefitCalculatorData(data);
  const {
    t,
    translationsBase,
    theme,
    language,
    getErrorMessage,
    handleSubmit,
  } = useCalculatorData(CALCULATION_TYPES.SALARY, formik);

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

      {data.startDate && data.endDate && (
        <$GridCell $colStart={1} $colSpan={3} style={{ alignSelf: 'center' }}>
          <$ViewField>
            {t(`${translationsBase}.startEndDates`, {
              startDate: convertToUIDateFormat(data.startDate),
              endDate: convertToUIDateFormat(data.endDate),
              period: formatStringFloatValue(data.durationInMonthsRounded),
            })}
          </$ViewField>
        </$GridCell>
      )}

      <$GridCell $colStart={4} $colSpan={2}>
        <TextInput
          id={fields.monthlyPay.name}
          name={fields.monthlyPay.name}
          label={fields.monthlyPay.label}
          onBlur={undefined}
          onChange={(e) =>
            formik.setFieldValue(fields.monthlyPay.name, e.target.value)
          }
          value={formik.values.monthlyPay}
          invalid={!!getErrorMessage(fields.monthlyPay.name)}
          aria-invalid={!!getErrorMessage(fields.monthlyPay.name)}
          errorText={getErrorMessage(fields.monthlyPay.name)}
        />
      </$GridCell>

      <$GridCell $colStart={6} $colSpan={2}>
        <TextInput
          id={fields.otherExpenses.name}
          name={fields.otherExpenses.name}
          label={fields.monthlyPay.label}
          onBlur={undefined}
          onChange={(e) =>
            formik.setFieldValue(fields.otherExpenses.name, e.target.value)
          }
          value={formik.values.otherExpenses}
          invalid={!!getErrorMessage(fields.otherExpenses.name)}
          aria-invalid={!!getErrorMessage(fields.otherExpenses.name)}
          errorText={getErrorMessage(fields.otherExpenses.name)}
        />
      </$GridCell>

      <$GridCell $colStart={8} $colSpan={2}>
        <TextInput
          id={fields.vacationMoney.name}
          name={fields.vacationMoney.name}
          label={fields.vacationMoney.label}
          onBlur={undefined}
          onChange={(e) =>
            formik.setFieldValue(fields.vacationMoney.name, e.target.value)
          }
          value={formik.values.vacationMoney}
          invalid={!!getErrorMessage(fields.vacationMoney.name)}
          aria-invalid={!!getErrorMessage(fields.vacationMoney.name)}
          errorText={getErrorMessage(fields.vacationMoney.name)}
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
          id="manualInputCheckbox"
          name="manualInputCheckbox"
          label={t(`${translationsBase}.manualInput`)}
          checked={isManualCalculator}
          onChange={changeCalculatorMode}
        />
        <$CalculatorHr
          css={`
            margin-top: ${theme.spacing.m};
          `}
        />
      </$GridCell>

      {!isManualCalculator && (
        <>
          <$GridCell $colStart={1}>
            <Select
              value={getStateAidMaxPercentageSelectValue()}
              helper=""
              optionLabelField="label"
              label={fields.stateAidMaxPercentage.label}
              onChange={(stateAidMaxPercentage: Option) =>
                formik.setFieldValue(
                  fields.stateAidMaxPercentage.name,
                  stateAidMaxPercentage.value
                )
              }
              options={stateAidMaxPercentageOptions}
              id={fields.stateAidMaxPercentage.name}
              placeholder={t('common:select')}
              invalid={!!getErrorMessage(fields.stateAidMaxPercentage.name)}
              aria-invalid={
                !!getErrorMessage(fields.stateAidMaxPercentage.name)
              }
              error={getErrorMessage(fields.stateAidMaxPercentage.name)}
            />
          </$GridCell>

          <$GridCell $colStart={1}>
            <Select
              value={getPaySubsidyPercentageSelectValue()}
              helper=""
              optionLabelField="label"
              label={fields.paySubsidyPercent.label}
              onChange={(paySubsidyPercent: Option) =>
                formik.setFieldValue(
                  fields.paySubsidyPercent.name,
                  paySubsidyPercent.value
                )
              }
              options={paySubsidyPercentageOptions}
              id={fields.paySubsidyPercent.name}
              placeholder={t('common:select')}
              invalid={!!getErrorMessage(fields.paySubsidyPercent.name)}
              aria-invalid={!!getErrorMessage(fields.paySubsidyPercent.name)}
              error={getErrorMessage(fields.paySubsidyPercent.name)}
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
              <DateFieldsSeparator />
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
        </>
      )}

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

          <DateFieldsSeparator />
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

      {isManualCalculator && (
        <$GridCell $colStart={1} $colSpan={2}>
          <TextInput
            id={fields.overrideMonthlyBenefitAmount.name}
            name={fields.overrideMonthlyBenefitAmount.name}
            label={fields.overrideMonthlyBenefitAmount.label}
            onBlur={undefined}
            onChange={(e) =>
              formik.setFieldValue(
                fields.overrideMonthlyBenefitAmount.name,
                e.target.value
              )
            }
            value={
              formik.values.overrideMonthlyBenefitAmount
                ? formatStringFloatValue(
                    formik.values.overrideMonthlyBenefitAmount
                  )
                : ''
            }
            invalid={
              !!getErrorMessage(fields.overrideMonthlyBenefitAmount.name)
            }
            aria-invalid={
              !!getErrorMessage(fields.overrideMonthlyBenefitAmount.name)
            }
            errorText={getErrorMessage(
              fields.overrideMonthlyBenefitAmount.name
            )}
          />
        </$GridCell>
      )}

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
        <CalculatorErrors data={calculationsErrors} />
      </$GridCell>

      <$GridCell $colSpan={7}>
        {data?.calculation?.rows &&
          data?.calculation?.rows.map((row) => {
            const isSummaryRowType = CALCULATION_SUMMARY_ROW_TYPES.includes(
              row.rowType
            );
            const isTotalRowType = CALCULATION_TOTAL_ROW_TYPE === row.rowType;
            const isDescriptionRowType =
              CALCULATION_DESCRIPTION_ROW_TYPES.includes(row.rowType);
            return (
              <div key={row.id}>
                <$CalculatorTableRow isTotal={isSummaryRowType}>
                  <$ViewField isBold={isTotalRowType || isDescriptionRowType}>
                    {row.descriptionFi}
                  </$ViewField>
                  {!isDescriptionRowType && (
                    <$ViewField isBold={isTotalRowType}>
                      {t(`${translationsBase}.tableRowValue`, {
                        amount: formatStringFloatValue(row.amount),
                      })}
                    </$ViewField>
                  )}
                </$CalculatorTableRow>
              </div>
            );
          })}
      </$GridCell>

      {isManualCalculator && (
        <$GridCell $colStart={1} $colSpan={6}>
          <TextArea
            id={fields.overrideMonthlyBenefitAmountComment.name}
            name={fields.overrideMonthlyBenefitAmountComment.name}
            label={fields.overrideMonthlyBenefitAmountComment.label}
            placeholder={fields.overrideMonthlyBenefitAmountComment.placeholder}
            value={formik.values.overrideMonthlyBenefitAmountComment}
            onChange={(e) =>
              formik.setFieldValue(
                fields.overrideMonthlyBenefitAmountComment.name,
                e.target.value
              )
            }
            required
          />
        </$GridCell>
      )}
    </ReviewSection>
  );
};

export default SalaryBenefitCalculatorView;
