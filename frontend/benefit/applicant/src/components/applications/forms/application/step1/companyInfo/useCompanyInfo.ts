import { APPLICATION_FIELDS_STEP1_KEYS } from 'benefit/applicant/constants';
import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import { FormikProps } from 'formik';
import { TFunction } from 'next-i18next';
import React from 'react';
import { Field } from 'shared/components/forms/fields/types';
import isServerSide from 'shared/server/is-server-side';

export type CompanyInfoFields = Pick<
  Record<APPLICATION_FIELDS_STEP1_KEYS, Field>,
  | APPLICATION_FIELDS_STEP1_KEYS.COMPANY_DEPARTMENT
  | APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS
  | APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS
  | APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE
  | APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY
  | APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER
  | APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES
  | APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_IMMEDIATE_MANAGER_CHECK
>;

interface CompanyInfoProps {
  t: TFunction;
  data: {
    name: string;
    streetAddress: string;
    postcode: string;
    city: string;
    businessId: string;
    organizationType: string;
  };
  error: Error | null;
  isLoading: boolean;
  shouldShowSkeleton: boolean;
  clearAlternativeAddressValues: () => void;
}

const useCompanyInfo = (
  fields: CompanyInfoFields,
  formik: FormikProps<Application>
): CompanyInfoProps => {
  const { t } = useTranslation();

  const { setFieldValue } = formik;

  // TODO: replace the hardcoded company ID when auth is implemented
  const { isLoading, error, data } = useCompanyQuery('0877830-0');

  const companyData = {
    name: data?.name ?? '',
    city: data?.city ?? '',
    postcode: data?.postcode ?? '',
    streetAddress: data?.street_address ?? '',
    businessId: data?.business_id ?? '',
    organizationType: data?.organization_type ?? '',
  };

  let formattedData = {
    ...companyData,
    businessId: t('common:applications.sections.company.businessId', {
      businessId: companyData.businessId,
    }),
  };

  if (error)
    formattedData = {
      name: '-',
      streetAddress: '-',
      postcode: '-',
      city: '',
      businessId: '-',
      organizationType: data?.organization_type ?? '',
    };

  const clearAlternativeAddressValues = React.useCallback((): void => {
    void setFieldValue(fields.companyDepartment.name, '');
    void setFieldValue(fields.alternativeCompanyStreetAddress.name, '');
    void setFieldValue(fields.alternativeCompanyPostcode.name, '');
    void setFieldValue(fields.alternativeCompanyCity.name, '');
  }, [
    fields.companyDepartment.name,
    fields.alternativeCompanyStreetAddress.name,
    fields.alternativeCompanyPostcode.name,
    fields.alternativeCompanyCity.name,
    setFieldValue,
  ]);

  return {
    t,
    data: formattedData,
    error,
    isLoading,
    shouldShowSkeleton: isLoading && !isServerSide(),
    clearAlternativeAddressValues,
  };
};

export default useCompanyInfo;
