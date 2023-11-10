import { Headers } from 'shared/types/common';

export const BackendEndpoint = {
  LOGIN: '/oidc/authenticate/',
  OAUTH_LOGIN: '/oauth2/login',
  OAUTH_LOGOUT: '/oauth2/logout',
  LOGOUT: '/oidc/logout/',
  USER: '/oidc/userinfo/',
  USER_ME: 'v1/users/me/',
  USER_OPTIONS: 'v1/users/options/',
  COMPANY: '/v1/company/',
  APPLICATIONS: '/v1/applications/',
  APPLICATIONS_SIMPLIFIED: '/v1/applications/simplified_list/',
  HANDLER_APPLICATIONS: '/v1/handlerapplications/',
  APPROVE_TERMS_OF_SERVICE: '/v1/terms/approve_terms_of_service/',
  HANDLER_APPLICATIONS_SIMPLIFIED: '/v1/handlerapplications/simplified_list/',
  APPLICATION_BATCHES: '/v1/applicationbatches/',
  APPLICANT_PRINT: '/v1/print/',
  SEARCH_ORGANISATION: '/v1/company/search/',
  GET_ORGANISATION: '/v1/company/get/',
} as const;

const singleBatchBase = (id: string): string =>
  `${BackendEndpoint.APPLICATION_BATCHES}${id}/`;
export const HandlerEndpoint = {
  BATCH_APP_ASSIGN: `${BackendEndpoint.APPLICATION_BATCHES}assign_applications/`,
  BATCH_APP_DEASSIGN: (id: string): string =>
    `${singleBatchBase(id)}deassign_applications/`,
  BATCH_STATUS_CHANGE: (id: string): string => `${singleBatchBase(id)}status/`,
  BATCH_DOWNLOAD_PDF_FILES: (id: string): string =>
    `${BackendEndpoint.HANDLER_APPLICATIONS}batch_pdf_files?batch_id=${id}`,
  BATCH_DOWNLOAD_P2P_FILE: (id: string): string =>
    `${BackendEndpoint.HANDLER_APPLICATIONS}batch_p2p_file?batch_id=${id}`,
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getHeaders = (language: string): Headers => ({
  'Accept-Language': language,
});

export const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;
