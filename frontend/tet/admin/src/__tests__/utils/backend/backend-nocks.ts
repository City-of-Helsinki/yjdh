import { BackendEndpoint, getBackendDomain } from 'tet/admin/backend-api/backend-api';
import nock from 'nock';
import { TetEvents } from 'tet-shared/types/linkedevents';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import { fakeUser } from 'shared/__tests__/utils/fake-objects';

// disable unnecessary axios' expected error messages
// https://stackoverflow.com/questions/44467657/jest-better-way-to-disable-console-inside-unit-tests
let consoleSpy: jest.SpyInstance;
beforeEach(() => {
  // eslint-disable-next-line chai-friendly/no-unused-expressions
  consoleSpy?.mockRestore();
});

afterEach(async () => {
  // avoid situation where some request is still pending but test is completed
  await waitForBackendRequestsToComplete();
  // Check that all nocks are used: https://michaelheap.com/nock-all-mocks-used/
  if (!nock.isDone()) {
    throw new Error(`Not all nock interceptors were used: ${JSON.stringify(nock.pendingMocks())}`);
  }
  nock.cleanAll();
});

nock.disableNetConnect();

export const expectAuthorizedReply = (expectedUser = fakeUser()): nock.Scope =>
  nock(getBackendDomain()).get(BackendEndpoint.USER).reply(200, expectedUser, { 'Access-Control-Allow-Origin': '*' });

export const expectUnauthorizedReply = (): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain()).get(BackendEndpoint.USER).replyWithError('401 Unauthorized');
};

export const expectToGetEventsFromBackend = (events: TetEvents): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.TET_POSTINGS}`)
    .reply(200, events, { 'Access-Control-Allow-Origin': '*' });
