import {
  APPLICATION_FIELDS_STEP2,
  BENEFIT_TYPES,
} from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { Notification, Select, SelectionGroup, TextInput } from 'hds-react';
import camelCase from 'lodash/camelCase';
import React, { useEffect } from 'react';
import FieldLabel from 'shared/components/forms/fields/fieldLabel/FieldLabel';
import {
  $Checkbox,
  $RadioButton,
} from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import Heading from 'shared/components/forms/heading/Heading';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { phoneToLocal } from 'shared/utils/string.utils';

import StepperActions from '../stepperActions/StepperActions';
import { useApplicationFormStep2 } from './useApplicationFormStep2';

const ApplicationFormStep2: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const {
    t,
    handleSubmitNext,
    handleSubmitBack,
    getErrorMessage,
    erazeCommissionFields,
    getDefaultSelectValue,
    fields,
    translationsBase,
    formik,
    subsidyOptions,
  } = useApplicationFormStep2(data);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <form onSubmit={handleSubmitNext} noValidate>
      <FormSection header={t(`${translationsBase}.heading1`)}>
        <$GridCell $colSpan={3}>
          <TextInput
            id={fields.employee.firstName.name}
            name={fields.employee.firstName.name}
            label={fields.employee.firstName.label}
            placeholder={fields.employee.firstName.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.firstName}
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
            value={formik.values.employee?.lastName}
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
            value={formik.values.employee?.socialSecurityNumber}
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
        <$GridCell $colSpan={6}>
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
            label={fields.paySubsidyGranted.label}
            direction="vertical"
            required
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED
            )}
          >
            <$RadioButton
              id={`${fields.paySubsidyGranted.name}False`}
              name={fields.paySubsidyGranted.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED}.no`
              )}
              onChange={() => {
                formik.setFieldValue(
                  APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED,
                  false
                );
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
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED}.yes`
              )}
              onChange={() => {
                formik.setFieldValue(
                  APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED,
                  true
                );
              }}
              checked={formik.values.paySubsidyGranted === true}
            />
          </SelectionGroup>
        </$GridCell>
        {formik.values.paySubsidyGranted && (
          <>
            <$GridCell $colSpan={2} $colStart={4}>
              <Select
                defaultValue={getDefaultSelectValue(
                  APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_PERCENT
                )}
                helper={getErrorMessage(
                  APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_PERCENT
                )}
                optionLabelField="label"
                label={fields.paySubsidyPercent.label}
                onChange={(paySubsidyPercent: Option) =>
                  formik.setFieldValue(
                    APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_PERCENT,
                    paySubsidyPercent.value
                  )
                }
                options={subsidyOptions}
                id={fields.paySubsidyPercent.name}
                placeholder={t('common:select')}
                invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_PERCENT
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_PERCENT
                  )
                }
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
                defaultValue={getDefaultSelectValue(
                  APPLICATION_FIELDS_STEP2.ADDITIONAL_PAY_SUBSIDY_PERCENT
                )}
                helper={getErrorMessage(
                  APPLICATION_FIELDS_STEP2.ADDITIONAL_PAY_SUBSIDY_PERCENT
                )}
                optionLabelField="label"
                label={fields.additionalPaySubsidyPercent.label}
                onChange={(additionalPaySubsidyPercent: Option) =>
                  formik.setFieldValue(
                    APPLICATION_FIELDS_STEP2.ADDITIONAL_PAY_SUBSIDY_PERCENT,
                    additionalPaySubsidyPercent.value
                  )
                }
                options={subsidyOptions}
                id={fields.additionalPaySubsidyPercent.name}
                placeholder={t('common:select')}
                invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS_STEP2.ADDITIONAL_PAY_SUBSIDY_PERCENT
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS_STEP2.ADDITIONAL_PAY_SUBSIDY_PERCENT
                  )
                }
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
                direction="vertical"
                required
                errorText={getErrorMessage(
                  APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM
                )}
              >
                <$RadioButton
                  id={`${fields.apprenticeshipProgram.name}False`}
                  name={fields.apprenticeshipProgram.name}
                  value="false"
                  label={t(
                    `${translationsBase}.fields.${APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM}.no`
                  )}
                  onChange={() => {
                    formik.setFieldValue(
                      APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM,
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
                    `${translationsBase}.fields.${APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM}.yes`
                  )}
                  onChange={() => {
                    formik.setFieldValue(
                      APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM,
                      true
                    );
                  }}
                  checked={formik.values.apprenticeshipProgram === true}
                />
              </SelectionGroup>
            </$GridCell>
          </>
        )}
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading3`)}>
        <$GridCell $colSpan={6}>
          <SelectionGroup
            label={fields.benefitType.label}
            direction="vertical"
            required
            errorText={getErrorMessage(APPLICATION_FIELDS_STEP2.BENEFIT_TYPE)}
          >
            <$RadioButton
              id={`${fields.benefitType.name}Employment`}
              name={fields.benefitType.name}
              value={BENEFIT_TYPES.EMPLOYMENT}
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP2.BENEFIT_TYPE}.employment`
              )}
              onChange={(val) => erazeCommissionFields(val)}
              checked={formik.values.benefitType === BENEFIT_TYPES.EMPLOYMENT}
            />
            <$RadioButton
              id={`${fields.benefitType.name}Salary`}
              name={fields.benefitType.name}
              value={BENEFIT_TYPES.SALARY}
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP2.BENEFIT_TYPE}.salary`
              )}
              onChange={(val) => erazeCommissionFields(val)}
              checked={formik.values.benefitType === BENEFIT_TYPES.SALARY}
            />
            <$RadioButton
              id={`${fields.benefitType.name}Commission`}
              name={fields.benefitType.name}
              value={BENEFIT_TYPES.COMMISSION}
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP2.BENEFIT_TYPE}.commission`
              )}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldValue(fields.employee.jobTitle.name, '');
                formik.setFieldValue(fields.employee.workingHours.name, '');
                formik.setFieldValue(
                  fields.employee.collectiveBargainingAgreement.name,
                  ''
                );
                formik.setFieldValue(fields.employee.monthlyPay.name, '');
                formik.setFieldValue(fields.employee.otherExpenses.name, '');
                formik.setFieldValue(fields.employee.vacationMoney.name, '');
              }}
              checked={formik.values.benefitType === BENEFIT_TYPES.COMMISSION}
            />
          </SelectionGroup>
        </$GridCell>

        {formik.values.benefitType === BENEFIT_TYPES.SALARY && (
          <$GridCell $colSpan={6}>
            <Notification
              label={t(`${translationsBase}.notifications.salaryBenefit.label`)}
            >
              {t(`${translationsBase}.notifications.salaryBenefit.content`)}
            </Notification>
          </$GridCell>
        )}
      </FormSection>

      <FormSection header={t(`${translationsBase}.heading4`)}>
        {!formik.values.benefitType && (
          <$GridCell $colSpan={8}>
            {t(`${translationsBase}.messages.selectBenefitType`)}
          </$GridCell>
        )}

        <$GridCell $colSpan={8}>
          {formik.values.benefitType &&
            t(
              `${translationsBase}.messages.${camelCase(
                formik.values.benefitType
              )}Selected`
            )}
        </$GridCell>
        <$GridCell $colSpan={6}>todo: datepicker range to implement</$GridCell>

        {formik.values.benefitType && (
          <$GridCell $colSpan={6}>
            <Notification
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
            </Notification>
          </$GridCell>
        )}
      </FormSection>
      <FormSection
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
                value={formik.values.employee?.jobTitle}
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
                placeholder={fields.employee.workingHours.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.employee?.workingHours || ''}
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
                value={formik.values.employee?.collectiveBargainingAgreement}
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
                placeholder={fields.employee.monthlyPay.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.employee?.monthlyPay || ''}
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
                placeholder={fields.employee.otherExpenses.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.employee?.otherExpenses || ''}
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
                placeholder={fields.employee.vacationMoney.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.employee?.vacationMoney || ''}
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
                value={formik.values.employee?.commissionDescription}
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
                placeholder={fields.employee.commissionAmount.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.employee?.commissionAmount}
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
        hasBack
        hasNext
        handleSubmit={handleSubmitNext}
        handleBack={handleSubmitBack}
      />
    </form>
  );
};

export default ApplicationFormStep2;
