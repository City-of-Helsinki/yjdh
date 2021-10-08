import { ORGANIZATION_TYPES } from 'benefit/applicant/constants';
import { useDependentFieldsEffect } from 'benefit/applicant/hooks/useDependentFieldsEffect';
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
import FormSection from 'shared/components/forms/section/FormSection';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import { $CompanyInfoRow, $Notification } from './CompanyInfo.sc';
import useCompanyInfo, { CompanyInfoFields } from './useCompanyInfo';

export interface CompanyInfoProps {
  getErrorMessage: (fieldName: string) => string | undefined;
  fields: CompanyInfoFields;
  translationsBase: string;
  formik: FormikProps<Application>;
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
  } = useCompanyInfo(fields, formik);

  useDependentFieldsEffect(
    {
      useAlternativeAddress: formik.values.useAlternativeAddress,
    },
    {
      isFormDirty: formik.dirty,
      clearAlternativeAddressValues,
    }
  );

  const theme = useTheme();

  console.log('formik.values.organizationType', formik.values);
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
          checked={formik.values.useAlternativeAddress === true}
          errorText={getErrorMessage(fields.useAlternativeAddress.name)}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={!!getErrorMessage(fields.useAlternativeAddress.name)}
        />
      </$GridCell>
      {formik.values.useAlternativeAddress && (
        <$GridCell
          as={$Grid}
          $colSpan={12}
          css={`
            margin-bottom: ${theme.spacing.l};
          `}
        >
          <$GridCell
            $colSpan={4}
            css={`
              margin-bottom: ${theme.spacing.l};
            `}
          >
            <TextInput
              id={fields.companyDepartment.name}
              name={fields.companyDepartment.name}
              label={fields.companyDepartment.label}
              placeholder={fields.companyDepartment.placeholder}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.companyDepartment}
              invalid={!!getErrorMessage(fields.companyDepartment.name)}
              aria-invalid={!!getErrorMessage(fields.companyDepartment.name)}
              errorText={getErrorMessage(fields.companyDepartment.name)}
            />
          </$GridCell>
          <$GridCell $colStart={1} $colSpan={4}>
            <TextInput
              id={fields.alternativeCompanyStreetAddress.name}
              name={fields.alternativeCompanyStreetAddress.name}
              label={fields.alternativeCompanyStreetAddress.label}
              placeholder={fields.alternativeCompanyStreetAddress.placeholder}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.alternativeCompanyStreetAddress}
              invalid={
                !!getErrorMessage(fields.alternativeCompanyStreetAddress.name)
              }
              aria-invalid={
                !!getErrorMessage(fields.alternativeCompanyStreetAddress.name)
              }
              errorText={getErrorMessage(
                fields.alternativeCompanyStreetAddress.name
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
                !!getErrorMessage(fields.alternativeCompanyPostcode.name)
              }
              aria-invalid={
                !!getErrorMessage(fields.alternativeCompanyPostcode.name)
              }
              errorText={getErrorMessage(
                fields.alternativeCompanyPostcode.name
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
              invalid={!!getErrorMessage(fields.alternativeCompanyCity.name)}
              aria-invalid={
                !!getErrorMessage(fields.alternativeCompanyCity.name)
              }
              errorText={getErrorMessage(fields.alternativeCompanyCity.name)}
              required
            />
          </$GridCell>
        </$GridCell>
      )}

      <$GridCell $colSpan={3}>
        <InputMask
          mask={fields.companyBankAccountNumber.mask?.format ?? ''}
          maskChar={null}
          value={formik.values.companyBankAccountNumber}
          onBlur={formik.handleBlur}
          onChange={(e) => {
            const initValue = e.target.value;
            const value =
              fields.companyBankAccountNumber.mask?.stripVal(initValue) ??
              initValue;
            return formik.setFieldValue(
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
              invalid={!!getErrorMessage(fields.companyBankAccountNumber.name)}
              aria-invalid={
                !!getErrorMessage(fields.companyBankAccountNumber.name)
              }
              errorText={getErrorMessage(fields.companyBankAccountNumber.name)}
              required
            />
          )}
        </InputMask>
      </$GridCell>
      {formik.values.organizationType === ORGANIZATION_TYPES.ASSOCIATION && (
        <$GridCell $colSpan={8} $colStart={1}>
          <SelectionGroup
            label={fields.associationHasBusinessActivities.label}
            tooltipText={t(
              `${translationsBase}.tooltips.${fields.associationHasBusinessActivities.name}`
            )}
            direction="vertical"
            required
            errorText={getErrorMessage(
              fields.associationHasBusinessActivities.name
            )}
          >
            <$RadioButton
              id={`${fields.associationHasBusinessActivities.name}False`}
              name={fields.associationHasBusinessActivities.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${fields.associationHasBusinessActivities.name}.no`
              )}
              onChange={() => {
                void formik.setFieldValue(
                  fields.associationHasBusinessActivities.name,
                  false
                );
              }}
              // 3 states: null (none is selected), true, false
              checked={formik.values.associationHasBusinessActivities === false}
            />
            <$RadioButton
              id={`${fields.associationHasBusinessActivities.name}True`}
              name={fields.associationHasBusinessActivities.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${fields.associationHasBusinessActivities.name}.yes`
              )}
              onChange={() =>
                formik.setFieldValue(
                  fields.associationHasBusinessActivities.name,
                  true
                )
              }
              checked={formik.values.associationHasBusinessActivities === true}
            />
          </SelectionGroup>
        </$GridCell>
      )}
    </FormSection>
  );
};

export default CompanyInfo;
