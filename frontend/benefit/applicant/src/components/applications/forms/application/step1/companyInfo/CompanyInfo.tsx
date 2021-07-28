import {
  APPLICATION_FIELDS_STEP1,
  ORGANIZATION_TYPES,
} from 'benefit/applicant/constants';
import { Application } from 'benefit/applicant/types/application';
import { FormikProps } from 'formik';
import { SelectionGroup, TextInput } from 'hds-react';
import React from 'react';
import InputMask from 'react-input-mask';
import LoadingSkeleton from 'react-loading-skeleton';
import {
  StyledCheckbox,
  StyledRadioButton,
} from 'shared/components/forms/fields/styled';
import { FieldsDef } from 'shared/components/forms/fields/types';
import FormSection from 'shared/components/forms/section/FormSection';
import { StyledFormGroup } from 'shared/components/forms/section/styled';
import Spacing from 'shared/components/forms/spacing/Spacing';

import {
  StyledAddressContainer,
  StyledCompanyInfoColumn,
  StyledCompanyInfoContainer,
  StyledCompanyInfoRow,
  StyledCompanyInfoSection,
  StyledIBANContainer,
  StyledNotification,
} from './styled';
import useCompanyInfo from './useCompanyInfo';

interface CompanyInfoProps {
  getErrorMessage: (fieldName: string) => string | undefined;
  fields: FieldsDef;
  translationsBase: string;
  formik?: FormikProps<Application>;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({
  getErrorMessage,
  fields,
  translationsBase,
  formik,
}) => {
  const {
    t,
    data,
    isLoading,
    shouldShowSkeleton,
    error,
    erazeAlternativeAddressFields,
  } = useCompanyInfo({
    formik,
  });

  return (
    <FormSection header={t(`${translationsBase}.heading1`)} loading={isLoading}>
      <StyledCompanyInfoContainer>
        <StyledCompanyInfoSection>
          <StyledCompanyInfoColumn>
            {shouldShowSkeleton ? (
              <LoadingSkeleton width="90%" count={2} />
            ) : (
              <>
                <StyledCompanyInfoRow>{data.name}</StyledCompanyInfoRow>
                <StyledCompanyInfoRow>{data.businessId}</StyledCompanyInfoRow>
              </>
            )}
          </StyledCompanyInfoColumn>
          <StyledCompanyInfoColumn>
            {shouldShowSkeleton ? (
              <LoadingSkeleton width="90%" count={2} />
            ) : (
              <>
                <StyledCompanyInfoRow>
                  {data.streetAddress}
                </StyledCompanyInfoRow>
                <StyledCompanyInfoRow>
                  {data.postcode} {data.city}
                </StyledCompanyInfoRow>
              </>
            )}
          </StyledCompanyInfoColumn>
          <StyledCheckbox
            id={fields.useAlternativeAddress.name}
            disabled={isLoading || !!error}
            name={fields.useAlternativeAddress.name}
            label={fields.useAlternativeAddress.label}
            required
            checked={formik?.values.useAlternativeAddress === true}
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP1.USE_ALTERNATIVE_ADDRESS
            )}
            onChange={() => erazeAlternativeAddressFields()}
            onBlur={formik?.handleBlur}
            aria-invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.USE_ALTERNATIVE_ADDRESS
              )
            }
          />
        </StyledCompanyInfoSection>

        <StyledNotification
          label={t(
            `${translationsBase}.notifications.companyInformation.label`
          )}
          type={error ? 'error' : 'info'}
        >
          {error?.message ||
            t(`${translationsBase}.notifications.companyInformation.content`)}
        </StyledNotification>

        {formik?.values.useAlternativeAddress && (
          <StyledAddressContainer>
            <TextInput
              id={fields.alternativeCompanyStreetAddress.name}
              name={fields.alternativeCompanyStreetAddress.name}
              label={fields.alternativeCompanyStreetAddress.label}
              placeholder={fields.alternativeCompanyStreetAddress.placeholder}
              onChange={formik.handleChange}
              value={formik.values.alternativeCompanyStreetAddress}
              invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_STREET_ADDRESS
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_STREET_ADDRESS
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_STREET_ADDRESS
              )}
              required
            />
            <TextInput
              id={fields.alternativeCompanyPostcode.name}
              name={fields.alternativeCompanyPostcode.name}
              label={fields.alternativeCompanyPostcode.label}
              placeholder={fields.alternativeCompanyPostcode.placeholder}
              onChange={formik.handleChange}
              value={formik.values.alternativeCompanyPostcode}
              invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_POSTCODE
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_POSTCODE
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_POSTCODE
              )}
              required
            />
            <TextInput
              id={fields.alternativeCompanyCity.name}
              name={fields.alternativeCompanyCity.name}
              label={fields.alternativeCompanyCity.label}
              placeholder={fields.alternativeCompanyCity.placeholder}
              onChange={formik.handleChange}
              value={formik.values.alternativeCompanyCity}
              invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_CITY
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_CITY
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_CITY
              )}
              required
            />
          </StyledAddressContainer>
        )}

        <StyledIBANContainer>
          <InputMask
            mask={fields.companyBankAccountNumber.mask?.format ?? ''}
            maskChar={null}
            value={formik?.values.companyBankAccountNumber}
            onBlur={formik?.handleBlur}
            onChange={(e) => {
              const initValue = e.target.value;
              const value =
                fields.companyBankAccountNumber.mask?.stripVal(initValue) ??
                initValue;
              return formik?.setFieldValue(
                fields.companyBankAccountNumber.name,
                value
              );
            }}
          >
            {() => (
              <TextInput
                id={fields.companyBankAccountNumber.name}
                name={fields.companyBankAccountNumber.name}
                label={fields.companyBankAccountNumber.label}
                placeholder={fields.companyBankAccountNumber.placeholder}
                invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS_STEP1.COMPANY_BANK_ACCOUNT_NUMBER
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS_STEP1.COMPANY_BANK_ACCOUNT_NUMBER
                  )
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS_STEP1.COMPANY_BANK_ACCOUNT_NUMBER
                )}
                required
              />
            )}
          </InputMask>
        </StyledIBANContainer>
      </StyledCompanyInfoContainer>
      {formik?.values[APPLICATION_FIELDS_STEP1.ORGANIZATION_TYPE] ===
        ORGANIZATION_TYPES.ASSOCIATION && (
        <>
          <Spacing size="l" />
          <StyledFormGroup>
            <SelectionGroup
              label={fields.associationHasBusinessActivities.label}
              tooltipText={t(
                `${translationsBase}.tooltips.${APPLICATION_FIELDS_STEP1.ASSOCIATION_HAS_BUSINESS_ACTIVITIES}`
              )}
              direction="vertical"
              required
              errorText={getErrorMessage(
                APPLICATION_FIELDS_STEP1.ASSOCIATION_HAS_BUSINESS_ACTIVITIES
              )}
            >
              <StyledRadioButton
                id={`${fields.associationHasBusinessActivities.name}False`}
                name={fields.associationHasBusinessActivities.name}
                value="false"
                label={t(
                  `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1.ASSOCIATION_HAS_BUSINESS_ACTIVITIES}.no`
                )}
                onChange={() => {
                  void formik?.setFieldValue(
                    APPLICATION_FIELDS_STEP1.ASSOCIATION_HAS_BUSINESS_ACTIVITIES,
                    false
                  );
                }}
                // 3 states: null (none is selected), true, false
                checked={
                  formik?.values.associationHasBusinessActivities === false
                }
              />
              <StyledRadioButton
                id={`${fields.associationHasBusinessActivities.name}True`}
                name={fields.associationHasBusinessActivities.name}
                value="true"
                label={t(
                  `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1.ASSOCIATION_HAS_BUSINESS_ACTIVITIES}.yes`
                )}
                onChange={() =>
                  formik?.setFieldValue(
                    APPLICATION_FIELDS_STEP1.ASSOCIATION_HAS_BUSINESS_ACTIVITIES,
                    true
                  )
                }
                checked={
                  formik?.values.associationHasBusinessActivities === true
                }
              />
            </SelectionGroup>
          </StyledFormGroup>
        </>
      )}
    </FormSection>
  );
};

export default CompanyInfo;
