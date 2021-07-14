import { APPLICATION_FIELDS, BENEFIT_TYPES } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { Notification, Select, SelectionGroup, TextInput } from 'hds-react';
import camelCase from 'lodash/camelCase';
import * as React from 'react';
import FieldLabel from 'shared/components/forms/fields/fieldLabel/FieldLabel';
import {
  StyledCheckbox,
  StyledRadioButton,
} from 'shared/components/forms/fields/styled';
import { Option } from 'shared/components/forms/fields/types';
import FormSection from 'shared/components/forms/section/FormSection';
import { StyledFormGroup } from 'shared/components/forms/section/styled';
import Spacing from 'shared/components/forms/spacing/Spacing';

import {
  StyledFieildsWithInfoColumn,
  StyledFieildsWithInfoContainer,
  StyledSubSection,
} from '../styled';
import { useApplicationFormStep2 } from './useApplicationFormStep2';

const ApplicationFormStep2: React.FC<DynamicFormStepComponentProps> = ({
  actions,
}) => {
  const {
    t,
    handleSubmit,
    getErrorMessage,
    fields,
    translationsBase,
    formik,
    subsidyOptions,
  } = useApplicationFormStep2();

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection header={t(`${translationsBase}.heading1`)}>
        <StyledFormGroup>
          <TextInput
            id={fields.employeeFirstName.name}
            name={fields.employeeFirstName.name}
            label={fields.employeeFirstName.label}
            placeholder={fields.employeeFirstName.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.employeeFirstName}
            invalid={!!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME)}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME)
            }
            errorText={getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME)}
            required
          />
          <TextInput
            id={fields.employeeLastName.name}
            name={fields.employeeLastName.name}
            label={fields.employeeLastName.label}
            placeholder={fields.employeeLastName.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.employeeLastName}
            invalid={!!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_LAST_NAME)}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_LAST_NAME)
            }
            errorText={getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_LAST_NAME)}
            required
          />
          <TextInput
            id={fields.employeeSsn.name}
            name={fields.employeeSsn.name}
            label={fields.employeeSsn.label}
            placeholder={fields.employeeSsn.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.employeeSsn}
            invalid={!!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_SSN)}
            aria-invalid={!!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_SSN)}
            errorText={getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_SSN)}
            required
          />
          <TextInput
            id={fields.employeePhone.name}
            name={fields.employeePhone.name}
            label={fields.employeePhone.label}
            placeholder={fields.employeePhone.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.employeePhone}
            invalid={!!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_PHONE)}
            aria-invalid={!!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_PHONE)}
            errorText={getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_PHONE)}
            required
          />
        </StyledFormGroup>
        <Spacing size="m" />
        <FieldLabel value={fields.isHelsinkiMunicipality.label} required />
        <StyledFormGroup>
          <StyledCheckbox
            id={fields.isHelsinkiMunicipality.name}
            name={fields.isHelsinkiMunicipality.name}
            label={fields.isHelsinkiMunicipality.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.IS_HELSINKI_MUNICIPALITY)
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS.IS_HELSINKI_MUNICIPALITY
            )}
            required
            checked={formik.values.isHelsinkiMunicipality === true}
          />
        </StyledFormGroup>
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading2`)}>
        <StyledFormGroup>
          <SelectionGroup
            label={fields.paySubsidyGranted.label}
            direction="vertical"
            required
            errorText={getErrorMessage(APPLICATION_FIELDS.PAY_SUBSIDY_GRANTED)}
          >
            <StyledRadioButton
              id={`${fields.paySubsidyGranted.name}False`}
              name={fields.paySubsidyGranted.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS.PAY_SUBSIDY_GRANTED}.no`
              )}
              onChange={(val) => {
                formik.handleChange(val);
                formik.setFieldValue(
                  APPLICATION_FIELDS.APPRENTICESHIP_PROGRAM,
                  ''
                );
              }}
              onBlur={formik.handleBlur}
              checked={formik.values.paySubsidyGranted === 'false'}
            />
            <StyledRadioButton
              id={`${fields.paySubsidyGranted.name}True`}
              name={fields.paySubsidyGranted.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS.PAY_SUBSIDY_GRANTED}.yes`
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.paySubsidyGranted === 'true'}
            />
          </SelectionGroup>
        </StyledFormGroup>
        {formik.values.paySubsidyGranted === 'true' && (
          <StyledSubSection>
            <StyledFormGroup>
              <Select
                helper={getErrorMessage(APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT)}
                optionLabelField="label"
                label={fields.paySubsidyPercent.label}
                onChange={(paySubsidyPercent: Option) =>
                  formik.setFieldValue(
                    APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT,
                    paySubsidyPercent.value
                  )
                }
                options={subsidyOptions}
                id={fields.paySubsidyPercent.name}
                placeholder={t('common:select')}
                invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT)
                }
                aria-invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT)
                }
                required
              />
            </StyledFormGroup>
            <Spacing size="m" />
            <StyledFormGroup>
              <Select
                helper={getErrorMessage(
                  APPLICATION_FIELDS.PAY_SUBSIDY_ADDITIONAL_PERCENT
                )}
                optionLabelField="label"
                label={fields.paySubsidyAdditionalPercent.label}
                onChange={(paySubsidyAdditionalPercent: Option) =>
                  formik.setFieldValue(
                    APPLICATION_FIELDS.PAY_SUBSIDY_ADDITIONAL_PERCENT,
                    paySubsidyAdditionalPercent.value
                  )
                }
                options={subsidyOptions}
                id={fields.paySubsidyAdditionalPercent.name}
                placeholder={t('common:select')}
                invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS.PAY_SUBSIDY_ADDITIONAL_PERCENT
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS.PAY_SUBSIDY_ADDITIONAL_PERCENT
                  )
                }
              />
            </StyledFormGroup>
            <Spacing size="m" />
            <StyledFormGroup>
              <SelectionGroup
                label={fields.apprenticeshipProgram.label}
                direction="vertical"
                required
                errorText={getErrorMessage(
                  APPLICATION_FIELDS.APPRENTICESHIP_PROGRAM
                )}
              >
                <StyledRadioButton
                  id={`${fields.apprenticeshipProgram.name}False`}
                  name={fields.apprenticeshipProgram.name}
                  value="false"
                  label={t(
                    `${translationsBase}.fields.${APPLICATION_FIELDS.APPRENTICESHIP_PROGRAM}.no`
                  )}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.apprenticeshipProgram === 'false'}
                />
                <StyledRadioButton
                  id={`${fields.apprenticeshipProgram.name}True`}
                  name={fields.apprenticeshipProgram.name}
                  value="true"
                  label={t(
                    `${translationsBase}.fields.${APPLICATION_FIELDS.APPRENTICESHIP_PROGRAM}.yes`
                  )}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.apprenticeshipProgram === 'true'}
                />
              </SelectionGroup>
            </StyledFormGroup>
          </StyledSubSection>
        )}
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading3`)}>
        <StyledFieildsWithInfoContainer>
          <StyledFieildsWithInfoColumn>
            <StyledFormGroup>
              <SelectionGroup
                label={fields.benefitType.label}
                direction="vertical"
                required
                errorText={getErrorMessage(APPLICATION_FIELDS.BENEFIT_TYPE)}
              >
                <StyledRadioButton
                  id={`${fields.benefitType.name}Employment`}
                  name={fields.benefitType.name}
                  value={BENEFIT_TYPES.EMPLOYMENT}
                  label={t(
                    `${translationsBase}.fields.${APPLICATION_FIELDS.BENEFIT_TYPE}.employment`
                  )}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={
                    formik.values.benefitType === BENEFIT_TYPES.EMPLOYMENT
                  }
                />
                <StyledRadioButton
                  id={`${fields.benefitType.name}Salary`}
                  name={fields.benefitType.name}
                  value={BENEFIT_TYPES.SALARY}
                  label={t(
                    `${translationsBase}.fields.${APPLICATION_FIELDS.BENEFIT_TYPE}.salary`
                  )}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.benefitType === BENEFIT_TYPES.SALARY}
                />
                <StyledRadioButton
                  id={`${fields.benefitType.name}Commission`}
                  name={fields.benefitType.name}
                  value={BENEFIT_TYPES.COMMISSION}
                  label={t(
                    `${translationsBase}.fields.${APPLICATION_FIELDS.BENEFIT_TYPE}.commission`
                  )}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={
                    formik.values.benefitType === BENEFIT_TYPES.COMMISSION
                  }
                />
              </SelectionGroup>
            </StyledFormGroup>
          </StyledFieildsWithInfoColumn>
          <StyledFieildsWithInfoColumn>
            {formik.values.benefitType === BENEFIT_TYPES.SALARY && (
              <Notification
                label={t(
                  `${translationsBase}.notifications.salaryBenefit.label`
                )}
              >
                {t(`${translationsBase}.notifications.salaryBenefit.content`)}
              </Notification>
            )}
          </StyledFieildsWithInfoColumn>
        </StyledFieildsWithInfoContainer>
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading4`)}>
        {!formik.values.benefitType && (
          <>{t(`${translationsBase}.messages.selectBenefitType`)}</>
        )}
        <StyledFieildsWithInfoContainer>
          <StyledFieildsWithInfoColumn>
            <StyledFormGroup>
              {formik.values.benefitType && (
                <>
                  {t(
                    `${translationsBase}.messages.${camelCase(
                      formik.values.benefitType
                    )}Selected`
                  )}
                </>
              )}
            </StyledFormGroup>
            <StyledFormGroup>
              todo: datepicker range to implement
            </StyledFormGroup>
          </StyledFieildsWithInfoColumn>
          <StyledFieildsWithInfoColumn>
            {formik.values.benefitType && (
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
            )}
          </StyledFieildsWithInfoColumn>
        </StyledFieildsWithInfoContainer>
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading5`)}>
        {!formik.values.benefitType && (
          <>{t(`${translationsBase}.messages.selectBenefitType`)}</>
        )}
      </FormSection>
      {actions}
    </form>
  );
};

export default ApplicationFormStep2;
