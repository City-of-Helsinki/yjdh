import {
  $Calculation,
  $DateRange,
  $DateRangeSeparator,
  $ErrorContainer,
  $HighlightWrapper,
  $Subheading,
  $TableCaption,
} from 'benefit/handler/components/alterationHandling/AlterationCalculator.sc';
import { $TabButton } from 'benefit/handler/components/applicationReview/ApplicationReview.sc';
import CalculationTable from 'benefit/handler/components/applicationReview/calculationTable/CalculationTable';
import useCalculationTable from 'benefit/handler/components/applicationReview/calculationTable/useCalculationTable';
import SalaryCalculatorHighlight from 'benefit/handler/components/applicationReview/salaryBenefitCalculatorView/SalaryCalculatorResults/SalaryCalculatorHighlight';
import { ALTERATION_STATE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import { areIntervalsOverlapping, max, min } from 'date-fns';
import { FormikProps } from 'formik';
import {
  Button,
  DateInput,
  Fieldset,
  Notification,
  TextInput,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import {
  DATE_FORMATS,
  diffMonths,
  formatDate,
  parseDate,
} from 'shared/utils/date.utils';
import {
  formatStringFloatValue,
  getNumberValue,
  stringFloatToFixed,
} from 'shared/utils/string.utils';

type Props = {
  formik: FormikProps<Partial<ApplicationAlteration>>;
  application: Application;
  getErrorMessage: (fieldName: string) => string | undefined;
  onCalculationChange: (outOfDate: boolean) => void;
};

type CalculationResult = {
  amount: string;
  description: string;
};

const AlterationCalculator = ({
  formik,
  application,
  getErrorMessage,
  onCalculationChange,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { tableRows } = useCalculationTable({
    calculation: application.calculation,
  });

  const translationBase = 'common:applications.alterations.handling';

  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null);
  const [calculationOutOfDate, setCalculationOutOfDate] =
    useState<boolean>(false);
  const [calculationRangeValid, setCalculationRangeValid] =
    useState<boolean>(true);
  const [isManual, setManual] = useState<boolean>(false);

  const applicationStartDate = new Date(application.startDate);
  const applicationEndDate = new Date(application.endDate);

  const disableOccupiedDates = (date: Date): boolean =>
    application.alterations.some(
      (alteration) =>
        alteration.state === ALTERATION_STATE.HANDLED &&
        alteration.recoveryStartDate <=
          formatDate(date, DATE_FORMATS.BACKEND_DATE) &&
        alteration.recoveryEndDate >=
          formatDate(date, DATE_FORMATS.BACKEND_DATE)
    );

  const rangeHasOccupiedDates = (range: Interval): boolean =>
    application.alterations.some((alteration) => {
      if (
        alteration.state !== ALTERATION_STATE.HANDLED ||
        !alteration.recoveryStartDate ||
        !alteration.recoveryEndDate
      ) {
        return false;
      }

      const alterationRange = {
        start: parseDate(alteration.recoveryStartDate),
        end: parseDate(alteration.recoveryEndDate),
      };
      return (
        alteration.state === ALTERATION_STATE.HANDLED &&
        areIntervalsOverlapping(range, alterationRange)
      );
    });

  const calculateRecoveryAmount = (): void => {
    const startDate = parseDate(formik.values.recoveryStartDate);
    const endDate = parseDate(formik.values.recoveryEndDate);

    setCalculationRangeValid(true);

    if (startDate > endDate) {
      setCalculationResult(null);
      return;
    }

    if (
      rangeHasOccupiedDates({
        start: startDate,
        end: endDate,
      })
    ) {
      setCalculationRangeValid(false);
      setCalculationResult(null);
      setCalculationOutOfDate(false);
      return;
    }

    let total: number;

    if (isManual) {
      total = getNumberValue(formik.values?.recoveryAmount || 0);
    } else {
      total = tableRows.reduce((sum, row) => {
        if (!row.startDate || !row.endDate) {
          return sum;
        }

        const rowStartDate = parseDate(row.startDate);
        const rowEndDate = parseDate(row.endDate);

        if (
          !areIntervalsOverlapping(
            {
              start: startDate,
              end: endDate,
            },
            {
              start: rowStartDate,
              end: rowEndDate,
            }
          )
        ) {
          return sum;
        }

        const overlapStart = max([startDate, rowStartDate]);
        const overlapEnd = min([endDate, rowEndDate]);

        const months = diffMonths(overlapEnd, overlapStart);
        const amountOverOverlapPeriod =
          Number(row.amountNumber) * (months / row.duration);

        return sum + amountOverOverlapPeriod;
      }, 0);
      formik.setFieldValue('recoveryAmount', total.toFixed(2));
    }

    setCalculationResult({
      amount: total.toFixed(2),
      description: t(`${translationBase}.calculation.resultDescription`, {
        months: diffMonths(endDate, startDate),
        startDate: formik.values.recoveryStartDate,
        endDate: formik.values.recoveryEndDate,
      }),
    });
    setCalculationOutOfDate(false);
    onCalculationChange(false);
  };

  const handleChange =
    (field: string) =>
    (value: unknown): void => {
      formik.setFieldValue(field, value);
      setCalculationOutOfDate(true);
      onCalculationChange(true);
    };

  const selectTab = (manualTab: boolean): void => {
    setManual(manualTab);
    setCalculationOutOfDate(true);
    onCalculationChange(true);
  };

  const showRangeError = !calculationOutOfDate && !calculationRangeValid;
  const showOutdatedError = calculationOutOfDate && calculationResult !== null;

  return (
    <div>
      <CalculationTable
        tableRows={tableRows}
        caption={
          <$TableCaption>
            {t(`${translationBase}.calculation.tableCaption`)}
          </$TableCaption>
        }
      />
      <$Calculation>
        <$Grid>
          <$GridCell $colSpan={4}>
            <$TabButton active={!isManual} onClick={() => selectTab(false)}>
              {t(`${translationBase}.calculation.tabs.calculator`)}
            </$TabButton>
            <$TabButton active={isManual} onClick={() => selectTab(true)}>
              {t(`${translationBase}.calculation.tabs.manual`)}
            </$TabButton>
          </$GridCell>
          <$GridCell $colSpan={8} />
          <$GridCell $colSpan={12}>
            <$Subheading>
              {t(`${translationBase}.calculation.fieldsHeader`)}
            </$Subheading>
          </$GridCell>
          <$GridCell $colSpan={6}>
            <Fieldset
              heading={t(`${translationBase}.fields.recoveryPeriod.label`)}
              tooltipText={t(
                `${translationBase}.fields.recoveryPeriod.helpText`
              )}
            >
              <$DateRange>
                <DateInput
                  label={t(`${translationBase}.fields.recoveryStartDate.label`)}
                  value={formik.values.recoveryStartDate}
                  id="recovery-start-date"
                  name="recoveryStartDate"
                  required
                  invalid={!!getErrorMessage('recoveryStartDate')}
                  aria-invalid={!!getErrorMessage('recoveryStartDate')}
                  errorText={getErrorMessage('recoveryStartDate')}
                  onChange={handleChange('recoveryStartDate')}
                  onBlur={formik.handleBlur}
                  language="fi"
                  minDate={applicationStartDate}
                  maxDate={applicationEndDate}
                  isDateDisabledBy={disableOccupiedDates}
                  hideLabel
                />
                <$DateRangeSeparator aria-hidden>—</$DateRangeSeparator>
                <DateInput
                  label={t(`${translationBase}.fields.recoveryEndDate.label`)}
                  value={formik.values.recoveryEndDate}
                  id="recovery-end-date"
                  name="recoveryEndDate"
                  required
                  invalid={!!getErrorMessage('recoveryEndDate')}
                  aria-invalid={!!getErrorMessage('recoveryEndDate')}
                  errorText={getErrorMessage('recoveryEndDate')}
                  onChange={handleChange('recoveryEndDate')}
                  onBlur={formik.handleBlur}
                  language="fi"
                  minDate={parseDate(
                    formik.values.recoveryStartDate ?? applicationStartDate
                  )}
                  maxDate={applicationEndDate}
                  isDateDisabledBy={disableOccupiedDates}
                  hideLabel
                />
              </$DateRange>
            </Fieldset>
          </$GridCell>
          <$GridCell $colSpan={6} />
          {isManual && (
            <>
              <$GridCell $colSpan={3}>
                <TextInput
                  label={t(`${translationBase}.fields.recoveryAmount.label`)}
                  id="recovery-amount"
                  name="recoveryAmount"
                  onBlur={formik.handleBlur}
                  onChange={(e) =>
                    handleChange('recoveryAmount')(
                      stringFloatToFixed(e.target.value)
                    )
                  }
                  value={formatStringFloatValue(formik.values.recoveryAmount)}
                  invalid={!!getErrorMessage('recoveryAmount')}
                  aria-invalid={!!getErrorMessage('recoveryAmount')}
                  errorText={getErrorMessage('recoveryAmount')}
                  required
                />
              </$GridCell>
              <$GridCell $colSpan={9} />
            </>
          )}
          <$GridCell $colSpan={12}>
            <Button theme="coat" onClick={calculateRecoveryAmount}>
              {t(`${translationBase}.calculation.actions.calculate`)}
            </Button>
            {calculationResult && (
              <$HighlightWrapper>
                <SalaryCalculatorHighlight
                  description={calculationResult.description}
                  amount={calculationResult.amount}
                />
              </$HighlightWrapper>
            )}
            {showOutdatedError && (
              <$ErrorContainer>
                <Notification
                  type="alert"
                  label={t(`${translationBase}.calculation.outOfDate.heading`)}
                >
                  {t(`${translationBase}.calculation.outOfDate.body`)}
                </Notification>
              </$ErrorContainer>
            )}
            {showRangeError && (
              <$ErrorContainer>
                <Notification
                  type="error"
                  label={t(
                    `${translationBase}.calculation.invalidRange.heading`
                  )}
                >
                  {t(`${translationBase}.calculation.invalidRange.body`)}
                </Notification>
              </$ErrorContainer>
            )}
          </$GridCell>
        </$Grid>
      </$Calculation>
    </div>
  );
};

export default AlterationCalculator;
