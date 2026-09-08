import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';

export const expectToGetJobTypesFromBackend = (): nock.Scope =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (nock(getBackendDomain()) as any)
    .persist()
    .get(BackendEndpoint.JOB_TYPES)
    .reply(
      200,
      [
        { id: 'administration', name: 'Hallinto- ja toimistotyö' },
        { id: 'sports_and_leisure', name: 'Liikunta ja vapaa-aika' },
        { id: 'sales', name: 'Myynti- ja kaupan ala' },
      ],
      { 'Access-Control-Allow-Origin': '*' }
    );
