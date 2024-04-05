import { $Notification } from 'benefit/applicant/components/Notification/Notification.sc';
import { APPLICATION_START_DATE } from 'benefit/applicant/constants';
import { useAlertBeforeLeaving } from 'benefit/applicant/hooks/useAlertBeforeLeaving';
import { useDependentFieldsEffect } from 'benefit/applicant/hooks/useDependentFieldsEffect';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import {
  BENEFIT_TYPES,
  ORGANIZATION_TYPES,
  PAY_SUBSIDY_GRANTED,
} from 'benefit-shared/constants';
import { DateInput, SelectionGroup, TextInput } from 'hds-react';
import React from 'react';
import FieldLabel from 'shared/components/forms/fields/fieldLabel/FieldLabel';
import {
  $Checkbox,
  $RadioButton,
} from 'shared/components/forms/fields/Fields.sc';
import { $Header } from 'shared/components/forms/heading/Heading.sc';
import FormSection from 'shared/components/forms/section/FormSection';
import {
  $GridCell,
  $SubHeader,
} from 'shared/components/forms/section/FormSection.sc';
import {
  formatStringFloatValue,
  stringFloatToFixed,
} from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import { $SubFieldContainer } from '../Application.sc';
import StepperActions from '../stepperActions/StepperActions';
import { findIntersectionOfTouchedAndErroredFields } from '../utils';
import { useApplicationFormStep2 } from './useApplicationFormStep2';

const ApplicationFormStep2: React.FC<DynamicFormStepComponentProps> = ({
  data,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const {
    t,
    clearBenefitValues,
    clearCommissionValues,
    clearPaySubsidyValues,
    setEndDate,
    handleSubmit,
    handleSave,
    handleBack,
    handleDelete,
    getErrorMessage,
    fields,
    translationsBase,
    formik,
    language,
    minEndDate,
    maxEndDate,
    organizationType,
  } = useApplicationFormStep2(data);

  const theme = useTheme();

  useDependentFieldsEffect(
    {
      paySubsidyGranted: formik.values.paySubsidyGranted,
      associationHasBusinessActivities:
        formik.values.associationHasBusinessActivities,
      startDate: formik.values.startDate,
    },
    {
      isFormDirty: formik.dirty,
      clearBenefitValues,
      clearCommissionValues,
      clearPaySubsidyValues,
      setEndDate,
    }
  );

  useAlertBeforeLeaving(formik.dirty);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection headerLevel="h2" header={t(`${translationsBase}.heading1`)}>
        <$GridCell $colSpan={3}>
          <TextInput
            id={fields.employee.firstName.name}
            name={fields.employee.firstName.name}
            label={fields.employee.firstName.label}
            placeholder={fields.employee.firstName.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.firstName ?? ''}
            invalid={!!getErrorMessage(fields.employee.firstName.name)}
            aria-invalid={!!getErrorMessage(fields.employee.firstName.name)}
            errorText={getErrorMessage(fields.employee.firstName.name)}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <TextInput
            id={fields.employee.lastName.name}
            name={fields.employee.lastName.name}
            label={fields.employee.lastName.label}
            placeholder={fields.employee.lastName.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.lastName ?? ''}
            invalid={!!getErrorMessage(fields.employee.lastName.name)}
            aria-invalid={!!getErrorMessage(fields.employee.lastName.name)}
            errorText={getErrorMessage(fields.employee.lastName.name)}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <TextInput
            id={fields.employee.socialSecurityNumber.name}
            name={fields.employee.socialSecurityNumber.name}
            label={fields.employee.socialSecurityNumber.label}
            placeholder={fields.employee.socialSecurityNumber.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.socialSecurityNumber ?? ''}
            invalid={
              !!getErrorMessage(fields.employee.socialSecurityNumber.name)
            }
            aria-invalid={
              !!getErrorMessage(fields.employee.socialSecurityNumber.name)
            }
            errorText={getErrorMessage(
              fields.employee.socialSecurityNumber.name
            )}
            required
          />
        </$GridCell>
        <$GridCell
          $colStart={1}
          $colSpan={6}
          css={`
            margin-top: ${theme.spacing.l};
          `}
        >
          <FieldLabel
            value={fields.employee.isLivingInHelsinki.label}
            required
          />
          <$Checkbox
            id={fields.employee.isLivingInHelsinki.name}
            name={fields.employee.isLivingInHelsinki.name}
            label={fields.employee.isLivingInHelsinki.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            aria-invalid={
              !!getErrorMessage(fields.employee.isLivingInHelsinki.name)
            }
            errorText={getErrorMessage(fields.employee.isLivingInHelsinki.name)}
            required
            checked={formik.values.employee?.isLivingInHelsinki === true}
          />
        </$GridCell>

        {organizationType === ORGANIZATION_TYPES.ASSOCIATION && (
          <$GridCell $colSpan={8}>
            <FieldLabel
              value={fields.associationImmediateManagerCheck.label}
              required
            />
            <$Checkbox
              id={fields.associationImmediateManagerCheck.name}
              name={fields.associationImmediateManagerCheck.name}
              label={fields.associationImmediateManagerCheck.placeholder}
              required
              checked={formik.values.associationImmediateManagerCheck === true}
              errorText={getErrorMessage(
                fields.associationImmediateManagerCheck.name
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={
                !!getErrorMessage(fields.associationImmediateManagerCheck.name)
              }
            />
          </$GridCell>
        )}
      </FormSection>
      <FormSection
        headerLevel="h2"
        header={t(
          `${translationsBase}.heading5${
            formik.values.benefitType === BENEFIT_TYPES.COMMISSION
              ? 'Assignment'
              : 'Employment'
          }`
        )}
      >
        <$GridCell $colSpan={4}>
          <TextInput
            id={fields.employee.jobTitle.name}
            name={fields.employee.jobTitle.name}
            label={fields.employee.jobTitle.label}
            placeholder={fields.employee.jobTitle.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.jobTitle ?? ''}
            invalid={!!getErrorMessage(fields.employee.jobTitle.name)}
            aria-invalid={!!getErrorMessage(fields.employee.jobTitle.name)}
            errorText={getErrorMessage(fields.employee.jobTitle.name)}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <TextInput
            id={fields.employee.workingHours.name}
            name={fields.employee.workingHours.name}
            label={fields.employee.workingHours.label}
            onBlur={formik.handleBlur}
            onChange={(e) =>
              formik.setFieldValue(
                fields.employee.workingHours.name,
                stringFloatToFixed(e.target.value)
              )
            }
            value={formatStringFloatValue(formik.values.employee?.workingHours)}
            invalid={!!getErrorMessage(fields.employee.workingHours.name)}
            aria-invalid={!!getErrorMessage(fields.employee.workingHours.name)}
            errorText={getErrorMessage(fields.employee.workingHours.name)}
            required
            helperText={t(`${translationsBase}.fields.workingHours.helperText`)}
          />
        </$GridCell>
        <$GridCell $colSpan={4}>
          <TextInput
            id={fields.employee.collectiveBargainingAgreement.name}
            name={fields.employee.collectiveBargainingAgreement.name}
            label={fields.employee.collectiveBargainingAgreement.label}
            placeholder={
              fields.employee.collectiveBargainingAgreement.placeholder
            }
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.collectiveBargainingAgreement ?? ''}
            invalid={
              !!getErrorMessage(
                fields.employee.collectiveBargainingAgreement.name
              )
            }
            aria-invalid={
              !!getErrorMessage(
                fields.employee.collectiveBargainingAgreement.name
              )
            }
            errorText={getErrorMessage(
              fields.employee.collectiveBargainingAgreement.name
            )}
            tooltipLabel={t(`common:tooltip.ariaLabel`)}
            tooltipButtonLabel={t(`common:tooltip.ariaButtonLabel`)}
            tooltipText={t(
              `${translationsBase}.fields.collectiveBargainingAgreement.tooltip`
            )}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <$Header as="h3" size="xs" style={{ marginBottom: 0 }}>
            {t(`${translationsBase}.heading5EmploymentSub1`)}
          </$Header>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <$SubHeader weight="400" as="h4">
            {t(`${translationsBase}.salaryExpensesExplanation`)}
          </$SubHeader>
        </$GridCell>
        <$GridCell $colSpan={2}>
          <TextInput
            id={fields.employee.monthlyPay.name}
            name={fields.employee.monthlyPay.name}
            label={fields.employee.monthlyPay.label}
            onBlur={formik.handleBlur}
            onChange={(e) =>
              formik.setFieldValue(
                fields.employee.monthlyPay.name,
                stringFloatToFixed(e.target.value)
              )
            }
            value={formatStringFloatValue(formik.values.employee?.monthlyPay)}
            invalid={!!getErrorMessage(fields.employee.monthlyPay.name)}
            aria-invalid={!!getErrorMessage(fields.employee.monthlyPay.name)}
            errorText={getErrorMessage(fields.employee.monthlyPay.name)}
            required
            helperText={t(`${translationsBase}.fields.monthlyPay.helperText`)}
            tooltipLabel={t(`common:tooltip.ariaLabel`)}
            tooltipButtonLabel={t(`common:tooltip.ariaButtonLabel`)}
            tooltipText={t(`${translationsBase}.fields.monthlyPay.tooltip`)}
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <TextInput
            id={fields.employee.vacationMoney.name}
            name={fields.employee.vacationMoney.name}
            label={fields.employee.vacationMoney.label}
            onBlur={formik.handleBlur}
            onChange={(e) =>
              formik.setFieldValue(
                fields.employee.vacationMoney.name,
                stringFloatToFixed(e.target.value)
              )
            }
            value={formatStringFloatValue(
              formik.values.employee?.vacationMoney
            )}
            invalid={!!getErrorMessage(fields.employee.vacationMoney.name)}
            aria-invalid={!!getErrorMessage(fields.employee.vacationMoney.name)}
            errorText={getErrorMessage(fields.employee.vacationMoney.name)}
            required
            helperText={t(
              `${translationsBase}.fields.vacationMoney.helperText`
            )}
            tooltipLabel={t(`common:tooltip.ariaLabel`)}
            tooltipButtonLabel={t(`common:tooltip.ariaButtonLabel`)}
            tooltipText={t(`${translationsBase}.fields.vacationMoney.tooltip`)}
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <TextInput
            id={fields.employee.otherExpenses.name}
            name={fields.employee.otherExpenses.name}
            label={fields.employee.otherExpenses.label}
            onBlur={formik.handleBlur}
            onChange={(e) =>
              formik.setFieldValue(
                fields.employee.otherExpenses.name,
                stringFloatToFixed(e.target.value)
              )
            }
            value={formatStringFloatValue(
              formik.values.employee?.otherExpenses
            )}
            invalid={!!getErrorMessage(fields.employee.otherExpenses.name)}
            aria-invalid={!!getErrorMessage(fields.employee.otherExpenses.name)}
            errorText={getErrorMessage(fields.employee.otherExpenses.name)}
            required
            helperText={t(
              `${translationsBase}.fields.otherExpenses.helperText`
            )}
            tooltipLabel={t(`common:tooltip.ariaLabel`)}
            tooltipButtonLabel={t(`common:tooltip.ariaButtonLabel`)}
            tooltipText={t(`${translationsBase}.fields.otherExpenses.tooltip`)}
          />
        </$GridCell>
      </FormSection>
      <FormSection
        headerLevel="h2"
        header={t(`${translationsBase}.heading2`)}
        tooltip={t(`${translationsBase}.tooltips.heading2`)}
      >
        <$GridCell $colSpan={12}>
          <SelectionGroup
            id={fields.paySubsidyGranted.name}
            label={fields.paySubsidyGranted.label}
            direction="vertical"
            errorText={getErrorMessage(fields.paySubsidyGranted.name)}
          >
            <$RadioButton
              id={`${fields.paySubsidyGranted.name}Default`}
              name={fields.paySubsidyGranted.name}
              value={PAY_SUBSIDY_GRANTED.GRANTED}
              label={t(
                `${translationsBase}.fields.${fields.paySubsidyGranted.name}.paySubsidyDefault`
              )}
              onBlur={formik.handleBlur}
              onChange={() => {
                formik.setFieldValue(
                  fields.paySubsidyGranted.name,
                  PAY_SUBSIDY_GRANTED.GRANTED
                );
              }}
              checked={
                formik.values.paySubsidyGranted === PAY_SUBSIDY_GRANTED.GRANTED
              }
            />
            <$RadioButton
              id={`${fields.paySubsidyGranted.name}Aged`}
              name={fields.paySubsidyGranted.name}
              value={PAY_SUBSIDY_GRANTED.GRANTED_AGED}
              label={t(
                `${translationsBase}.fields.${fields.paySubsidyGranted.name}.paySubsidyAged`
              )}
              onBlur={formik.handleBlur}
              onChange={() => {
                formik.setFieldValue(
                  fields.paySubsidyGranted.name,
                  PAY_SUBSIDY_GRANTED.GRANTED_AGED
                );
              }}
              checked={
                formik.values.paySubsidyGranted ===
                PAY_SUBSIDY_GRANTED.GRANTED_AGED
              }
            />
            <$RadioButton
              id={`${fields.paySubsidyGranted.name}None`}
              name={fields.paySubsidyGranted.name}
              value={PAY_SUBSIDY_GRANTED.NOT_GRANTED}
              label={t(
                `${translationsBase}.fields.${fields.paySubsidyGranted.name}.paySubsidyNone`
              )}
              onBlur={formik.handleBlur}
              onChange={() => {
                formik.setFieldValue(
                  fields.paySubsidyGranted.name,
                  PAY_SUBSIDY_GRANTED.NOT_GRANTED
                );
              }}
              checked={
                formik.values.paySubsidyGranted ===
                PAY_SUBSIDY_GRANTED.NOT_GRANTED
              }
            />
          </SelectionGroup>
        </$GridCell>
        {[
          PAY_SUBSIDY_GRANTED.GRANTED,
          PAY_SUBSIDY_GRANTED.GRANTED_AGED,
        ].includes(formik.values.paySubsidyGranted) && (
          <$GridCell $colSpan={12}>
            <$SubFieldContainer>
              <SelectionGroup
                label={fields.apprenticeshipProgram.label}
                id={fields.apprenticeshipProgram.name}
                direction="vertical"
                required
                errorText={getErrorMessage(fields.apprenticeshipProgram.name)}
              >
                <$RadioButton
                  id={`${fields.apprenticeshipProgram.name}False`}
                  name={fields.apprenticeshipProgram.name}
                  value="false"
                  label={t(
                    `${translationsBase}.fields.${fields.apprenticeshipProgram.name}.no`
                  )}
                  onChange={() => {
                    formik.setFieldValue(
                      fields.apprenticeshipProgram.name,
                      false
                    );
                  }}
                  checked={formik.values.apprenticeshipProgram === false}
                />
                <$RadioButton
                  id={`${fields.apprenticeshipProgram.name}True`}
                  name={fields.apprenticeshipProgram.name}
                  value="true"
                  label={t(
                    `${translationsBase}.fields.${fields.apprenticeshipProgram.name}.yes`
                  )}
                  onChange={() => {
                    formik.setFieldValue(
                      fields.apprenticeshipProgram.name,
                      true
                    );
                  }}
                  checked={formik.values.apprenticeshipProgram === true}
                />
              </SelectionGroup>
            </$SubFieldContainer>
          </$GridCell>
        )}
      </FormSection>

      <FormSection
        headerLevel="h2"
        header={t(`${translationsBase}.heading4`)}
        paddingBottom
        columns={32}
      >
        <$GridCell $colSpan={32}>
          <$SubHeader weight="400">
            {t(`${translationsBase}.heading4Sub1`)}
          </$SubHeader>
        </$GridCell>
        <$GridCell $colSpan={6}>
          <DateInput
            id={fields.startDate.name}
            name={fields.startDate.name}
            label={fields.startDate.label}
            placeholder={fields.startDate.placeholder}
            language={language}
            onBlur={formik.handleBlur}
            onChange={(value) =>
              formik.setFieldValue(fields.startDate.name, value)
            }
            value={formik.values.startDate ?? ''}
            invalid={!!getErrorMessage(fields.startDate.name)}
            aria-invalid={!!getErrorMessage(fields.startDate.name)}
            errorText={getErrorMessage(fields.startDate.name)}
            minDate={APPLICATION_START_DATE}
            required
          />
        </$GridCell>
        <$GridCell
          $colSpan={1}
          style={{ margin: 'auto auto var(--spacing-s) auto' }}
        >
          –
        </$GridCell>
        <$GridCell $colSpan={6}>
          <DateInput
            id={fields.endDate.name}
            name={fields.endDate.name}
            label={fields.endDate.label}
            placeholder={fields.endDate.placeholder}
            language={language}
            onBlur={formik.handleBlur}
            onChange={(value) =>
              formik.setFieldValue(fields.endDate.name, value)
            }
            value={formik.values.endDate ?? ''}
            invalid={!!getErrorMessage(fields.endDate.name)}
            aria-invalid={!!getErrorMessage(fields.endDate.name)}
            errorText={getErrorMessage(fields.endDate.name)}
            initialMonth={!formik.values.endDate ? minEndDate : undefined}
            minDate={minEndDate}
            maxDate={maxEndDate}
            required
          />
        </$GridCell>
        {!!formik.values.apprenticeshipProgram && (
          <$GridCell
            $colStart={1}
            $colSpan={16}
            style={{ marginTop: 'var(--spacing-xl)' }}
          >
            <$Notification
              label={t(
                `${translationsBase}.notifications.apprenticeshipDidYouKnow.label`
              )}
            >
              {t(
                `${translationsBase}.notifications.apprenticeshipDidYouKnow.content`
              )}
            </$Notification>
          </$GridCell>
        )}
      </FormSection>
      <StepperActions
        handleSubmit={handleSubmit}
        handleSave={
          findIntersectionOfTouchedAndErroredFields(
            formik.touched,
            formik.errors
          ).length === 0
            ? handleSave
            : undefined
        }
        handleBack={handleBack}
        handleDelete={handleDelete}
      />
    </form>
  );
};

export default ApplicationFormStep2;
