import { APPLICATION_FIELDS_STEP1_KEYS } from 'benefit/applicant/constants';
import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import { FormikProps } from 'formik';
import { TFunction } from 'next-i18next';
import isServerSide from 'shared/server/is-server-side';

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
  clearAlternativeAddressValues: () => void;
}

const useCompanyInfo = (
  formik?: FormikProps<Application>
): CompanyInfoProps => {
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

  const clearAlternativeAddressValues = (): void => {
    void formik?.setFieldValue(
      APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS,
      !formik.values.useAlternativeAddress
    );
    void formik?.setFieldValue(
      APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS,
      ''
    );
    void formik?.setFieldValue(
      APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE,
      ''
    );
    void formik?.setFieldValue(
      APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY,
      ''
    );
  };

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
