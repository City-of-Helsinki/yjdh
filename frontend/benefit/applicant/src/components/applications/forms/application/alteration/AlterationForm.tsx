import { AxiosError } from 'axios';
import {
  $ButtonContainer,
  $H2,
  $SaveActionFormErrorText,
} from 'benefit/applicant/components/applications/forms/application/alteration/AlterationForm.sc';
import useAlterationForm from 'benefit/applicant/components/applications/forms/application/alteration/useAlterationForm';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { ALTERATION_STATE, ALTERATION_TYPE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlterationData,
} from 'benefit-shared/types/application';
import {
  Button,
  DateInput,
  IconAlertCircleFill,
  IconArrowRight,
  RadioButton,
  SelectionGroup,
  TextInput,
} from 'hds-react';
import React, { useMemo } from 'react';
import { MutationFunction } from 'react-query';
import {
  $Grid,
  $GridCell,
  $Hr,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import {
  convertDateFormat,
  DATE_FORMATS,
  formatDate,
} from 'shared/utils/date.utils';

type Props = {
  application: Application;
  onCancel: () => void;
  onSuccess?: MutationFunction<void, ApplicationAlterationData>;
  onError?: (error: AxiosError<unknown>) => void;
};

const AlterationForm = ({
  application,
  onCancel,
  onSuccess,
  onError,
}: Props): JSX.Element => {
  const { t, formik, language, isSubmitted, isSubmitting, handleSubmit } =
    useAlterationForm({ application, onSuccess, onError });

  const { alterationType, useEinvoice, endDate } = formik.values;

  const minEndDate = useMemo<Date>(
    () => new Date(application.startDate),
    [application.startDate]
  );
  const maxEndDate = useMemo<Date>(
    () => new Date(application.endDate),
    [application.endDate]
  );
  const minResumeDate = useMemo<Date>(() => {
    if (endDate) {
      return new Date(convertDateFormat(endDate));
    }
    return minEndDate;
  }, [minEndDate, endDate]);
  const maxResumeDate = maxEndDate;

  const translationBase = 'common:applications.alterations.new';

  const disableOccupiedDates = (date: Date): boolean =>
    application.alterations.some(
      (alteration) =>
        alteration.state === ALTERATION_STATE.HANDLED &&
        alteration.recoveryStartDate <=
          formatDate(date, DATE_FORMATS.BACKEND_DATE) &&
        alteration.recoveryEndDate >=
          formatDate(date, DATE_FORMATS.BACKEND_DATE)
    );

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  /* eslint-disable unicorn/consistent-destructuring */
  return (
    <section>
      <$Grid>
        <$GridCell $colSpan={12}>
          <$H2>{t(`${translationBase}.details`)}</$H2>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <SelectionGroup
            label={t(`${translationBase}.fields.alterationType.label`)}
            required
            aria-invalid={!!getErrorMessage('alterationType')}
            errorText={getErrorMessage('alterationType')}
            id="alteration-alteration-type"
          >
            <RadioButton
              key="alteration-alteration-type-termination"
              id="alteration-alteration-type-termination"
              value={ALTERATION_TYPE.TERMINATION}
              label={t(`${translationBase}.fields.alterationType.termination`)}
              name="alterationType"
              checked={alterationType === ALTERATION_TYPE.TERMINATION}
              onChange={formik.handleChange}
              style={theme.components.radio as React.CSSProperties}
            />
            <RadioButton
              key="alteration-alteration-type-suspension"
              id="alteration-alteration-type-suspension"
              value={ALTERATION_TYPE.SUSPENSION}
              label={t(`${translationBase}.fields.alterationType.suspension`)}
              name="alterationType"
              checked={alterationType === ALTERATION_TYPE.SUSPENSION}
              onChange={formik.handleChange}
              style={theme.components.radio as React.CSSProperties}
            />
          </SelectionGroup>
        </$GridCell>
        {alterationType !== null && (
          <>
            <$GridCell $colSpan={3}>
              <DateInput
                label={t(`${translationBase}.fields.endDate.label`)}
                helperText={t(`${translationBase}.fields.date.helpText`)}
                value={formik.values.endDate}
                id="alteration-end-date"
                name="endDate"
                required
                invalid={!!getErrorMessage('endDate')}
                aria-invalid={!!getErrorMessage('endDate')}
                errorText={getErrorMessage('endDate')}
                onChange={(value) => formik.setFieldValue('endDate', value)}
                onBlur={formik.handleBlur}
                language={language}
                minDate={minEndDate}
                maxDate={maxEndDate}
                isDateDisabledBy={disableOccupiedDates}
              />
            </$GridCell>
            {alterationType === ALTERATION_TYPE.SUSPENSION && (
              <$GridCell $colSpan={3}>
                <DateInput
                  label={t(`${translationBase}.fields.resumeDate.label`)}
                  helperText={t(`${translationBase}.fields.date.helpText`)}
                  value={formik.values.resumeDate}
                  id="alteration-resume-date"
                  name="resumeDate"
                  required
                  invalid={!!getErrorMessage('resumeDate')}
                  aria-invalid={!!getErrorMessage('resumeDate')}
                  errorText={getErrorMessage('resumeDate')}
                  onChange={(value) =>
                    formik.setFieldValue('resumeDate', value)
                  }
                  onBlur={formik.handleBlur}
                  language={language}
                  minDate={minResumeDate}
                  maxDate={maxResumeDate}
                  isDateDisabledBy={disableOccupiedDates}
                />
              </$GridCell>
            )}
            <$GridCell $colSpan={6} />
            <$GridCell $colSpan={6}>
              <TextInput
                label={
                  alterationType === ALTERATION_TYPE.SUSPENSION
                    ? t(`${translationBase}.fields.suspensionReason.label`)
                    : t(`${translationBase}.fields.terminationReason.label`)
                }
                value={formik.values.reason}
                id="alteration-reason"
                name="reason"
                invalid={!!getErrorMessage('reason')}
                aria-invalid={!!getErrorMessage('reason')}
                errorText={getErrorMessage('reason')}
                helperText={
                  alterationType === ALTERATION_TYPE.SUSPENSION
                    ? t(`${translationBase}.fields.suspensionReason.helpText`)
                    : t(`${translationBase}.fields.terminationReason.helpText`)
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </$GridCell>
          </>
        )}
        <$GridCell $colSpan={12}>
          <$Hr css="margin-top: 0;" />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <$H2>{t(`${translationBase}.billing`)}</$H2>
        </$GridCell>
        <$GridCell $colSpan={4}>
          <TextInput
            label={t(`${translationBase}.fields.contactPersonName.label`)}
            helperText={t(
              `${translationBase}.fields.contactPersonName.helpText`
            )}
            value={formik.values.contactPersonName}
            id="alteration-contact-person-name"
            name="contactPersonName"
            invalid={!!getErrorMessage('contactPersonName')}
            aria-invalid={!!getErrorMessage('contactPersonName')}
            errorText={getErrorMessage('contactPersonName')}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={8} />
        <$GridCell $colSpan={8}>
          <SelectionGroup
            label={t(`${translationBase}.fields.useEinvoice.label`)}
            required
            aria-invalid={!!getErrorMessage('useEinvoice')}
            errorText={getErrorMessage('useEinvoice')}
            id="alteration-use-invoice"
          >
            <RadioButton
              key="alteration-use-einvoice-no"
              id="alteration-use-einvoice-no"
              value="0"
              label={t(`${translationBase}.fields.useEinvoice.no`, {
                streetAddress: application.company.streetAddress,
                postCode: application.company.postcode,
                city: application.company.city,
              })}
              name="useEinvoice"
              checked={!useEinvoice}
              onChange={() => formik.setFieldValue('useEinvoice', false)}
              style={theme.components.radio as React.CSSProperties}
            />
            <RadioButton
              key="alteration-use-einvoice-yes"
              id="alteration-use-einvoice-yes"
              value="1"
              label={t(`${translationBase}.fields.useEinvoice.yes`)}
              name="useEinvoice"
              checked={!!useEinvoice}
              onChange={() => formik.setFieldValue('useEinvoice', true)}
              style={theme.components.radio as React.CSSProperties}
            />
          </SelectionGroup>
        </$GridCell>
        <$GridCell $colSpan={4} />
        {useEinvoice && (
          <>
            <$GridCell $colSpan={4}>
              <TextInput
                label={t(
                  `${translationBase}.fields.einvoiceProviderName.label`
                )}
                placeholder={t(
                  `${translationBase}.fields.einvoiceProviderName.placeholder`
                )}
                value={formik.values.einvoiceProviderName}
                id="alteration-einvoice-provider-name"
                name="einvoiceProviderName"
                invalid={!!getErrorMessage('einvoiceProviderName')}
                aria-invalid={!!getErrorMessage('einvoiceProviderName')}
                errorText={getErrorMessage('einvoiceProviderName')}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={8} />
            <$GridCell $colSpan={4}>
              <TextInput
                label={t(
                  `${translationBase}.fields.einvoiceProviderIdentifier.label`
                )}
                placeholder={t(
                  `${translationBase}.fields.einvoiceProviderIdentifier.placeholder`
                )}
                value={formik.values.einvoiceProviderIdentifier}
                id="alteration-einvoice-provider-identifier"
                name="einvoiceProviderIdentifier"
                invalid={!!getErrorMessage('einvoiceProviderIdentifier')}
                aria-invalid={!!getErrorMessage('einvoiceProviderIdentifier')}
                errorText={getErrorMessage('einvoiceProviderIdentifier')}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={8} />
            <$GridCell $colSpan={4}>
              <TextInput
                label={t(`${translationBase}.fields.einvoiceAddress.label`)}
                placeholder={t(
                  `${translationBase}.fields.einvoiceAddress.placeholder`
                )}
                tooltipText={t(
                  `${translationBase}.fields.einvoiceAddress.tooltip`
                )}
                value={formik.values.einvoiceAddress}
                id="alteration-einvoice-address"
                name="einvoiceAddress"
                invalid={!!getErrorMessage('einvoiceAddress')}
                aria-invalid={!!getErrorMessage('einvoiceAddress')}
                errorText={getErrorMessage('einvoiceAddress')}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
            </$GridCell>
          </>
        )}
      </$Grid>
      <$Hr />
      <$ButtonContainer>
        <Button theme="black" variant="secondary" onClick={onCancel}>
          {t(`${translationBase}.actions.cancel`)}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (isSubmitted && !formik.isValid)}
          theme="coat"
          iconRight={<IconArrowRight />}
          isLoading={isSubmitting}
          loadingText={t(`common:utility.submitting`)}
        >
          {t(`${translationBase}.actions.submit`)}
        </Button>
      </$ButtonContainer>
      {isSubmitted && !formik.isValid && (
        <$SaveActionFormErrorText>
          <IconAlertCircleFill />
          <p aria-live="polite">
            {t('common:applications.errors.dirtyOrInvalidForm')}
          </p>
        </$SaveActionFormErrorText>
      )}
    </section>
  );
  /* eslint-enable unicorn/consistent-destructuring */
};

export default AlterationForm;
