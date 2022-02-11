import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import {
  CALCULATION_DESCRIPTION_ROW_TYPES,
  CALCULATION_SUMMARY_ROW_TYPES,
  CALCULATION_TOTAL_ROW_TYPE,
  CALCULATION_TYPES,
} from 'benefit/handler/constants';
import { useCalculatorData } from 'benefit/handler/hooks/useCalculatorData';
import {
  PaySubsidy,
  SalaryBenefitCalculatorViewProps,
} from 'benefit/handler/types/application';
import { Button, DateInput, Select, TextInput } from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import DateFieldsSeparator from 'shared/components/forms/fields/dateFieldsSeparator/DateFieldsSeparator';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import {
  convertToBackendDateFormat,
  convertToUIDateFormat,
  diffMonths,
  parseDate,
} from 'shared/utils/date.utils';
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
    grantedPeriod,
    stateAidMaxPercentageOptions,
    getStateAidMaxPercentageSelectValue,
    paySubsidyPercentageOptions,
    getPaySubsidyPercentageSelectValue,
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
          value={formatStringFloatValue(formik.values.monthlyPay)}
          invalid={!!getErrorMessage(fields.monthlyPay.name)}
          aria-invalid={!!getErrorMessage(fields.monthlyPay.name)}
          errorText={getErrorMessage(fields.monthlyPay.name)}
        />
      </$GridCell>

      <$GridCell $colStart={6} $colSpan={2}>
        <TextInput
          id={fields.otherExpenses.name}
          name={fields.otherExpenses.name}
          label={fields.otherExpenses.label}
          onBlur={undefined}
          onChange={(e) =>
            formik.setFieldValue(fields.otherExpenses.name, e.target.value)
          }
          value={formatStringFloatValue(formik.values.otherExpenses)}
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
          value={formatStringFloatValue(formik.values.vacationMoney)}
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
          aria-invalid={!!getErrorMessage(fields.stateAidMaxPercentage.name)}
          error={getErrorMessage(fields.stateAidMaxPercentage.name)}
        />
      </$GridCell>

      {formik.values.paySubsidies?.map((item: PaySubsidy, index: number) => (
        <>
          <$GridCell $colStart={1}>
            <Select
              value={getPaySubsidyPercentageSelectValue(item.paySubsidyPercent)}
              helper=""
              optionLabelField="label"
              label={fields.paySubsidyPercent.label}
              onChange={(paySubsidyPercent: Option) => {
                formik.setFieldValue(
                  fields.paySubsidies.name,
                  formik.values.paySubsidies?.map(
                    (paySubsidyItem, paySubsidyItemIndex) => {
                      if (paySubsidyItemIndex === index)
                        return {
                          ...paySubsidyItem,
                          paySubsidyPercent: paySubsidyPercent.value,
                        };
                      return paySubsidyItem;
                    }
                  )
                );
              }}
              options={paySubsidyPercentageOptions}
              id={fields.paySubsidyPercent.name}
              placeholder={t('common:select')}
              invalid={!!getErrorMessage(fields.paySubsidyPercent.name)}
              aria-invalid={!!getErrorMessage(fields.paySubsidyPercent.name)}
              error={getErrorMessage(fields.paySubsidyPercent.name)}
            />
          </$GridCell>

          {item.paySubsidyPercent === 100 && (
            <$GridCell $colStart={3} $colSpan={2}>
              <TextInput
                id={fields.paySubsidyWorkTimePercent.name}
                name={fields.paySubsidyWorkTimePercent.name}
                label={fields.paySubsidyWorkTimePercent.label}
                onBlur={undefined}
                onChange={(e) => {
                  formik.setFieldValue(
                    fields.paySubsidies.name,
                    formik.values.paySubsidies?.map(
                      (paySubsidyItem, paySubsidyItemIndex) => {
                        if (paySubsidyItemIndex === index)
                          return {
                            ...paySubsidyItem,
                            workTimePercent: e.target.value,
                          };
                        return paySubsidyItem;
                      }
                    )
                  );
                }}
                value={formatStringFloatValue(item.workTimePercent)}
                invalid={
                  !!getErrorMessage(fields.paySubsidyWorkTimePercent.name)
                }
                aria-invalid={
                  !!getErrorMessage(fields.paySubsidyWorkTimePercent.name)
                }
                errorText={getErrorMessage(
                  fields.paySubsidyWorkTimePercent.name
                )}
              />
            </$GridCell>
          )}

          <$GridCell
            $colStart={item.paySubsidyPercent === 100 ? 6 : 3}
            $colSpan={6}
          >
            <$CalculatorText
              css={`
                margin: 0 0 ${theme.spacing.xs3} 0;
                font-weight: 500;
              `}
            >
              {t(`${translationsBase}.salarySupportPeriod`, {
                period: formatStringFloatValue(
                  diffMonths(parseDate(item.endDate), parseDate(item.startDate))
                ),
              })}
            </$CalculatorText>

            <$DateTimeDuration>
              <DateInput
                id={fields.paySubsidyStartDate.name}
                name={fields.paySubsidyStartDate.name}
                placeholder={fields.paySubsidyStartDate.placeholder}
                onChange={(value) => {
                  formik.setFieldValue(
                    fields.paySubsidies.name,
                    formik.values.paySubsidies?.map(
                      (paySubsidyItem, paySubsidyItemIndex) => {
                        if (paySubsidyItemIndex === index)
                          return {
                            ...paySubsidyItem,
                            startDate: convertToBackendDateFormat(value),
                          };
                        return paySubsidyItem;
                      }
                    )
                  );
                }}
                value={convertToUIDateFormat(item.startDate)}
              />
              <DateFieldsSeparator />
              <DateInput
                id={fields.paySubsidyEndDate.name}
                name={fields.paySubsidyEndDate.name}
                placeholder={fields.paySubsidyEndDate.placeholder}
                onChange={(value) => {
                  formik.setFieldValue(
                    fields.paySubsidies.name,
                    formik.values.paySubsidies?.map(
                      (paySubsidyItem, paySubsidyItemIndex) => {
                        if (paySubsidyItemIndex === index)
                          return {
                            ...paySubsidyItem,
                            endDate: convertToBackendDateFormat(value),
                          };
                        return paySubsidyItem;
                      }
                    )
                  );
                }}
                value={convertToUIDateFormat(item.endDate)}
              />
            </$DateTimeDuration>
          </$GridCell>
        </>
      ))}

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
    </ReviewSection>
  );
};

export default SalaryBenefitCalculatorView;
