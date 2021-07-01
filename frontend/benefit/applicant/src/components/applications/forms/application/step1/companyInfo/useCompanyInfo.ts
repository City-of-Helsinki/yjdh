import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import { useTranslation } from 'benefit/applicant/i18n';
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
}

const useCompanyInfo = (): CompanyInfoProps => {
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
    businessId: `Y-tunnus: ${companyData.businessId}`,
  };

  if (error)
    formattedData = {
      name: '-',
      streetAddress: '-',
      postcode: '-',
      city: '',
      businessId: '-',
    };

  return {
    t,
    data: formattedData,
    error,
    isLoading,
    shouldShowSkeleton: isLoading && !isServerSide(),
  };
};

export default useCompanyInfo;
