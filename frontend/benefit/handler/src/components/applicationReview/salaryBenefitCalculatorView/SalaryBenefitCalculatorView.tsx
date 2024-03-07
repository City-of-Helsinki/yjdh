import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { CALCULATION_TYPES } from 'benefit/handler/constants';
import { useCalculatorData } from 'benefit/handler/hooks/useCalculatorData';
import { SalaryBenefitCalculatorViewProps } from 'benefit/handler/types/application';
import { PaySubsidy } from 'benefit-shared/types/application';
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
  $CalculatorHeader,
  $CalculatorTableRow,
  $CalculatorText,
  $HelpText,
  $MainHeader,
  $TabButton,
} from '../ApplicationReview.sc';
import CalculatorErrors from '../calculatorErrors/CalculatorErrors';
import SalaryBenefitManualCalculatorView from './SalaryBenefitManualCalculatorView';
import SalaryCalculatorResults from './SalaryCalculatorResults/SalaryCalculatorResults';
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
    handleClear,
    isRecalculationRequired,
    setIsRecalculationRequired,
  } = useCalculatorData(CALCULATION_TYPES.SALARY, formik);

  const eurosPerMonth = 'common:utility.eurosPerMonth';
  return (
    <ReviewSection withMargin withBorder>
      <$GridCell $colSpan={11}>
        <$MainHeader>{t(`${translationsBase}.header`)}</$MainHeader>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={11}>
        <$TabButton
          active={!isManualCalculator}
          onClick={() =>
            changeCalculatorMode('auto') && setIsRecalculationRequired(true)
          }
        >
          {t(`${translationsBase}.calculator`)}
        </$TabButton>
        <$TabButton
          active={isManualCalculator}
          onClick={() =>
            changeCalculatorMode('manual') && setIsRecalculationRequired(true)
          }
        >
          {t(`${translationsBase}.calculateManually`)}
        </$TabButton>
      </$GridCell>

      <$GridCell $colSpan={11}>
        <$CalculatorHeader>
          {t(`${translationsBase}.header2`)}
        </$CalculatorHeader>
      </$GridCell>

      <$GridCell $colSpan={3}>
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
        <$HelpText>{t(eurosPerMonth)}</$HelpText>
      </$GridCell>

      <$GridCell $colSpan={3}>
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
        <$HelpText>{t(eurosPerMonth)}</$HelpText>
      </$GridCell>

      <$GridCell $colSpan={3}>
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
        <$HelpText>{t(eurosPerMonth)}</$HelpText>
      </$GridCell>

      {!isManualCalculator && (
        <>
          <$GridCell $colSpan={11}>
            <$CalculatorHeader>
              {t(`${translationsBase}.maximumAid`)}
            </$CalculatorHeader>
          </$GridCell>
          <$GridCell $colStart={1} $colSpan={3}>
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

          <$GridCell $colStart={1} $colSpan={11}>
            <$CalculatorHeader>
              {t(`${translationsBase}.subsidies`)}
            </$CalculatorHeader>
          </$GridCell>
          {formik.values.paySubsidies && (
            <$GridCell $colStart={1} $colSpan={11}>
              <h3 style={{ fontSize: theme.fontSize.heading.xs, margin: 0 }}>
                {t(`${translationsBase}.paySubsidy`)}
              </h3>
            </$GridCell>
          )}
          {formik.values.paySubsidies?.map(
            // eslint-disable-next-line sonarjs/cognitive-complexity
            (item: PaySubsidy, index: number) => (
              <React.Fragment key={item.id}>
                <$GridCell $colStart={1}>
                  <$CalculatorText>
                    {t(`${translationsBase}.salarySubsidyPercentage`)}
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
                  <DateInput
                    id={fields.startDate.name}
                    name={fields.startDate.name}
                    placeholder={fields.startDate.placeholder}
                    language={language}
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
                    language={language}
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
              </React.Fragment>
            )
          )}
        </>
      )}

      {!isManualCalculator && data.apprenticeshipProgram && (
        <>
          <$GridCell $colStart={1} $colSpan={11}>
            <$CalculatorHeader
              css={`
                margin-top: ${theme.spacing.m};
              `}
            >
              {t(`${translationsBase}.apprenticeshipCompensation`)}
            </$CalculatorHeader>
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

          <$GridCell $colStart={1} $colSpan={1}>
            <TextInput
              id={fields.monthlyAmount.name}
              name={fields.monthlyAmount.name}
              label={fields.monthlyAmount.label}
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
            <$HelpText>{t(eurosPerMonth)}</$HelpText>
          </$GridCell>

          <$GridCell $colStart={3} $colSpan={3}>
            <DateInput
              id={fields.trainingCompensationStartDate.name}
              name={fields.trainingCompensationStartDate.name}
              placeholder={t('common:utility.select')}
              label={t('common:utility.start')}
              language={language}
              onChange={(value) =>
                setNewTrainingCompensation((prevValue) => ({
                  ...prevValue,
                  startDate: value,
                }))
              }
              value={convertToUIDateFormat(newTrainingCompensation.startDate)}
              invalid={
                !!getErrorMessage(fields.trainingCompensationStartDate.name)
              }
              aria-invalid={
                !!getErrorMessage(fields.trainingCompensationStartDate.name)
              }
              errorText={getErrorMessage(
                fields.trainingCompensationStartDate.name
              )}
            />
          </$GridCell>

          <$GridCell $colStart={6} $colSpan={3}>
            <DateInput
              id={fields.trainingCompensationEndDate.name}
              name={fields.trainingCompensationEndDate.name}
              placeholder={t('common:utility.select')}
              label={t('common:utility.end')}
              language={language}
              onChange={(value) =>
                setNewTrainingCompensation((prevValue) => ({
                  ...prevValue,
                  endDate:
                    getCorrectEndDate(prevValue.startDate, value)?.toString() ??
                    '',
                }))
              }
              value={convertToUIDateFormat(newTrainingCompensation.endDate)}
              invalid={
                fields.trainingCompensationEndDate &&
                !!getErrorMessage(fields.trainingCompensationEndDate.name)
              }
              aria-invalid={
                !!getErrorMessage(fields.trainingCompensationEndDate.name)
              }
              errorText={getErrorMessage(
                fields.trainingCompensationEndDate.name
              )}
              style={{ paddingRight: `${theme.spacing.s}` }}
            />
          </$GridCell>

          <$GridCell $colStart={9} $colSpan={3}>
            <Button
              onClick={addNewTrainingCompensation}
              theme="coat"
              disabled={isDisabledAddTrainingCompensationButton}
              iconLeft={<IconPlusCircle />}
              style={{ marginTop: 'var(--spacing-m)' }}
            >
              {t(`${translationsBase}.add`)}
            </Button>
          </$GridCell>
        </>
      )}

      <$GridCell $colSpan={11}>
        <$CalculatorHeader>
          {t(`${translationsBase}.periodHeader`)}
        </$CalculatorHeader>
      </$GridCell>

      {data.startDate && data.endDate && (
        <$GridCell $colStart={1} $colSpan={11} style={{ alignSelf: 'center' }}>
          <$ViewField style={{ marginBottom: theme.spacing.xs }}>
            {t(`${translationsBase}.appliedPeriod`)}
            <b>
              {t(`${translationsBase}.startEndDates`, {
                startDate: convertToUIDateFormat(data.startDate),
                endDate: convertToUIDateFormat(data.endDate),
                period: formatStringFloatValue(data.durationInMonthsRounded),
              })}
            </b>
          </$ViewField>
        </$GridCell>
      )}

      <$GridCell $colStart={1} $colSpan={5}>
        <$CalculatorText>
          {t(`${translationsBase}.grantedPeriod`, {
            period: formatStringFloatValue(grantedPeriod),
          })}
        </$CalculatorText>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={2}>
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

      {isManualCalculator && (
        <SalaryBenefitManualCalculatorView
          formik={formik}
          fields={fields}
          getErrorMessage={getErrorMessage}
        />
      )}

      <$GridCell
        $colStart={1}
        $colSpan={11}
        style={{ marginTop: 'var(--spacing-xs)' }}
      >
        <Button
          onClick={handleSubmit}
          theme="coat"
          style={{ marginRight: 'var(--spacing-xs)' }}
        >
          {t(`${translationsBase}.calculate`)}
        </Button>
        <Button onClick={handleClear} theme="coat" variant="secondary">
          {isManualCalculator && t(`${translationsBase}.clear`)}
          {!isManualCalculator && t(`${translationsBase}.reset`)}
        </Button>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={11}>
        <CalculatorErrors data={calculationsErrors} />
      </$GridCell>

      {isRecalculationRequired && data?.calculation?.rows.length > 0 && (
        <$GridCell $colStart={1} $colSpan={11}>
          <$Notification
            type="alert"
            label={t('common:calculators.notifications.recalculateLabel')}
          >
            {t('common:calculators.notifications.recalculateContent')}
          </$Notification>
        </$GridCell>
      )}

      {!calculationsErrors && (
        <SalaryCalculatorResults
          data={data}
          isManualCalculator={isManualCalculator}
          isRecalculationRequired={isRecalculationRequired}
        />
      )}
    </ReviewSection>
  );
};

export default SalaryBenefitCalculatorView;
