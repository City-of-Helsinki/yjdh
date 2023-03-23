import axios from 'axios';
import { CompanySearchResult } from 'benefit/handler/types/application';
import {
  BackendEndpoint,
  getBackendUrl,
} from 'benefit-shared/backend-api/backend-api';
import { CompanyData } from 'benefit-shared/types/company';

export const searchCompanies = async (
  name: string
): Promise<CompanySearchResult[]> => {
  const res = await axios.get<CompanySearchResult[]>(
    `${getBackendUrl(BackendEndpoint.SEARCH_ORGANISATION)}${name}/`
  );
  return res.data;
};

export const getCompanyData = async (
  businessId: string
): Promise<CompanyData> => {
  const res = await axios.get<CompanyData>(
    `${getBackendUrl(BackendEndpoint.GET_ORGANISATION)}${businessId}/`
  );
  return res.data;
};
