import YouthApplication from 'kesaseteli/youth/types/youth-application';
import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';

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
    throw new Error(
      `Not all nock interceptors were used: ${JSON.stringify(
        nock.pendingMocks()
      )}`
    );
  }
  nock.cleanAll();
});
nock.disableNetConnect();

export const expectToSaveYouthApplication = (
  application: Partial<YouthApplication>
): nock.Scope =>
  nock(getBackendDomain())
    .put(`${BackendEndpoint.YOUTH_APPLICATIONS}/`, application)
    .reply(200, application, { 'Access-Control-Allow-Origin': '*' });
