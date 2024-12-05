import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import {
  DECISION_RANGE,
  SUBSIDY_IN_EFFECT,
} from '../components/applicationsArchive/useApplicationsArchive';
import { SearchResponse } from '../types/search';

const useSearchApplicationQuery = (
  q: string,
  archived = false,
  includeArchivalApplications = false,
  subsidyInEffect?: SUBSIDY_IN_EFFECT,
  decisionRange?: DECISION_RANGE,
  applicationNum?: string,
  loadAll = false
): UseMutationResult<SearchResponse, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const params: {
    q: string;
    archived?: string;
    archival?: string;
    subsidy_in_effect?: SUBSIDY_IN_EFFECT;
    years_since_decision?: DECISION_RANGE;
    app_no?: string;
    load_all?: string;
  } = {
    q,
    ...(archived && { archived: '1' }),
    ...(includeArchivalApplications && { archival: '1' }),
    ...(subsidyInEffect && { subsidy_in_effect: subsidyInEffect }),
    ...(decisionRange && { years_since_decision: decisionRange }),
    ...(loadAll && { load_all: '1' }),
  };

  if (applicationNum) {
    params.app_no = applicationNum;
  }

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };
  return useMutation<SearchResponse, Error>(
    ['applicationsList'],
    async () => {
      const res = axios.get<SearchResponse>(`${BackendEndpoint.SEARCH}`, {
        params,
      });
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    }
  );
};

export default useSearchApplicationQuery;
