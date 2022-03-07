import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { CALCULATION_TYPES } from 'benefit/handler/constants';
import { useCalculatorData } from 'benefit/handler/hooks/useCalculatorData';
import {
  PaySubsidy,
  SalaryBenefitCalculatorViewProps,
} from 'benefit/handler/types/application';
import {
  Button,
  DateInput,
  IconMinusCircle,
  IconPlusCircle,
  Select,
  TextInput,
} from 'hds-react';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import DateInputWithSeparator from 'shared/components/forms/fields/dateInputWithSeparator/DateInputWithSeparator';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import $Notification from 'shared/components/notification/Notification.sc';
import {
  convertToUIDateFormat,
  diffMonths,
  getCorrectEndDate,
  parseDate,
} from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';

import {
  $CalculatorHr,
  $CalculatorTableRow,
  $CalculatorText,
} from '../ApplicationReview.sc';
import CalculatorErrors from '../calculatorErrors/CalculatorErrors';
import SalaryCalculatorTable from './EmploymentCalculatorTable/SalaryCalculatorTable';
import SalaryBenefitManualCalculatorView from './SalaryBenefitManualCalculatorView';
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
    isManualCalculator,
    changeCalculatorMode,
    newTrainingCompensation,
    setNewTrainingCompensation,
    addNewTrainingCompensation,
    removeTrainingCompensation,
    isDisabledAddTrainingCompensationButton,
  } = useSalaryBenefitCalculatorData(data);
  const {
    t,
    translationsBase,
    theme,
    language,
    getErrorMessage,
    handleSubmit,
    isRecalculationRequired,
  } = useCalculatorData(CALCULATION_TYPES.SALARY, formik);

  return (
    <ReviewSection withMargin>
      <$GridCell $colSpan={5}>
        <$CalculatorText
          css={`
            margin: 0 0 ${theme.spacing.xs2} 0;
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

          {formik.values.paySubsidies?.map(
            (item: PaySubsidy, index: number) => (
              <>
                <$GridCell $colStart={1}>
                  <$CalculatorText>
                    {fields.paySubsidyPercent.label}
                  </$CalculatorText>
                </$GridCell>
                {item.paySubsidyPercent === 100 && (
                  <$GridCell $colStart={3} $colSpan={2}>
                    <$CalculatorText>
                      {fields.workTimePercent.label}
                    </$CalculatorText>
                  </$GridCell>
                )}
                <$GridCell
                  $colStart={item.paySubsidyPercent === 100 ? 6 : 3}
                  $colSpan={4}
                >
                  <$CalculatorText>
                    {t(`${translationsBase}.salarySupportPeriod`, {
                      period: formatStringFloatValue(
                        diffMonths(
                          parseDate(item.endDate),
                          parseDate(item.startDate)
                        )
                      ),
                    })}
                  </$CalculatorText>
                </$GridCell>

                <$GridCell $colStart={1}>
                  <Select
                    value={getPaySubsidyPercentageSelectValue(
                      item.paySubsidyPercent
                    )}
                    helper=""
                    optionLabelField="label"
                    label=""
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
                    aria-invalid={
                      !!getErrorMessage(fields.paySubsidyPercent.name)
                    }
                    error={getErrorMessage(fields.paySubsidyPercent.name)}
                  />
                </$GridCell>

                {item.paySubsidyPercent === 100 && (
                  <$GridCell $colStart={3} $colSpan={2}>
                    <TextInput
                      id={fields.workTimePercent.name}
                      name={fields.workTimePercent.name}
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
                      value={formatStringFloatValue(
                        item.workTimePercent?.toString()
                      )}
                      invalid={!!getErrorMessage(fields.workTimePercent.name)}
                      aria-invalid={
                        !!getErrorMessage(fields.workTimePercent.name)
                      }
                      errorText={getErrorMessage(fields.workTimePercent.name)}
                    />
                  </$GridCell>
                )}

                <$GridCell
                  $colStart={item.paySubsidyPercent === 100 ? 6 : 3}
                  $colSpan={3}
                >
                  <DateInputWithSeparator
                    id={fields.startDate.name}
                    name={fields.startDate.name}
                    placeholder={fields.startDate.placeholder}
                    value={convertToUIDateFormat(item.startDate)}
                    onChange={(value) => {
                      formik.setFieldValue(
                        fields.paySubsidies.name,
                        formik.values.paySubsidies?.map(
                          (paySubsidyItem, paySubsidyItemIndex) => {
                            if (paySubsidyItemIndex === index)
                              return {
                                ...paySubsidyItem,
                                startDate: value,
                                endDate: getCorrectEndDate(value, item.endDate),
                              };
                            return paySubsidyItem;
                          }
                        )
                      );
                    }}
                  />
                </$GridCell>

                <$GridCell
                  $colStart={item.paySubsidyPercent === 100 ? 9 : 6}
                  $colSpan={3}
                >
                  <DateInput
                    id={fields.endDate.name}
                    name={fields.endDate.name}
                    placeholder={fields.endDate.placeholder}
                    onChange={(value) => {
                      formik.setFieldValue(
                        fields.paySubsidies.name,
                        formik.values.paySubsidies?.map(
                          (paySubsidyItem, paySubsidyItemIndex) => {
                            if (paySubsidyItemIndex === index)
                              return {
                                ...paySubsidyItem,
                                startDate: item.startDate,
                                endDate: getCorrectEndDate(
                                  item.startDate,
                                  value
                                ),
                              };
                            return paySubsidyItem;
                          }
                        )
                      );
                    }}
                    value={convertToUIDateFormat(item.endDate)}
                    style={{ paddingRight: `${theme.spacing.s}` }}
                  />
                </$GridCell>
              </>
            )
          )}
        </>
      )}

      <$GridCell $colStart={1} $colSpan={5}>
        <$CalculatorText>
          {t(`${translationsBase}.grantedPeriod`, {
            period: formatStringFloatValue(grantedPeriod),
          })}
        </$CalculatorText>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={2}>
        <DateInputWithSeparator
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
          style={{ paddingRight: `${theme.spacing.s}` }}
        />
      </$GridCell>

      {!isManualCalculator && (
        <>
          <$GridCell $colStart={1} $colSpan={11}>
            <$CalculatorText
              isBold
              css={`
                margin-top: ${theme.spacing.m};
              `}
            >
              {t(`${translationsBase}.apprenticeshipCompensation`)}
            </$CalculatorText>
          </$GridCell>

          {formik.values.trainingCompensations &&
            formik.values.trainingCompensations.length > 0 && (
              <>
                <$GridCell $colStart={1} $colSpan={2}>
                  <$CalculatorText>
                    {fields.monthlyAmount.label}
                  </$CalculatorText>
                </$GridCell>

                <$GridCell $colStart={3} $colSpan={3}>
                  <$CalculatorText>
                    {t(`${translationsBase}.apprenticeshipPeriod`)}
                  </$CalculatorText>
                </$GridCell>
              </>
            )}

          {formik.values.trainingCompensations?.map((item) => (
            <React.Fragment key={item.id}>
              <$GridCell
                $colStart={1}
                $colSpan={2}
                style={{ background: 'white' }}
              >
                <$CalculatorTableRow
                  isTotal
                  style={{ padding: '0 var(--spacing-xs)', height: '100%' }}
                >
                  <$ViewField>
                    {formatStringFloatValue(item.monthlyAmount?.toString())}
                  </$ViewField>
                </$CalculatorTableRow>
              </$GridCell>

              <$GridCell
                $colStart={3}
                $colSpan={6}
                style={{
                  background: 'white',
                  marginLeft: '-20px',
                  paddingLeft: '20px',
                }}
              >
                <$CalculatorTableRow
                  isTotal
                  style={{ padding: 0, height: '100%' }}
                >
                  <$ViewField>
                    {t(`${translationsBase}.startEndDates`, {
                      startDate: convertToUIDateFormat(item.startDate),
                      endDate: convertToUIDateFormat(item.endDate),
                      period: diffMonths(
                        parseDate(item.endDate),
                        parseDate(item.startDate)
                      ),
                    })}
                  </$ViewField>
                </$CalculatorTableRow>
              </$GridCell>
              <$GridCell $colStart={9} $colSpan={3}>
                <Button
                  onClick={() => removeTrainingCompensation(item.id)}
                  theme="black"
                  variant="secondary"
                  iconLeft={<IconMinusCircle />}
                  style={{ background: 'white' }}
                >
                  {t(`${translationsBase}.remove`)}
                </Button>
              </$GridCell>
            </React.Fragment>
          ))}

          <$GridCell $colStart={1} $colSpan={2}>
            <$CalculatorText>{fields.monthlyAmount.label}</$CalculatorText>
          </$GridCell>

          <$GridCell $colStart={3} $colSpan={5}>
            <$CalculatorText>
              {t(`${translationsBase}.apprenticeshipPeriodWithDiff`, {
                period: diffMonths(
                  parseDate(newTrainingCompensation.endDate),
                  parseDate(newTrainingCompensation.startDate)
                ),
              })}
            </$CalculatorText>
          </$GridCell>
          <$GridCell $colStart={1} $colSpan={1}>
            <TextInput
              id={fields.monthlyAmount.name}
              name={fields.monthlyAmount.name}
              onChange={(e) =>
                setNewTrainingCompensation((prevValue) => ({
                  ...prevValue,
                  monthlyAmount: e.target.value,
                }))
              }
              value={formatStringFloatValue(
                newTrainingCompensation.monthlyAmount
              )}
              invalid={!!getErrorMessage(fields.monthlyAmount.name)}
              aria-invalid={!!getErrorMessage(fields.monthlyAmount.name)}
              errorText={getErrorMessage(fields.monthlyAmount.name)}
            />
          </$GridCell>

          <$GridCell $colStart={3} $colSpan={3}>
            <DateInputWithSeparator
              id={fields.startDate.name}
              name={fields.startDate.name}
              placeholder={fields.startDate.placeholder}
              language={language}
              onChange={(value) =>
                setNewTrainingCompensation((prevValue) => ({
                  ...prevValue,
                  startDate: value,
                }))
              }
              value={convertToUIDateFormat(newTrainingCompensation.startDate)}
              invalid={!!getErrorMessage(fields.startDate.name)}
              aria-invalid={!!getErrorMessage(fields.startDate.name)}
              errorText={getErrorMessage(fields.startDate.name)}
            />
          </$GridCell>

          <$GridCell $colStart={6} $colSpan={3}>
            <DateInput
              id={fields.endDate.name}
              name={fields.endDate.name}
              placeholder={fields.endDate.placeholder}
              language={language}
              onChange={(value) =>
                setNewTrainingCompensation((prevValue) => ({
                  ...prevValue,
                  endDate: getCorrectEndDate(prevValue.startDate, value) ?? '',
                }))
              }
              value={convertToUIDateFormat(newTrainingCompensation.endDate)}
              invalid={!!getErrorMessage(fields.endDate.name)}
              aria-invalid={!!getErrorMessage(fields.endDate.name)}
              errorText={getErrorMessage(fields.endDate.name)}
              style={{ paddingRight: `${theme.spacing.s}` }}
            />
          </$GridCell>

          <$GridCell $colStart={9} $colSpan={3}>
            <Button
              onClick={addNewTrainingCompensation}
              theme="coat"
              disabled={isDisabledAddTrainingCompensationButton}
              iconLeft={<IconPlusCircle />}
            >
              {t(`${translationsBase}.add`)}
            </Button>
          </$GridCell>
        </>
      )}

      {isManualCalculator && (
        <SalaryBenefitManualCalculatorView
          formik={formik}
          fields={fields}
          getErrorMessage={getErrorMessage}
        />
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

      {isRecalculationRequired && (
        <$GridCell $colStart={1} $colSpan={11}>
          <$Notification
            type="alert"
            label={t('common:calculators.notifications.recalculateLabel')}
          >
            {t('common:calculators.notifications.recalculateContent')}
          </$Notification>
        </$GridCell>
      )}
      <SalaryCalculatorTable data={data} />
    </ReviewSection>
  );
};

export default SalaryBenefitCalculatorView;
