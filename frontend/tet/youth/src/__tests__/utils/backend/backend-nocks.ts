import { BackendEndpoint, linkedEventsUrl } from 'tet/youth/backend-api/backend-api';
import nock from 'nock';
import { LinkedEventsPagedResponse, TetEvent } from 'tet-shared/types/linkedevents';
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
  //await waitForBackendRequestsToComplete();
  // Check that all nocks are used: https://michaelheap.com/nock-all-mocks-used/
  //if (!nock.isDone()) {
  //throw new Error(`Not all nock interceptors were used: ${JSON.stringify(nock.pendingMocks())}`);
  //}
  nock.cleanAll();
});

nock.disableNetConnect();

export const expectToGetEventsPageFromBackend = (events: LinkedEventsPagedResponse<TetEvent>): nock.Scope =>
  nock(linkedEventsUrl)
    .get(`/?include=location,keywords&sort=-name&data_source=tet&show_all=true&page_size=10`)
    .reply(200, events, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetAllEventsFromBackend = (events: LinkedEventsPagedResponse<TetEvent>): nock.Scope =>
  nock(linkedEventsUrl)
    .get(`/?include=location,keywords&sort=-name&data_source=tet&show_all=true&page_size=100`)
    .reply(200, events, { 'Access-Control-Allow-Origin': '*' });

// TODO don't hardcode url
// this is needed when testing the Editor form and can be refactored then
export const expectWorkingMethodsFromLinkedEvents = (): nock.Scope =>
  nock(linkedEventsUrl)
    .get('/keyword_set/tet:wm/?include=keywords')
    .reply(200, { keywords: [] }, { 'Access-Control-Allow-Origin': '*' });

// TODO don't hardcode url
// this is needed when testing the Editor form and can be refactored then
export const expectAttributesFromLinkedEvents = (): nock.Scope =>
  nock(linkedEventsUrl)
    .get('/keyword_set/tet:attr/?include=keywords')
    .reply(200, { keywords: [] }, { 'Access-Control-Allow-Origin': '*' });
