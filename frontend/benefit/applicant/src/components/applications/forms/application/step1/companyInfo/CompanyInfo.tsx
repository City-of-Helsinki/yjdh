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
  $Checkbox,
  $RadioButton,
} from 'shared/components/forms/fields/Fields.sc';
import { FieldsDef } from 'shared/components/forms/fields/types';
import FormSection from 'shared/components/forms/section/FormSection';
import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import Spacing from 'shared/components/forms/spacing/Spacing';

import {
  $AddressContainer,
  $CompanyInfoColumn,
  $CompanyInfoContainer,
  $CompanyInfoRow,
  $CompanyInfoSection,
  $IBANContainer,
  $Notification,
} from './CompanyInfo.sc';
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
      <$CompanyInfoContainer>
        <$CompanyInfoSection>
          <$CompanyInfoColumn>
            {shouldShowSkeleton ? (
              <LoadingSkeleton width="90%" count={2} />
            ) : (
              <>
                <$CompanyInfoRow>{data.name}</$CompanyInfoRow>
                <$CompanyInfoRow>{data.businessId}</$CompanyInfoRow>
              </>
            )}
          </$CompanyInfoColumn>
          <$CompanyInfoColumn>
            {shouldShowSkeleton ? (
              <LoadingSkeleton width="90%" count={2} />
            ) : (
              <>
                <$CompanyInfoRow>{data.streetAddress}</$CompanyInfoRow>
                <$CompanyInfoRow>
                  {data.postcode} {data.city}
                </$CompanyInfoRow>
              </>
            )}
          </$CompanyInfoColumn>
          <$Checkbox
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
        </$CompanyInfoSection>

        <$Notification
          label={t(
            `${translationsBase}.notifications.companyInformation.label`
          )}
          type={error ? 'error' : 'info'}
        >
          {error?.message ||
            t(`${translationsBase}.notifications.companyInformation.content`)}
        </$Notification>

        {formik?.values.useAlternativeAddress && (
          <$AddressContainer>
            <TextInput
              id={fields.alternativeCompanyStreetAddress.name}
              name={fields.alternativeCompanyStreetAddress.name}
              label={fields.alternativeCompanyStreetAddress.label}
              placeholder={fields.alternativeCompanyStreetAddress.placeholder}
              onBlur={formik.handleBlur}
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
              onBlur={formik.handleBlur}
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
              onBlur={formik.handleBlur}
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
          </$AddressContainer>
        )}

        <$IBANContainer>
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
        </$IBANContainer>
      </$CompanyInfoContainer>
      {formik?.values[APPLICATION_FIELDS_STEP1.ORGANIZATION_TYPE] ===
        ORGANIZATION_TYPES.ASSOCIATION && (
        <>
          <Spacing size="l" />
          <$FormGroup>
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
              <$RadioButton
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
              <$RadioButton
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
          </$FormGroup>
        </>
      )}
    </FormSection>
  );
};

export default CompanyInfo;
