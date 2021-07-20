import { APPLICATION_FIELDS } from 'benefit/applicant/constants';
import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { FormFieldsStep1 } from 'benefit/applicant/types/application';
import { FormikProps } from 'formik';
import { TFunction } from 'next-i18next';
import { ChangeEvent } from 'react';
import isServerSide from 'shared/server/is-server-side';

interface CompanyInfoArgs {
  formik?: FormikProps<FormFieldsStep1>;
}

interface CompanyInfoProps {
  t: TFunction;
  data: {
    name: string;
    streetAddress: string;
    postcode: string;
    city: string;
    businessId: string;
  };
  error: Error | null;
  isLoading: boolean;
  shouldShowSkeleton: boolean;
  erazeAlternativeAddressFields: (e: ChangeEvent<HTMLInputElement>) => void;
}

const useCompanyInfo = ({ formik }: CompanyInfoArgs): CompanyInfoProps => {
  const { t } = useTranslation();
  // TODO: replace the hardcoded company ID when auth is implemented
  const { isLoading, error, data } = useCompanyQuery('0877830-0');

  const companyData = {
    name: data?.name ?? '',
    city: data?.city ?? '',
    postcode: data?.postcode ?? '',
    streetAddress: data?.street_address ?? '',
    businessId: data?.business_id ?? '',
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
    };

  const erazeAlternativeAddressFields = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    void formik?.handleChange(e.target.value);
    void formik?.setFieldValue(
      APPLICATION_FIELDS.ALTERNATIVE_COMPANY_STREET_ADDRESS,
      ''
    );
    void formik?.setFieldValue(
      APPLICATION_FIELDS.ALTERNATIVE_COMPANY_POSTCODE,
      ''
    );
    void formik?.setFieldValue(APPLICATION_FIELDS.ALTERNATIVE_COMPANY_CITY, '');
  };

  return {
    t,
    data: formattedData,
    error,
    isLoading,
    shouldShowSkeleton: isLoading && !isServerSide(),
    erazeAlternativeAddressFields,
  };
};

export default useCompanyInfo;
