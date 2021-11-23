import { $Notification } from 'benefit/applicant/components/Notification/Notification.sc';
import {
  APPLICATION_FIELDS_STEP2,
  APPLICATION_START_DATE,
  BENEFIT_TYPES,
} from 'benefit/applicant/constants';
import { useAlertBeforeLeaving } from 'benefit/applicant/hooks/useAlertBeforeLeaving';
import { useDependentFieldsEffect } from 'benefit/applicant/hooks/useDependentFieldsEffect';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { DateInput, Select, SelectionGroup, TextInput } from 'hds-react';
import camelCase from 'lodash/camelCase';
import React from 'react';
import FieldLabel from 'shared/components/forms/fields/fieldLabel/FieldLabel';
import {
  $Checkbox,
  $RadioButton,
} from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import Heading from 'shared/components/forms/heading/Heading';
import FormSection from 'shared/components/forms/section/FormSection';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import {
  formatStringFloatValue,
  phoneToLocal,
  stringFloatToFixed,
} from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import StepperActions from '../stepperActions/StepperActions';
import { useApplicationFormStep2 } from './useApplicationFormStep2';

const ApplicationFormStep2: React.FC<DynamicFormStepComponentProps> = ({
  data,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const {
    t,
    clearDatesValues,
    clearBenefitValues,
    clearCommissionValues,
    clearContractValues,
    clearPaySubsidyValues,
    setEndDate,
    handleSubmit,
    handleSave,
    handleBack,
    getErrorMessage,
    getSelectValue,
    fields,
    translationsBase,
    formik,
    subsidyOptions,
    language,
    minEndDate,
    maxEndDate,
  } = useApplicationFormStep2(data);

  const theme = useTheme();

  useDependentFieldsEffect(
    {
      apprenticeshipProgram: formik.values.apprenticeshipProgram,
      benefitType: formik.values.benefitType,
      paySubsidyGranted: formik.values.paySubsidyGranted,
      associationHasBusinessActivities:
        formik.values.associationHasBusinessActivities,
      startDate: formik.values.startDate,
    },
    {
      isFormDirty: formik.dirty,
      clearBenefitValues,
      clearDatesValues,
      clearCommissionValues,
      clearContractValues,
      clearPaySubsidyValues,
      setEndDate,
    }
  );

  useAlertBeforeLeaving(formik.dirty);

  const selectLabel = t('common:select');

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection header={t(`${translationsBase}.heading1`)}>
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
        <$GridCell $colSpan={2}>
          <TextInput
            id={fields.employee.phoneNumber.name}
            name={fields.employee.phoneNumber.name}
            label={fields.employee.phoneNumber.label}
            placeholder={fields.employee.phoneNumber.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={phoneToLocal(formik.values.employee?.phoneNumber)}
            invalid={!!getErrorMessage(fields.employee.phoneNumber.name)}
            aria-invalid={!!getErrorMessage(fields.employee.phoneNumber.name)}
            errorText={getErrorMessage(fields.employee.phoneNumber.name)}
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
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading2`)}>
        <$GridCell $colSpan={8}>
          <SelectionGroup
            id={fields.paySubsidyGranted.name}
            label={fields.paySubsidyGranted.label}
            direction="vertical"
            required
            errorText={getErrorMessage(fields.paySubsidyGranted.name)}
          >
            <$RadioButton
              id={`${fields.paySubsidyGranted.name}False`}
              name={fields.paySubsidyGranted.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${fields.paySubsidyGranted.name}.no`
              )}
              onBlur={formik.handleBlur}
              onChange={() => {
                formik.setFieldValue(fields.paySubsidyGranted.name, false);
                formik.setFieldValue(
                  APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM,
                  null
                );
              }}
              checked={formik.values.paySubsidyGranted === false}
            />
            <$RadioButton
              id={`${fields.paySubsidyGranted.name}True`}
              name={fields.paySubsidyGranted.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${fields.paySubsidyGranted.name}.yes`
              )}
              onBlur={formik.handleBlur}
              onChange={() => {
                formik.setFieldValue(fields.paySubsidyGranted.name, true);
              }}
              checked={formik.values.paySubsidyGranted === true}
            />
          </SelectionGroup>
        </$GridCell>
        {formik.values.paySubsidyGranted && (
          <$GridCell
            as={$Grid}
            $colSpan={12}
            css={`
              row-gap: ${theme.spacing.xl};
            `}
          >
            <$GridCell $colSpan={2} $colStart={4}>
              <Select
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore TODO: remove ts-ignore when HDS is fixed
                value={getSelectValue(fields.paySubsidyPercent.name)}
                optionLabelField="label"
                label={fields.paySubsidyPercent.label}
                onChange={(paySubsidyPercent: Option) =>
                  formik.setFieldValue(
                    fields.paySubsidyPercent.name,
                    paySubsidyPercent.value
                  )
                }
                options={subsidyOptions}
                id={fields.paySubsidyPercent.name}
                placeholder={selectLabel}
                invalid={!!getErrorMessage(fields.paySubsidyPercent.name)}
                aria-invalid={!!getErrorMessage(fields.paySubsidyPercent.name)}
                error={getErrorMessage(fields.paySubsidyPercent.name)}
                required
                css={`
                  label {
                    white-space: pre;
                  }
                `}
              />
            </$GridCell>
            <$GridCell $colSpan={2} $colStart={4}>
              <Select
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore TODO: remove ts-ignore when HDS is fixed
                value={getSelectValue(fields.additionalPaySubsidyPercent.name)}
                optionLabelField="label"
                label={fields.additionalPaySubsidyPercent.label}
                onChange={(additionalPaySubsidyPercent: Option) =>
                  formik.setFieldValue(
                    fields.additionalPaySubsidyPercent.name,
                    additionalPaySubsidyPercent.value
                  )
                }
                options={[
                  {
                    label: selectLabel,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore TODO: remove ts-ignore when HDS is fixed
                    value: null,
                  },
                  ...subsidyOptions,
                ]}
                id={fields.additionalPaySubsidyPercent.name}
                placeholder={selectLabel}
                invalid={
                  !!getErrorMessage(fields.additionalPaySubsidyPercent.name)
                }
                aria-invalid={
                  !!getErrorMessage(fields.additionalPaySubsidyPercent.name)
                }
                error={getErrorMessage(fields.additionalPaySubsidyPercent.name)}
                css={`
                  label {
                    white-space: pre;
                  }
                `}
              />
            </$GridCell>
            <$GridCell $colSpan={3} $colStart={4}>
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
            </$GridCell>
          </$GridCell>
        )}
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading3`)}>
        <$GridCell $colSpan={6}>
          <SelectionGroup
            label={fields.benefitType.label}
            id={fields.benefitType.name}
            direction="vertical"
            required
            errorText={getErrorMessage(fields.benefitType.name)}
          >
            <$RadioButton
              id={`${fields.benefitType.name}Employment`}
              name={fields.benefitType.name}
              value={BENEFIT_TYPES.EMPLOYMENT}
              label={t(
                `${translationsBase}.fields.${fields.benefitType.name}.employment`
              )}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              checked={formik.values.benefitType === BENEFIT_TYPES.EMPLOYMENT}
            />
            <$RadioButton
              id={`${fields.benefitType.name}Salary`}
              name={fields.benefitType.name}
              value={BENEFIT_TYPES.SALARY}
              label={t(
                `${translationsBase}.fields.${fields.benefitType.name}.salary`
              )}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              checked={formik.values.benefitType === BENEFIT_TYPES.SALARY}
              disabled={formik.values.paySubsidyGranted !== true}
            />
            <$RadioButton
              id={`${fields.benefitType.name}Commission`}
              name={fields.benefitType.name}
              value={BENEFIT_TYPES.COMMISSION}
              label={t(
                `${translationsBase}.fields.${fields.benefitType.name}.commission`
              )}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              checked={formik.values.benefitType === BENEFIT_TYPES.COMMISSION}
              disabled={formik.values.apprenticeshipProgram === true}
            />
          </SelectionGroup>
        </$GridCell>

        {formik.values.benefitType === BENEFIT_TYPES.SALARY && (
          <$GridCell $colSpan={6}>
            <$Notification
              label={t(`${translationsBase}.notifications.salaryBenefit.label`)}
            >
              {t(`${translationsBase}.notifications.salaryBenefit.content`)}
            </$Notification>
          </$GridCell>
        )}
      </FormSection>

      <FormSection header={t(`${translationsBase}.heading4`)}>
        <$GridCell $colSpan={8}>
          {!formik.values.benefitType
            ? t(`${translationsBase}.messages.selectBenefitType`)
            : t(
                `${translationsBase}.messages.${camelCase(
                  formik.values.benefitType
                )}Selected`
              )}
        </$GridCell>
        <$GridCell $colStart={1} $colSpan={2}>
          <DateInput
            id={fields.startDate.name}
            name={fields.startDate.name}
            label={fields.startDate.label}
            placeholder={fields.startDate.placeholder}
            disabled={!formik.values.benefitType}
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
        <$GridCell $colSpan={2}>
          <DateInput
            id={fields.endDate.name}
            name={fields.endDate.name}
            label={fields.endDate.label}
            placeholder={fields.endDate.placeholder}
            disabled={!formik.values.benefitType || !formik.values.startDate}
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
        {formik.values.benefitType && (
          <$GridCell $colStart={7} $colSpan={6}>
            <$Notification
              label={t(
                `${translationsBase}.notifications.${camelCase(
                  formik.values.benefitType
                )}Selected.label`
              )}
            >
              {t(
                `${translationsBase}.notifications.${camelCase(
                  formik.values.benefitType
                )}Selected.content`
              )}
            </$Notification>
          </$GridCell>
        )}
      </FormSection>
      <FormSection
        paddingBottom
        header={t(
          `${translationsBase}.heading5${
            formik.values.benefitType === BENEFIT_TYPES.COMMISSION
              ? 'Assignment'
              : 'Employment'
          }`
        )}
        tooltip={t(
          `${translationsBase}.tooltips.heading5${
            formik.values.benefitType === BENEFIT_TYPES.COMMISSION
              ? 'Assignment'
              : 'Employment'
          }`
        )}
      >
        {!formik.values.benefitType && (
          <$GridCell $colSpan={8}>
            {t(`${translationsBase}.messages.selectBenefitType`)}
          </$GridCell>
        )}
        {(formik.values.benefitType === BENEFIT_TYPES.EMPLOYMENT ||
          formik.values.benefitType === BENEFIT_TYPES.SALARY) && (
          <>
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
            <$GridCell $colSpan={2}>
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
                value={formatStringFloatValue(
                  formik.values.employee?.workingHours
                )}
                invalid={!!getErrorMessage(fields.employee.workingHours.name)}
                aria-invalid={
                  !!getErrorMessage(fields.employee.workingHours.name)
                }
                errorText={getErrorMessage(fields.employee.workingHours.name)}
                required
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
                value={
                  formik.values.employee?.collectiveBargainingAgreement ?? ''
                }
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
                required
              />
            </$GridCell>

            <$GridCell $colSpan={12}>
              <Heading
                as="h3"
                size="xs"
                header={t(`${translationsBase}.heading5EmploymentSub1`)}
                tooltip={t(
                  `${translationsBase}.tooltips.heading5EmploymentSub1`
                )}
              />
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
                value={formatStringFloatValue(
                  formik.values.employee?.monthlyPay
                )}
                invalid={!!getErrorMessage(fields.employee.monthlyPay.name)}
                aria-invalid={
                  !!getErrorMessage(fields.employee.monthlyPay.name)
                }
                errorText={getErrorMessage(fields.employee.monthlyPay.name)}
                required
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
                aria-invalid={
                  !!getErrorMessage(fields.employee.otherExpenses.name)
                }
                errorText={getErrorMessage(fields.employee.otherExpenses.name)}
                required
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
                aria-invalid={
                  !!getErrorMessage(fields.employee.vacationMoney.name)
                }
                errorText={getErrorMessage(fields.employee.vacationMoney.name)}
                required
              />
            </$GridCell>
          </>
        )}
        {formik.values.benefitType === BENEFIT_TYPES.COMMISSION && (
          <>
            <$GridCell $colSpan={6}>
              <TextInput
                id={fields.employee.commissionDescription.name}
                name={fields.employee.commissionDescription.name}
                label={fields.employee.commissionDescription.label}
                placeholder={fields.employee.commissionDescription.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.employee?.commissionDescription ?? ''}
                invalid={
                  !!getErrorMessage(fields.employee.commissionDescription.name)
                }
                aria-invalid={
                  !!getErrorMessage(fields.employee.commissionDescription.name)
                }
                errorText={getErrorMessage(
                  fields.employee.commissionDescription.name
                )}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={2}>
              <TextInput
                id={fields.employee.commissionAmount.name}
                name={fields.employee.commissionAmount.name}
                label={fields.employee.commissionAmount.label}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formatStringFloatValue(
                  formik.values.employee?.commissionAmount
                )}
                invalid={
                  !!getErrorMessage(fields.employee.commissionAmount.name)
                }
                aria-invalid={
                  !!getErrorMessage(fields.employee.commissionAmount.name)
                }
                errorText={getErrorMessage(
                  fields.employee.commissionAmount.name
                )}
                required
              />
            </$GridCell>
          </>
        )}
      </FormSection>
      <StepperActions
        handleSubmit={handleSubmit}
        handleSave={handleSave}
        handleBack={handleBack}
      />
    </form>
  );
};

export default ApplicationFormStep2;
