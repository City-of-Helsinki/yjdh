import CompleteOperation from 'kesaseteli/handler/types/complete-operation';
import {
  BackendEndpoint,
  getBackendDomain,
  getYouthApplicationQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import nock from 'nock';
import { waitForLoadingCompleted } from 'shared/__tests__/utils/component.utils';
import { waitFor } from 'shared/__tests__/utils/test-utils';

// disable unnecessary axios' expected error messages
// https://stackoverflow.com/questions/44467657/jest-better-way-to-disable-console-inside-unit-tests
let consoleSpy: jest.SpyInstance;
beforeEach(() => {
  // eslint-disable-next-line chai-friendly/no-unused-expressions
  consoleSpy?.mockRestore();
});

export const waitForBackendRequestsToComplete = async (): Promise<void> => {
  await waitForLoadingCompleted();
  const pending = nock
    .pendingMocks()
    .filter((m) => !m.includes(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION));
  if (pending.length > 0) {
    // eslint-disable-next-line no-console
    console.log('pending nocks', pending);
    await waitFor(() => {
      const currentPending = nock
        .pendingMocks()
        .filter(
          (m) => !m.includes(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION)
        );
      expect(currentPending).toHaveLength(0);
    });
  }
};

afterEach(async () => {
  // avoid situation where some request is still pending but test is completed
  await waitForBackendRequestsToComplete();
  nock.cleanAll();
});
nock.disableNetConnect();

export const expectToGetYouthApplication = (
  expectedApplication: CreatedYouthApplication | ActivatedYouthApplication
): nock.Scope =>
  nock(getBackendDomain())
    .get(getYouthApplicationQueryKey(expectedApplication.id))
    .reply(200, expectedApplication, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetYouthApplicationError = (
  id: CreatedYouthApplication['id'],
  errorCode: 400 | 404 | 500
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .get(getYouthApplicationQueryKey(id))
    .reply(
      errorCode,
      'This is a youthapplications backend test error. Please ignore this error message.'
    );
};

export const expectToPatchYouthApplication = (
  operation: CompleteOperation['type'],
  { id, encrypted_handler_vtj_json }: ActivatedYouthApplication
): nock.Scope =>
  nock(getBackendDomain())
    .patch(`${BackendEndpoint.YOUTH_APPLICATIONS}${id}/${operation}/`, {
      encrypted_handler_vtj_json,
    })
    .reply(
      200,
      { status: operation === 'accept' ? 'accepted' : 'rejected' },
      { 'Access-Control-Allow-Origin': '*' }
    );

export const expectToPatchYouthApplicationError = (
  operation: CompleteOperation['type'],
  { id, encrypted_handler_vtj_json }: ActivatedYouthApplication,
  errorCode: 400 | 404 | 500
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .patch(`${BackendEndpoint.YOUTH_APPLICATIONS}${id}/${operation}/`, {
      encrypted_handler_vtj_json,
    })
    .reply(
      errorCode,
      `This is a youthapplications ${operation} backend test error. Please ignore this error message.`
    );
};
