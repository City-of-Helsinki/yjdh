import { AxiosError } from 'axios';
import { APPLICATION_INITIAL_VALUES } from 'benefit/handler/constants';
import useFormActions from 'benefit/handler/hooks/useFormActions';
import { CompanySearchResult } from 'benefit/handler/types/application';
import { FinnishBusinessIds as bId } from 'finnish-business-ids';
import { TFunction, useTranslation } from 'next-i18next';
import { useState } from 'react';

import { getCompanyData, searchCompanies } from './companyApi';

type NotificationText = {
  label: string;
  text: string;
};

type ExtendedComponentProps = {
  getCompany: (searchTerm: string) => void;
  getSuggestions: (searchTerm: string) => Promise<CompanySearchResult[]>;
  t: TFunction;
  translationsBase: string;
  errorMessage: NotificationText | null;
  noResults: NotificationText | null;
  companies: CompanySearchResult[];
  selectedCompany: string | null;
  onCompanyChange: (businessId: string) => void;
  onSelectCompany: () => void;
  isLoading: boolean;
};

const useCompanySearch = (): ExtendedComponentProps => {
  const minSearchTermLength = 3;
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections';
  const [noResults, setNoResults] = useState<NotificationText | null>(null);
  const [errorMessage, setErrorMessage] = useState<NotificationText | null>(
    null
  );
  const [companies, setCompanies] = useState<CompanySearchResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { onCompanySelected } = useFormActions({}, {});

  const onCompanyChange = (businessId: string): void => {
    setSelectedCompany(businessId);
  };

  const createNotification = (
    notification: 'noResults' | 'error'
  ): NotificationText => ({
    label: t(
      `${translationsBase}.companySearch.notifications.${notification}.label`
    ),
    text: t(
      `${translationsBase}.companySearch.notifications.${notification}.text`
    ),
  });

  const filterCompanies = (
    name: string,
    data: CompanySearchResult[]
  ): CompanySearchResult[] =>
    data.filter((company) =>
      company.name.toLowerCase().includes(name.toLowerCase())
    );

  const formatSuggestions = (
    results: CompanySearchResult[]
  ): CompanySearchResult[] =>
    results.map((result) =>
      result.business_id
        ? {
            name: `${result.name} <${result.business_id}>`,
            business_id: result.business_id,
          }
        : { name: result.name, business_id: '' }
    );

  const handleError = (error: AxiosError): void => {
    if (error.message) {
      setErrorMessage({
        label: t(`${translationsBase}.companySearch.notifications.error.label`),
        text: error.message,
      });
    } else {
      setErrorMessage(createNotification('error'));
    }
    setIsLoading(false);
  };

  const getCompanyAndCreateDraft = async (
    businessId: string
  ): Promise<void> => {
    const companyData = await getCompanyData(businessId);
    if (companyData.id) {
      onCompanySelected({
        ...APPLICATION_INITIAL_VALUES,
        createApplicationForCompany: companyData.id,
      }).catch((error: AxiosError) => {
        handleError(error);
      });
    }
  };

  const onSelectCompany = async (): Promise<void> => {
    setIsLoading(true);
    await getCompanyAndCreateDraft(selectedCompany);
    setCompanies([]);
  };

  const getSuggestions = (searchTerm: string): Promise<CompanySearchResult[]> =>
    new Promise((resolve) => {
      if (searchTerm.length < minSearchTermLength) {
        resolve([]);
      } else if (bId.isValidBusinessId(searchTerm)) {
        getCompanyData(searchTerm)
          .then((data) => {
            const dataInArray = [data];
            return resolve(formatSuggestions(dataInArray));
          })
          .catch(() => resolve([]));
      } else {
        searchCompanies(searchTerm)
          .then((data) => {
            const filteredItems = filterCompanies(searchTerm, data);
            return filteredItems.length === 0
              ? resolve([])
              : resolve(formatSuggestions(filteredItems));
          })
          .catch(() => resolve([]));
      }
    });

  const getCompany = async (searchTerm: string): Promise<void> => {
    if (searchTerm.length < minSearchTermLength) return;
    setIsLoading(true);
    setCompanies([]);
    setNoResults(null);
    setErrorMessage(null);
    const newSearchTerm = searchTerm.trimStart().trimEnd();
    const match = /.*<([^<>]*)>$/.exec(newSearchTerm);
    if (match) {
      await getCompanyAndCreateDraft(match[1]);
    } else if (bId.isValidBusinessId(newSearchTerm)) {
      await getCompanyAndCreateDraft(newSearchTerm);
    } else {
      searchCompanies(newSearchTerm)
        .then((data) => {
          if (data.length > 0) {
            setSelectedCompany(data[0].business_id);
            setCompanies(data);
            return setIsLoading(false);
          }
          setNoResults(createNotification('noResults'));
          return setIsLoading(false);
        })
        .catch((error: AxiosError) => {
          handleError(error);
        });
    }
  };

  return {
    getCompany,
    getSuggestions,
    t,
    translationsBase,
    errorMessage,
    noResults,
    companies,
    selectedCompany,
    onCompanyChange,
    onSelectCompany,
    isLoading,
  };
};

export { useCompanySearch };
