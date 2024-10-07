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
  APPLICATION_ALTERATION: '/v1/applicationalterations/',
  HANDLER_APPLICATION_ALTERATION: '/v1/handlerapplicationalterations/',
  HANDLER_APPLICATION_ALTERATION_UPDATE_WITH_CSV:
    'v1/handlerapplicationalterations/update_with_csv/',
  DECISION_PROPOSAL_TEMPLATE: 'v1/decision-proposal-sections/',
  DECISION_PROPOSAL_DRAFT: 'v1/decision-proposal-drafts/',
  SEARCH: 'v1/search/',
  APPLICATIONS_WITH_UNREAD_MESSAGES:
    'v1/handlerapplications/with_unread_messages/',
  AHJO_SETTINGS: 'v1/ahjosettings/decision-maker/',
  APPLICATIONS_CLONE_AS_DRAFT: 'v1/applications/clone_as_draft/',
  APPLICATIONS_CLONE_LATEST: 'v1/applications/clone_latest/',
  HANDLER_APPLICATIONS_CLONE_AS_DRAFT: 'v1/handlerapplications/clone_as_draft/',
} as const;

const batchBase = (id: string): string =>
  `${BackendEndpoint.APPLICATION_BATCHES}${id}/`;

const handlerApplicationsBase = (id: string): string =>
  `${BackendEndpoint.HANDLER_APPLICATIONS}${id}/`;

export const HandlerEndpoint = {
  BATCH_APP_ASSIGN: `${BackendEndpoint.APPLICATION_BATCHES}assign_applications/`,
  BATCH_APP_DEASSIGN: (id: string): string =>
    `${batchBase(id)}deassign_applications/`,
  BATCH_STATUS_CHANGE: (id: string): string => `${batchBase(id)}status/`,
  BATCH_DOWNLOAD_PDF_FILES: (id: string): string =>
    `${BackendEndpoint.HANDLER_APPLICATIONS}batch_pdf_files?batch_id=${id}`,
  BATCH_DOWNLOAD_P2P_FILE: (id: string): string =>
    `${BackendEndpoint.HANDLER_APPLICATIONS}batch_p2p_file?batch_id=${id}`,
  HANDLER_APPLICATIONS_CLONE_AS_DRAFT: (id: string) =>
    `${handlerApplicationsBase(id)}clone_as_draft/`,
} as const;

const applicationsBase = (id: string): string =>
  `${BackendEndpoint.APPLICATIONS}${id}/`;

export const ApplicantEndpoint = {
  APPLICATIONS_CLONE_AS_DRAFT: (id: string) =>
    `${applicationsBase(id)}clone_as_draft/`,
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
