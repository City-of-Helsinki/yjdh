import {
  APPLICATION_FIELDS_STEP1_KEYS,
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
import { Field } from 'shared/components/forms/fields/types';
import FormSection from 'shared/components/forms/section/FormSection';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import { $CompanyInfoRow, $Notification } from './CompanyInfo.sc';
import useCompanyInfo from './useCompanyInfo';

export type CompanyInfoFields = Pick<
  Record<APPLICATION_FIELDS_STEP1_KEYS, Field>,
  | APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS
  | APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS
  | APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE
  | APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY
  | APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER
  | APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES
>;
export interface CompanyInfoProps {
  getErrorMessage: (fieldName: string) => string | undefined;
  fields: CompanyInfoFields;
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
    clearAlternativeAddressValues,
  } = useCompanyInfo(formik);
  const theme = useTheme();

  return (
    <FormSection header={t(`${translationsBase}.heading1`)} loading={isLoading}>
      <$GridCell $colSpan={3}>
        {shouldShowSkeleton ? (
          <LoadingSkeleton width="90%" count={2} />
        ) : (
          <>
            <$CompanyInfoRow>{data.name}</$CompanyInfoRow>
            <$CompanyInfoRow>{data.businessId}</$CompanyInfoRow>
          </>
        )}
      </$GridCell>
      <$GridCell $colSpan={3}>
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
      </$GridCell>
      <$GridCell $colSpan={6} $rowSpan={2}>
        <$Notification
          label={t(
            `${translationsBase}.notifications.companyInformation.label`
          )}
          type={error ? 'error' : 'info'}
        >
          {error?.message ||
            t(`${translationsBase}.notifications.companyInformation.content`)}
        </$Notification>
      </$GridCell>
      <$GridCell
        $colSpan={6}
        css={`
          margin-bottom: ${theme.spacing.l};
        `}
      >
        <$Checkbox
          id={fields.useAlternativeAddress.name}
          disabled={isLoading || !!error}
          name={fields.useAlternativeAddress.name}
          label={fields.useAlternativeAddress.label}
          required
          checked={formik?.values.useAlternativeAddress === true}
          errorText={getErrorMessage(
            APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS
          )}
          onChange={() => clearAlternativeAddressValues()}
          onBlur={formik?.handleBlur}
          aria-invalid={
            !!getErrorMessage(
              APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS
            )
          }
        />
      </$GridCell>
      {formik?.values.useAlternativeAddress && (
        <$GridCell
          as={$Grid}
          $colSpan={12}
          css={`
            margin-bottom: ${theme.spacing.l};
          `}
        >
          <$GridCell $colSpan={4}>
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
                  APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS
              )}
              required
            />
          </$GridCell>
          <$GridCell $colSpan={2}>
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
                  APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE
              )}
              required
            />
          </$GridCell>
          <$GridCell $colSpan={4}>
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
                  APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY
              )}
              required
            />
          </$GridCell>
        </$GridCell>
      )}

      <$GridCell $colSpan={3}>
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
                  APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER
              )}
              required
            />
          )}
        </InputMask>
      </$GridCell>
      {formik?.values[APPLICATION_FIELDS_STEP1_KEYS.ORGANIZATION_TYPE] ===
        ORGANIZATION_TYPES.ASSOCIATION && (
        <$GridCell $colSpan={8} $colStart={1}>
          <SelectionGroup
            label={fields.associationHasBusinessActivities.label}
            tooltipText={t(
              `${translationsBase}.tooltips.${APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES}`
            )}
            direction="vertical"
            required
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES
            )}
          >
            <$RadioButton
              id={`${fields.associationHasBusinessActivities.name}False`}
              name={fields.associationHasBusinessActivities.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES}.no`
              )}
              onChange={() => {
                void formik?.setFieldValue(
                  APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES,
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
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES}.yes`
              )}
              onChange={() =>
                formik?.setFieldValue(
                  APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES,
                  true
                )
              }
              checked={formik?.values.associationHasBusinessActivities === true}
            />
          </SelectionGroup>
        </$GridCell>
      )}
    </FormSection>
  );
};

export default CompanyInfo;
