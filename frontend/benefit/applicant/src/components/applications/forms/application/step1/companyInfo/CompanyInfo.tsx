import { useDependentFieldsEffect } from 'benefit/applicant/hooks/useDependentFieldsEffect';
import { translateBackendErrorMessage } from 'benefit/applicant/utils/common';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import { IconCheckCircleFill, SelectionGroup, TextInput } from 'hds-react';
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

import {
  $CompanyInfoLabel,
  $CompanyInfoRow,
  $CompanyInfoValue,
  $HintText,
} from './CompanyInfo.sc';
import useCompanyInfo, { CompanyInfoFields } from './useCompanyInfo';

export interface CompanyInfoProps {
  getErrorMessage: (fieldName: string) => string | undefined;
  fields: CompanyInfoFields;
  translationsBase: string;
  formik: FormikProps<Partial<Application>>;
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

  return (
    <FormSection
      headerLevel="h2"
      header={t(`${translationsBase}.heading1`)}
      loading={isLoading}
    >
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={6}>
            {shouldShowSkeleton ? (
              <LoadingSkeleton width="90%" count={2} />
            ) : (
              <dl>
                <$CompanyInfoRow>
                  <$CompanyInfoLabel>
                    {t(`${translationsBase}.fields.companyName`)}
                  </$CompanyInfoLabel>
                  <$CompanyInfoValue>
                    {data.name}
                    <IconCheckCircleFill
                      color="var(--color-tram)"
                      aria-hidden="true"
                      aria-label="check"
                    />
                  </$CompanyInfoValue>
                </$CompanyInfoRow>
                <$CompanyInfoRow>
                  <$CompanyInfoLabel>
                    {t(`${translationsBase}.fields.companyBusinessId`)}
                  </$CompanyInfoLabel>
                  <$CompanyInfoValue>
                    {data.businessId}
                    <IconCheckCircleFill
                      color="var(--color-tram)"
                      aria-hidden="true"
                      aria-label="check"
                    />
                  </$CompanyInfoValue>
                </$CompanyInfoRow>
                <$CompanyInfoRow>
                  <$CompanyInfoLabel>
                    {t(`${translationsBase}.fields.companyAddress`)}
                  </$CompanyInfoLabel>
                  <$CompanyInfoValue>
                    {data.streetAddress}
                    <IconCheckCircleFill
                      color="var(--color-tram)"
                      aria-hidden="true"
                      aria-label="check"
                    />
                  </$CompanyInfoValue>
                </$CompanyInfoRow>
                <$CompanyInfoRow>
                  <$CompanyInfoLabel>
                    {t(`${translationsBase}.fields.companyPostcode`)}
                  </$CompanyInfoLabel>
                  <$CompanyInfoValue>
                    {data.postcode}
                    <IconCheckCircleFill
                      color="var(--color-tram)"
                      aria-hidden="true"
                      aria-label="check"
                    />
                  </$CompanyInfoValue>
                </$CompanyInfoRow>
                <$CompanyInfoRow>
                  <$CompanyInfoLabel>
                    {t(`${translationsBase}.fields.companyCity`)}
                  </$CompanyInfoLabel>
                  <$CompanyInfoValue>
                    {data.city}
                    <IconCheckCircleFill
                      color="var(--color-tram)"
                      aria-hidden="true"
                      aria-label="check"
                    />
                  </$CompanyInfoValue>
                </$CompanyInfoRow>
              </dl>
            )}
          </$GridCell>
          <$GridCell $colSpan={8}>
            {error?.message && translateBackendErrorMessage(t, error) ? (
              translateBackendErrorMessage(t, error)
            ) : (
              <$HintText>
                <IconCheckCircleFill
                  color="var(--color-tram)"
                  aria-hidden="true"
                  aria-label="check"
                />
                {t(
                  `${translationsBase}.notifications.companyInformation.content`
                )}
              </$HintText>
            )}
          </$GridCell>
          <$GridCell $colSpan={6}>
            <$Checkbox
              id={fields.useAlternativeAddress.name}
              disabled={isLoading || !!error}
              name={fields.useAlternativeAddress.name}
              label={fields.useAlternativeAddress.label}
              checked={formik.values.useAlternativeAddress === true}
              errorText={getErrorMessage(fields.useAlternativeAddress.name)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={
                !!getErrorMessage(fields.useAlternativeAddress.name)
              }
            />
          </$GridCell>
          {formik.values.useAlternativeAddress && (
            <$GridCell
              as={$Grid}
              $colSpan={12}
              css={`
                margin-top: ${theme.spacing.l};
              `}
            >
              <$GridCell $colSpan={4}>
                <TextInput
                  id={fields.companyDepartment.name}
                  name={fields.companyDepartment.name}
                  label={fields.companyDepartment.label}
                  placeholder={fields.companyDepartment.placeholder}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.companyDepartment}
                  invalid={!!getErrorMessage(fields.companyDepartment.name)}
                  aria-invalid={
                    !!getErrorMessage(fields.companyDepartment.name)
                  }
                  errorText={getErrorMessage(fields.companyDepartment.name)}
                />
              </$GridCell>
              <$GridCell $colStart={1} $colSpan={4}>
                <TextInput
                  id={fields.alternativeCompanyStreetAddress.name}
                  name={fields.alternativeCompanyStreetAddress.name}
                  label={fields.alternativeCompanyStreetAddress.label}
                  placeholder={
                    fields.alternativeCompanyStreetAddress.placeholder
                  }
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.alternativeCompanyStreetAddress}
                  invalid={
                    !!getErrorMessage(
                      fields.alternativeCompanyStreetAddress.name
                    )
                  }
                  aria-invalid={
                    !!getErrorMessage(
                      fields.alternativeCompanyStreetAddress.name
                    )
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
                  invalid={
                    !!getErrorMessage(fields.alternativeCompanyCity.name)
                  }
                  aria-invalid={
                    !!getErrorMessage(fields.alternativeCompanyCity.name)
                  }
                  errorText={getErrorMessage(
                    fields.alternativeCompanyCity.name
                  )}
                  required
                />
              </$GridCell>
            </$GridCell>
          )}
        </$GridCell>

        <$GridCell $colSpan={4}>
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
                invalid={
                  !!getErrorMessage(fields.companyBankAccountNumber.name)
                }
                aria-invalid={
                  !!getErrorMessage(fields.companyBankAccountNumber.name)
                }
                errorText={getErrorMessage(
                  fields.companyBankAccountNumber.name
                )}
                required
                helperText={t(
                  `${translationsBase}.fields.companyBankAccountNumber.placeholder`
                )}
              />
            )}
          </InputMask>
        </$GridCell>
        {data.organizationType.toLowerCase() ===
          ORGANIZATION_TYPES.ASSOCIATION.toLowerCase() && (
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
                checked={
                  formik.values.associationHasBusinessActivities === false
                }
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
                checked={
                  formik.values.associationHasBusinessActivities === true
                }
              />
            </SelectionGroup>
          </$GridCell>
        )}
      </$GridCell>
    </FormSection>
  );
};

export default CompanyInfo;
