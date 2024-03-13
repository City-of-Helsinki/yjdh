import { AxiosError } from 'axios';
import {
  $ButtonContainer,
  $SaveActionFormErrorText,
} from 'benefit/applicant/components/applications/forms/application/alteration/AlterationForm.sc';
import useAlterationForm from 'benefit/applicant/components/applications/forms/application/alteration/useAlterationForm';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
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
import { convertDateFormat } from 'shared/utils/date.utils';

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
  const {
    t,
    formik,
    language,
    isSubmitted,
    isSubmitting,
    error,
    handleSubmit,
  } = useAlterationForm({ application, onSuccess, onError });

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

  const disableOccupiedDates = (date: Date): boolean =>
    application.alterations.some(
      (alteration) =>
        alteration.recoveryStartDate < date.toISOString() &&
        alteration.recoveryEndDate > date.toISOString()
    );

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  /* eslint-disable unicorn/consistent-destructuring */
  return (
    <section>
      <$Grid>
        <$GridCell $colSpan={12}>
          <SelectionGroup
            label={t(
              'common:applications.alteration.fields.alterationType.label'
            )}
            required
            aria-invalid={!!getErrorMessage('alterationType')}
            errorText={getErrorMessage('alterationType')}
            id="alteration-alteration-type"
          >
            <RadioButton
              key="alteration-alteration-type-termination"
              id="alteration-alteration-type-termination"
              value={ALTERATION_TYPE.TERMINATION}
              label={t(
                'common:applications.alteration.fields.alterationType.termination'
              )}
              name="alterationType"
              checked={alterationType === ALTERATION_TYPE.TERMINATION}
              onChange={formik.handleChange}
              style={theme.components.radio as React.CSSProperties}
            />
            <RadioButton
              key="alteration-alteration-type-suspension"
              id="alteration-alteration-type-suspension"
              value={ALTERATION_TYPE.SUSPENSION}
              label={t(
                'common:applications.alteration.fields.alterationType.suspension'
              )}
              name="alterationType"
              checked={alterationType === ALTERATION_TYPE.SUSPENSION}
              onChange={formik.handleChange}
              style={theme.components.radio as React.CSSProperties}
            />
          </SelectionGroup>
        </$GridCell>
        {alterationType !== null && (
          <>
            <$GridCell $colSpan={4}>
              <DateInput
                label={t('common:applications.alteration.fields.endDate.label')}
                helperText={t(
                  'common:applications.alteration.fields.date.helpText'
                )}
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
              <$GridCell $colSpan={4}>
                <DateInput
                  label={t(
                    'common:applications.alteration.fields.resumeDate.label'
                  )}
                  helperText={t(
                    'common:applications.alteration.fields.date.helpText'
                  )}
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
            <$GridCell $colSpan={12}>
              <TextInput
                label={
                  alterationType === ALTERATION_TYPE.SUSPENSION
                    ? t(
                        'common:applications.alteration.fields.suspensionReason.label'
                      )
                    : t(
                        'common:applications.alteration.fields.terminationReason.label'
                      )
                }
                value={formik.values.reason}
                id="alteration-reason"
                name="reason"
                invalid={!!getErrorMessage('reason')}
                aria-invalid={!!getErrorMessage('reason')}
                errorText={getErrorMessage('reason')}
                helperText={
                  alterationType === ALTERATION_TYPE.SUSPENSION
                    ? t(
                        'common:applications.alteration.fields.suspensionReason.helpText'
                      )
                    : t(
                        'common:applications.alteration.fields.terminationReason.helpText'
                      )
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </$GridCell>
          </>
        )}
        <$GridCell $colSpan={12}>
          <$Hr />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <h2>{t('common:applications.alteration.billing')}</h2>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <TextInput
            label={t(
              'common:applications.alteration.fields.contactPersonName.label'
            )}
            helperText={t(
              'common:applications.alteration.fields.contactPersonName.helpText'
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
        <$GridCell $colSpan={12}>
          <SelectionGroup
            label={t('common:applications.alteration.fields.useEinvoice.label')}
            required
            aria-invalid={!!getErrorMessage('useEinvoice')}
            errorText={getErrorMessage('useEinvoice')}
            id="alteration-use-invoice"
          >
            <RadioButton
              key="alteration-use-einvoice-no"
              id="alteration-use-einvoice-no"
              value="0"
              label={t('common:applications.alteration.fields.useEinvoice.no', {
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
              label={t('common:applications.alteration.fields.useEinvoice.yes')}
              name="useEinvoice"
              checked={!!useEinvoice}
              onChange={() => formik.setFieldValue('useEinvoice', true)}
              style={theme.components.radio as React.CSSProperties}
            />
          </SelectionGroup>
        </$GridCell>
        {useEinvoice && (
          <>
            <$GridCell $colSpan={12}>
              <TextInput
                label={t(
                  'common:applications.alteration.fields.einvoiceProviderName.label'
                )}
                placeholder={t(
                  'common:applications.alteration.fields.einvoiceProviderName.placeholder'
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
            <$GridCell $colSpan={12}>
              <TextInput
                label={t(
                  'common:applications.alteration.fields.einvoiceProviderIdentifier.label'
                )}
                placeholder={t(
                  'common:applications.alteration.fields.einvoiceProviderIdentifier.placeholder'
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
            <$GridCell $colSpan={12}>
              <TextInput
                label={t(
                  'common:applications.alteration.fields.einvoiceAddress.label'
                )}
                placeholder={t(
                  'common:applications.alteration.fields.einvoiceAddress.placeholder'
                )}
                tooltipText={t(
                  'common:applications.alteration.fields.einvoiceAddress.tooltip'
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
      {error && <div>{JSON.stringify(error)}</div>}
      <$ButtonContainer>
        <Button theme="black" variant="secondary" onClick={onCancel}>
          {t(`common:applications.alteration.actions.cancel`)}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (isSubmitted && !formik.isValid)}
          theme="coat"
          iconRight={<IconArrowRight />}
          isLoading={isSubmitting}
          loadingText={t(`common:utility.submitting`)}
        >
          {t(`common:applications.alteration.actions.submit`)}
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
