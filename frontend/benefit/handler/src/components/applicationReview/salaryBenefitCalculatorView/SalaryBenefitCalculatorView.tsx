import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import {
  CALCULATION_SALARY_KEYS,
  CALCULATION_TYPES,
} from 'benefit/handler/constants';
import { useCalculatorData } from 'benefit/handler/hooks/useCalculatorData';
import {
  CalculationFormProps,
  SalaryBenefitCalculatorViewProps,
} from 'benefit/handler/types/application';
import { PAY_SUBSIDY_GRANTED } from 'benefit-shared/constants';
import {
  Application,
  PaySubsidy,
  TrainingCompensation,
} from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import {
  Button,
  DateInput,
  IconMinusCircle,
  IconPlusCircle,
  Select,
  TextInput,
} from 'hds-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { Field } from 'shared/components/forms/fields/types';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';
import $Notification from 'shared/components/notification/Notification.sc';
import { Language } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';
import {
  convertToUIDateFormat,
  diffMonths,
  getCorrectEndDate,
  parseDate,
} from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';
import { DefaultTheme } from 'styled-components';

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

type PaySubsidiesSectionProps = {
  formik: FormikProps<CalculationFormProps>;
  fields: Record<CALCULATION_SALARY_KEYS, Field<CALCULATION_SALARY_KEYS>>;
  translationsBase: string;
  paySubsidyPercentageOptions: OptionType[];
  getPaySubsidyPercentageSelectValue: (value: number) => OptionType | undefined;
  getErrorMessage: (fieldName: string) => string | undefined;
  application: Application;
  language: Language;
  dateInputLimits: { min: Date; max: Date };
  theme: DefaultTheme;
};

const PaySubsidiesSection: React.FC<PaySubsidiesSectionProps> = ({
  formik,
  fields,
  translationsBase,
  paySubsidyPercentageOptions,
  getPaySubsidyPercentageSelectValue,
  getErrorMessage,
  application,
  language,
  dateInputLimits,
  theme,
}) => {
  const { t } = useTranslation();

  const updatePaySubsidies = (
    index: number,
    newValues: Partial<PaySubsidy>
  ): void => {
    const newPaySubsidies = [...(formik.values.paySubsidies || [])];
    newPaySubsidies[index] = { ...newPaySubsidies[index], ...newValues };
    formik.setFieldValue(fields.paySubsidies.name, newPaySubsidies);
  };

  if ((formik.values.paySubsidies?.length ?? 0) === 0) return null;

  return (
    <>
      <$GridCell $colStart={1} $colSpan={11}>
        <$CalculatorHeader as="div">
          <p style={{ marginBottom: '0.5em' }}>
            {t(`${translationsBase}.subsidies`)}
          </p>
          <$ViewField>
            <strong>
              {t(`${translationsBase}.paySubsidy`)}{' '}
              {application.paySubsidyGranted ===
              PAY_SUBSIDY_GRANTED.GRANTED_AGED
                ? `(${t(
                    'applications.sections.fields.paySubsidyGranted.grantedAged'
                  )})`
                : null}
            </strong>
          </$ViewField>
        </$CalculatorHeader>
      </$GridCell>

      {formik.values.paySubsidies?.map((item: PaySubsidy, index: number) => (
        <React.Fragment key={item.id}>
          <$GridCell $colStart={1}>
            <Select
              value={getPaySubsidyPercentageSelectValue(
                item.paySubsidyPercent || 0
              )}
              helper=""
              optionLabelField="label"
              label={t(`${translationsBase}.salarySubsidyPercentage`)}
              onChange={(paySubsidyPercent: OptionType) =>
                updatePaySubsidies(index, {
                  paySubsidyPercent: paySubsidyPercent.value as number,
                })
              }
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
                id={fields.workTimePercent.name}
                name={fields.workTimePercent.name}
                label={fields.workTimePercent.label}
                onChange={(e) =>
                  updatePaySubsidies(index, {
                    workTimePercent: parseFloat(e.target.value),
                  })
                }
                value={formatStringFloatValue(item.workTimePercent?.toString())}
                invalid={!!getErrorMessage(fields.workTimePercent.name)}
                aria-invalid={!!getErrorMessage(fields.workTimePercent.name)}
                errorText={getErrorMessage(fields.workTimePercent.name)}
              />
            </$GridCell>
          )}

          <$GridCell
            $colStart={item.paySubsidyPercent === 100 ? 6 : 3}
            $colSpan={3}
          >
            <DateInput
              label={t(`${translationsBase}.salarySupportPeriod`, {
                period: formatStringFloatValue(
                  diffMonths(parseDate(item.endDate), parseDate(item.startDate))
                ),
              })}
              id={fields.startDate.name}
              name={fields.startDate.name}
              placeholder={fields.startDate.placeholder}
              language={language}
              value={convertToUIDateFormat(item.startDate)}
              onChange={(value) =>
                updatePaySubsidies(index, {
                  startDate: value,
                  endDate: convertToUIDateFormat(
                    getCorrectEndDate(parseDate(value), parseDate(item.endDate))
                  ),
                })
              }
              minDate={dateInputLimits.min}
              maxDate={dateInputLimits.max}
            />
          </$GridCell>

          <$GridCell
            $colStart={item.paySubsidyPercent === 100 ? 9 : 6}
            $colSpan={3}
          >
            <DateInput
              label={fields.endDate.label}
              id={fields.endDate.name}
              name={fields.endDate.name}
              placeholder={fields.endDate.placeholder}
              language={language}
              onChange={(value) =>
                updatePaySubsidies(index, {
                  endDate: convertToUIDateFormat(
                    getCorrectEndDate(
                      parseDate(item.startDate),
                      parseDate(value)
                    )
                  ),
                })
              }
              value={convertToUIDateFormat(item.endDate)}
              style={{ paddingRight: `${theme.spacing.s}` }}
              minDate={dateInputLimits.min}
              maxDate={dateInputLimits.max}
            />
          </$GridCell>
          <$GridCell $colSpan={11}>
            <hr />
          </$GridCell>
        </React.Fragment>
      ))}
    </>
  );
};

type TrainingCompensationsListProps = {
  formik: FormikProps<CalculationFormProps>;
  fields: Record<CALCULATION_SALARY_KEYS, Field<CALCULATION_SALARY_KEYS>>;
  translationsBase: string;
  removeTrainingCompensation: (id: string) => void;
};

const TrainingCompensationsList: React.FC<TrainingCompensationsListProps> = ({
  formik,
  fields,
  translationsBase,
  removeTrainingCompensation,
}) => {
  const { t } = useTranslation();
  if (
    !formik.values.trainingCompensations ||
    formik.values.trainingCompensations.length === 0
  ) {
    return null;
  }

  return (
    <>
      <$GridCell $colStart={1} $colSpan={2}>
        <$CalculatorText>{fields.monthlyAmount.label}</$CalculatorText>
      </$GridCell>

      <$GridCell $colStart={3} $colSpan={3}>
        <$CalculatorText>
          {t(`${translationsBase}.apprenticeshipPeriod`)}
        </$CalculatorText>
      </$GridCell>

      {formik.values.trainingCompensations.map((item: TrainingCompensation) => (
        <React.Fragment key={item.id}>
          <$GridCell $colStart={1} $colSpan={2} style={{ background: 'white' }}>
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
            <$CalculatorTableRow isTotal style={{ padding: 0, height: '100%' }}>
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
    </>
  );
};

type TrainingCompensationInputSectionProps = {
  formik: FormikProps<CalculationFormProps>;
  fields: Record<CALCULATION_SALARY_KEYS, Field<CALCULATION_SALARY_KEYS>>;
  translationsBase: string;
  newTrainingCompensation: TrainingCompensation;
  setNewTrainingCompensation: React.Dispatch<
    React.SetStateAction<TrainingCompensation>
  >;
  addNewTrainingCompensation: () => void;
  removeTrainingCompensation: (id: string) => void;
  isDisabledAddTrainingCompensationButton: boolean;
  getErrorMessage: (fieldName: string) => string | undefined;
  language: Language;
  dateInputLimits: { min: Date; max: Date };
  theme: DefaultTheme;
};

const TrainingCompensationInputSection: React.FC<
  TrainingCompensationInputSectionProps
> = ({
  formik,
  fields,
  translationsBase,
  newTrainingCompensation,
  setNewTrainingCompensation,
  addNewTrainingCompensation,
  removeTrainingCompensation,
  isDisabledAddTrainingCompensationButton,
  getErrorMessage,
  language,
  dateInputLimits,
  theme,
}) => {
  const { t } = useTranslation();
  const eurosPerMonth = 'common:utility.eurosPerMonth';

  return (
    <>
      <$GridCell $colStart={1} $colSpan={11}>
        <$CalculatorHeader
          css={`
            margin-top: ${String(theme.spacing.m)};
          `}
        >
          {t(`${translationsBase}.apprenticeshipCompensation`)}
        </$CalculatorHeader>
      </$GridCell>

      <TrainingCompensationsList
        formik={formik}
        fields={fields}
        translationsBase={translationsBase}
        removeTrainingCompensation={removeTrainingCompensation}
      />

      <$GridCell $colStart={1} $colSpan={1}>
        <TextInput
          id={fields.monthlyAmount.name}
          name={fields.monthlyAmount.name}
          label={fields.monthlyAmount.label}
          onChange={(e) =>
            setNewTrainingCompensation((prevValue: TrainingCompensation) => ({
              ...prevValue,
              monthlyAmount: e.target.value,
            }))
          }
          value={formatStringFloatValue(newTrainingCompensation.monthlyAmount)}
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
            setNewTrainingCompensation((prevValue: TrainingCompensation) => ({
              ...prevValue,
              startDate: value,
            }))
          }
          value={convertToUIDateFormat(newTrainingCompensation.startDate)}
          invalid={!!getErrorMessage(fields.trainingCompensationStartDate.name)}
          aria-invalid={
            !!getErrorMessage(fields.trainingCompensationStartDate.name)
          }
          errorText={getErrorMessage(fields.trainingCompensationStartDate.name)}
          minDate={dateInputLimits.min}
          maxDate={dateInputLimits.max}
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
            setNewTrainingCompensation((prevValue: TrainingCompensation) => ({
              ...prevValue,
              endDate:
                getCorrectEndDate(prevValue.startDate, value)?.toString() ?? '',
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
          errorText={getErrorMessage(fields.trainingCompensationEndDate.name)}
          style={{ paddingRight: `${theme.spacing.s}` }}
          minDate={dateInputLimits.min}
          maxDate={dateInputLimits.max}
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
      <$GridCell $colSpan={11}>
        <hr />
      </$GridCell>
    </>
  );
};

const SalaryBenefitCalculatorView: React.FC<
  SalaryBenefitCalculatorViewProps
> = ({
  application,
  isRecalculationRequired,
  setIsRecalculationRequired,
  setCalculationErrors,
  calculationsErrors,
}) => {
  const { t } = useTranslation();
  const {
    formik,
    fields,
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
    dateInputLimits,
  } = useSalaryBenefitCalculatorData(application, setCalculationErrors);
  const {
    translationsBase,
    theme,
    language,
    getErrorMessage,
    handleSubmit,
    handleClear,
  } = useCalculatorData(
    CALCULATION_TYPES.SALARY,
    formik,
    setIsRecalculationRequired,
    application
  );

  const eurosPerMonth = 'common:utility.eurosPerMonth';
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);

  const onClear = (): void => {
    setNewTrainingCompensation({
      id: '',
      monthlyAmount: '',
      startDate: '',
      endDate: '',
    });
    handleClear(true);
    setIsResetConfirmOpen(false);
  };

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

      <$GridCell $colSpan={11}>
        <hr />
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
              onChange={(stateAidMaxPercentage: OptionType) =>
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

          <$GridCell $colSpan={11}>
            <hr />
          </$GridCell>

          <PaySubsidiesSection
            formik={formik}
            fields={fields}
            translationsBase={translationsBase}
            paySubsidyPercentageOptions={paySubsidyPercentageOptions}
            getPaySubsidyPercentageSelectValue={
              getPaySubsidyPercentageSelectValue
            }
            getErrorMessage={getErrorMessage}
            application={application}
            language={language}
            dateInputLimits={dateInputLimits}
            theme={theme}
          />
        </>
      )}

      {application.apprenticeshipProgram && !isManualCalculator && (
        <TrainingCompensationInputSection
          formik={formik}
          fields={fields}
          translationsBase={translationsBase}
          newTrainingCompensation={newTrainingCompensation}
          setNewTrainingCompensation={setNewTrainingCompensation}
          addNewTrainingCompensation={addNewTrainingCompensation}
          removeTrainingCompensation={removeTrainingCompensation}
          isDisabledAddTrainingCompensationButton={
            isDisabledAddTrainingCompensationButton
          }
          getErrorMessage={getErrorMessage}
          language={language}
          dateInputLimits={dateInputLimits}
          theme={theme}
        />
      )}

      <$GridCell $colSpan={11}>
        <$CalculatorHeader>
          {t(`${translationsBase}.periodHeader`)}
        </$CalculatorHeader>
      </$GridCell>

      {application.startDate && application.endDate && (
        <$GridCell $colStart={1} $colSpan={11} style={{ alignSelf: 'center' }}>
          <$ViewField style={{ marginBottom: theme.spacing.xs }}>
            {t(`${translationsBase}.appliedPeriod`)}
            <b>
              {t(`${translationsBase}.startEndDates`, {
                startDate: convertToUIDateFormat(application.startDate),
                endDate: convertToUIDateFormat(application.endDate),
                period: formatStringFloatValue(
                  application.durationInMonthsRounded
                ),
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
        {/* TODO: MAX DATE */}
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
          maxDate={dateInputLimits.max}
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
        <$ViewField
          css={`
            color: ${theme.colors.brick};
          `}
        >
          {application.apprenticeshipProgram &&
            !isManualCalculator &&
            isDisabledAddTrainingCompensationButton === false &&
            t('common:calculators.errors.trainingCompensation.invalid')}
        </$ViewField>

        <Button
          onClick={handleSubmit}
          theme="coat"
          data-testid="run-calculation"
          style={{ marginRight: 'var(--spacing-xs)' }}
        >
          {t(`${translationsBase}.calculate`)}
        </Button>

        <Button
          onClick={() => setIsResetConfirmOpen(true)}
          theme="coat"
          variant="secondary"
        >
          {t(`${translationsBase}.clear`)}
        </Button>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={11}>
        <CalculatorErrors data={calculationsErrors} />
      </$GridCell>

      {isRecalculationRequired &&
        (application?.calculation?.rows?.length ?? 0) > 0 && (
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
          data={application}
          isManualCalculator={isManualCalculator}
          isRecalculationRequired={isRecalculationRequired}
        />
      )}
      {isResetConfirmOpen && (
        <Modal
          id="confirmResetCalculation"
          isOpen={isResetConfirmOpen}
          title={t(`${translationsBase}.confirmClear`)}
          submitButtonLabel={t('common:utility.yes')}
          cancelButtonLabel={t('common:utility.no')}
          handleToggle={() => setIsResetConfirmOpen(false)}
          handleSubmit={() => onClear()}
          className=""
          variant="danger"
          theme={theme.components.modal.coat}
        />
      )}
    </ReviewSection>
  );
};

export default SalaryBenefitCalculatorView;
