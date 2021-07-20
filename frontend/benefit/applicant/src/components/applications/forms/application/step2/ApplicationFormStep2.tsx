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
    erazeCommissionFields,
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
            id={fields.firstName.name}
            name={fields.firstName.name}
            label={fields.firstName.label}
            placeholder={fields.firstName.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstName}
            invalid={!!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME)}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME)
            }
            errorText={getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME)}
            required
          />
          <TextInput
            id={fields.lastName.name}
            name={fields.lastName.name}
            label={fields.lastName.label}
            placeholder={fields.lastName.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lastName}
            invalid={!!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_LAST_NAME)}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_LAST_NAME)
            }
            errorText={getErrorMessage(APPLICATION_FIELDS.EMPLOYEE_LAST_NAME)}
            required
          />
          <TextInput
            id={fields.socialSecurityNumber.name}
            name={fields.socialSecurityNumber.name}
            label={fields.socialSecurityNumber.label}
            placeholder={fields.socialSecurityNumber.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.socialSecurityNumber}
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
            id={fields.phoneNumber.name}
            name={fields.phoneNumber.name}
            label={fields.phoneNumber.label}
            placeholder={fields.phoneNumber.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.phoneNumber}
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
        <FieldLabel value={fields.isLivingInHelsinki.label} required />
        <StyledFormGroup>
          <StyledCheckbox
            id={fields.isLivingInHelsinki.name}
            name={fields.isLivingInHelsinki.name}
            label={fields.isLivingInHelsinki.placeholder}
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
            checked={formik.values.isLivingInHelsinki === true}
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
                  onChange={(val) => erazeCommissionFields(val)}
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
                  onChange={(val) => erazeCommissionFields(val)}
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
                  onChange={(val) => {
                    formik.handleChange(val);
                    formik.setFieldValue(
                      APPLICATION_FIELDS.EMPLOYEE_JOB_TITLE,
                      ''
                    );
                    formik.setFieldValue(
                      APPLICATION_FIELDS.EMPLOYEE_WORKING_HOURS,
                      ''
                    );
                    formik.setFieldValue(
                      APPLICATION_FIELDS.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT,
                      ''
                    );
                    formik.setFieldValue(
                      APPLICATION_FIELDS.EMPLOYEE_MONTHLY_PAY,
                      ''
                    );
                    formik.setFieldValue(
                      APPLICATION_FIELDS.EMPLOYEE_OTHER_EXPENSES,
                      ''
                    );
                    formik.setFieldValue(
                      APPLICATION_FIELDS.EMPLOYEE_VACATION_MONEY,
                      ''
                    );
                  }}
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
                id={fields.jobTitle.name}
                name={fields.jobTitle.name}
                label={fields.jobTitle.label}
                placeholder={fields.jobTitle.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.jobTitle}
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
                id={fields.workingHours.name}
                name={fields.workingHours.name}
                label={fields.workingHours.label}
                placeholder={fields.workingHours.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.workingHours}
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
                id={fields.collectiveBargainingAgreement.name}
                name={fields.collectiveBargainingAgreement.name}
                label={fields.collectiveBargainingAgreement.label}
                placeholder={fields.collectiveBargainingAgreement.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.collectiveBargainingAgreement}
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
                id={fields.monthlyPay.name}
                name={fields.monthlyPay.name}
                label={fields.monthlyPay.label}
                placeholder={fields.monthlyPay.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.monthlyPay}
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
                id={fields.otherExpenses.name}
                name={fields.otherExpenses.name}
                label={fields.otherExpenses.label}
                placeholder={fields.otherExpenses.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.otherExpenses}
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
                id={fields.vacationMoney.name}
                name={fields.vacationMoney.name}
                label={fields.vacationMoney.label}
                placeholder={fields.vacationMoney.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.vacationMoney}
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
              id={fields.commissionDescription.name}
              name={fields.commissionDescription.name}
              label={fields.commissionDescription.label}
              placeholder={fields.commissionDescription.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.commissionDescription}
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
              id={fields.commissionAmount.name}
              name={fields.commissionAmount.name}
              label={fields.commissionAmount.label}
              placeholder={fields.commissionAmount.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.commissionAmount}
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
