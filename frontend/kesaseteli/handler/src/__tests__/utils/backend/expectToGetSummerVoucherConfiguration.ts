import { fakeTargetGroups } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';

const expectToGetSummerVoucherConfiguration = (): nock.Scope =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (nock(getBackendDomain()) as any)
    .persist()
    .get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION)
    .reply(
      200,
      [
        {
          year: new Date().getFullYear(),
          voucher_value_in_euros: 300,
          min_work_compensation_in_euros: 400,
          min_work_hours: 18,
          target_groups: fakeTargetGroups,
        },
      ],
      { 'Access-Control-Allow-Origin': '*' }
    );

export default expectToGetSummerVoucherConfiguration;
