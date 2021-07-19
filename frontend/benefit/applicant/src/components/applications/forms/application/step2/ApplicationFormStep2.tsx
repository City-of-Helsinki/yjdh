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
import Heading from 'shared/components/forms/heading/Heading';
import FormSection from 'shared/components/forms/section/FormSection';
import { StyledFormGroup } from 'shared/components/forms/section/styled';
import Spacing from 'shared/components/forms/spacing/Spacing';

import {
  StyledCommissionContainer,
  StyledEmployerBasicInfoContainer,
  StyledEmploymentMoneyContainer,
  StyledEmploymentRelationshipContainer,
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
        <StyledEmployerBasicInfoContainer>
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
            id={fields.employeeSocialSecurityNumber.name}
            name={fields.employeeSocialSecurityNumber.name}
            label={fields.employeeSocialSecurityNumber.label}
            placeholder={fields.employeeSocialSecurityNumber.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.employeeSocialSecurityNumber}
            invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS.EMPLOYEE_SOCIAL_SECURITY_NUMBER
              )
            }
            aria-invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS.EMPLOYEE_SOCIAL_SECURITY_NUMBER
              )
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS.EMPLOYEE_SOCIAL_SECURITY_NUMBER
            )}
            required
          />
          <TextInput
            id={fields.employeePhoneNumber.name}
            name={fields.employeePhoneNumber.name}
            label={fields.employeePhoneNumber.label}
            placeholder={fields.employeePhoneNumber.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.employeePhoneNumber}
            invalid={
              !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_PHONE_NUMBER)
            }
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_PHONE_NUMBER)
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS.EMPLOYEE_PHONE_NUMBER
            )}
            required
          />
        </StyledEmployerBasicInfoContainer>
        <Spacing size="m" />
        <FieldLabel value={fields.employeeIsLivingInHelsinki.label} required />
        <StyledFormGroup>
          <StyledCheckbox
            id={fields.employeeIsLivingInHelsinki.name}
            name={fields.employeeIsLivingInHelsinki.name}
            label={fields.employeeIsLivingInHelsinki.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS.EMPLOYEE_IS_LIVING_IN_HELSINKI
              )
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS.EMPLOYEE_IS_LIVING_IN_HELSINKI
            )}
            required
            checked={formik.values.employeeIsLivingInHelsinki === true}
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
                style={{ width: 350 }}
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
                style={{ width: 350 }}
                helper={getErrorMessage(
                  APPLICATION_FIELDS.ADDITIONAL_PAY_SUBSIDY_PERCENT
                )}
                optionLabelField="label"
                label={fields.paySubsidyAdditionalPercent.label}
                onChange={(paySubsidyAdditionalPercent: Option) =>
                  formik.setFieldValue(
                    APPLICATION_FIELDS.ADDITIONAL_PAY_SUBSIDY_PERCENT,
                    paySubsidyAdditionalPercent.value
                  )
                }
                options={subsidyOptions}
                id={fields.paySubsidyAdditionalPercent.name}
                placeholder={t('common:select')}
                invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS.ADDITIONAL_PAY_SUBSIDY_PERCENT
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS.ADDITIONAL_PAY_SUBSIDY_PERCENT
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
          <>{t(`${translationsBase}.messages.selectBenefitType`)}</>
        )}
        {(formik.values.benefitType === BENEFIT_TYPES.EMPLOYMENT ||
          formik.values.benefitType === BENEFIT_TYPES.SALARY) && (
          <>
            <StyledEmploymentRelationshipContainer>
              <TextInput
                id={fields.employeeJobTitle.name}
                name={fields.employeeJobTitle.name}
                label={fields.employeeJobTitle.label}
                placeholder={fields.employeeJobTitle.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.employeeJobTitle}
                invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_JOB_TITLE)
                }
                aria-invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_JOB_TITLE)
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS.EMPLOYEE_JOB_TITLE
                )}
                required
              />
              <TextInput
                id={fields.employeeWorkingHours.name}
                name={fields.employeeWorkingHours.name}
                label={fields.employeeWorkingHours.label}
                placeholder={fields.employeeWorkingHours.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.employeeWorkingHours}
                invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_WORKING_HOURS)
                }
                aria-invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_WORKING_HOURS)
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS.EMPLOYEE_WORKING_HOURS
                )}
                required
              />
              <TextInput
                id={fields.employeeCollectiveBargainingAgreement.name}
                name={fields.employeeCollectiveBargainingAgreement.name}
                label={fields.employeeCollectiveBargainingAgreement.label}
                placeholder={
                  fields.employeeCollectiveBargainingAgreement.placeholder
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.employeeCollectiveBargainingAgreement}
                invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT
                  )
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT
                )}
                required
              />
            </StyledEmploymentRelationshipContainer>
            <Spacing size="s" />
            <Heading
              size="xs"
              header={t(`${translationsBase}.heading5EmploymentSub1`)}
              tooltip={t(`${translationsBase}.tooltips.heading5EmploymentSub1`)}
            />
            <StyledEmploymentMoneyContainer>
              <TextInput
                id={fields.employeeMonthlyPay.name}
                name={fields.employeeMonthlyPay.name}
                label={fields.employeeMonthlyPay.label}
                placeholder={fields.employeeMonthlyPay.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.employeeMonthlyPay}
                invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_MONTHLY_PAY)
                }
                aria-invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_MONTHLY_PAY)
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS.EMPLOYEE_MONTHLY_PAY
                )}
                required
              />
              <TextInput
                id={fields.employeeOtherExpenses.name}
                name={fields.employeeOtherExpenses.name}
                label={fields.employeeOtherExpenses.label}
                placeholder={fields.employeeOtherExpenses.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.employeeOtherExpenses}
                invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_OTHER_EXPENSES)
                }
                aria-invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_OTHER_EXPENSES)
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS.EMPLOYEE_OTHER_EXPENSES
                )}
                required
              />
              <TextInput
                id={fields.employeeVacationMoney.name}
                name={fields.employeeVacationMoney.name}
                label={fields.employeeVacationMoney.label}
                placeholder={fields.employeeVacationMoney.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.employeeVacationMoney}
                invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_VACATION_MONEY)
                }
                aria-invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_VACATION_MONEY)
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS.EMPLOYEE_VACATION_MONEY
                )}
                required
              />
            </StyledEmploymentMoneyContainer>
          </>
        )}
        {formik.values.benefitType === BENEFIT_TYPES.COMMISSION && (
          <StyledCommissionContainer>
            <TextInput
              id={fields.employeeCommissionDescription.name}
              name={fields.employeeCommissionDescription.name}
              label={fields.employeeCommissionDescription.label}
              placeholder={fields.employeeCommissionDescription.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employeeCommissionDescription}
              invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS.EMPLOYEE_COMMISSION_DESCRIPTION
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS.EMPLOYEE_COMMISSION_DESCRIPTION
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS.EMPLOYEE_COMMISSION_DESCRIPTION
              )}
              required
            />
            <TextInput
              id={fields.employeeCommissionAmount.name}
              name={fields.employeeCommissionAmount.name}
              label={fields.employeeCommissionAmount.label}
              placeholder={fields.employeeCommissionAmount.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employeeCommissionAmount}
              invalid={
                !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_COMMISSION_AMOUNT)
              }
              aria-invalid={
                !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_COMMISSION_AMOUNT)
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS.EMPLOYEE_COMMISSION_AMOUNT
              )}
              required
            />
          </StyledCommissionContainer>
        )}
      </FormSection>
      {actions}
    </form>
  );
};

export default ApplicationFormStep2;
