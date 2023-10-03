import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import DeMinimisAid, { SAVE_ACTIONS } from '../page-model/deminimis';
import Step1 from '../page-model/step1';
import Step2 from '../page-model/step2';
import applicantRole from '../roles/company';
import { getBackendDomain, getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

let deMinimis: DeMinimisAid;

fixture('De minimis')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t: TestController) => {
    clearDataToPrintOnFailure(t);
    deMinimis = new DeMinimisAid(t, new Step1(), new Step2());

    await t.useRole(applicantRole);
    await deMinimis.fillMandatoryFields();
    await deMinimis.step1.selectYesDeMinimis();
  });

test('Aid form (errors)', async (t: TestController) => {
  await deMinimis.actions.fillAndLeaveUnfinished(t);
  await deMinimis.actions.fillTooBigAmounts(t);
});

test('Aid form (using continue)', async (t: TestController) => {
  await deMinimis.actions.fillRows(
    t,
    [{ granter: 'One', amount: '1', grantedAt: '1.1.2023' }],
    SAVE_ACTIONS.CONTINUE
  );

  await deMinimis.actions.clearRowsWithSelectNo(t, SAVE_ACTIONS.CONTINUE);

  await deMinimis.actions.fillRows(
    t,
    [
      { granter: 'One', amount: '1', grantedAt: '1.1.2023' },
      { granter: 'Two', amount: '2', grantedAt: '2.2.2023' },
      { granter: 'Three', amount: '3', grantedAt: '3.3.2023' },
    ],
    SAVE_ACTIONS.CONTINUE
  );

  await deMinimis.actions.removeRow(1);
  await deMinimis.actions.saveStep1AndReturn();
  await t.expect(await deMinimis.getRowCount()).eql(2);
});

test('Aid form (save and exit)', async (t: TestController) => {
  await deMinimis.actions.fillRows(
    t,
    [{ granter: 'Four', amount: '4', grantedAt: '4.4.2023' }],
    SAVE_ACTIONS.SAVE_AND_EXIT
  );

  await deMinimis.actions.clearRowsWithSelectNo(t, SAVE_ACTIONS.SAVE_AND_EXIT);

  await deMinimis.actions.fillRows(
    t,
    [
      { granter: 'Five', amount: '5', grantedAt: '5.5.2023' },
      { granter: 'Six', amount: '6', grantedAt: '6.6.2023' },
      { granter: 'Seven', amount: '7', grantedAt: '7.7.2023' },
    ],
    SAVE_ACTIONS.SAVE_AND_EXIT
  );

  await deMinimis.actions.removeRow(1);
  await deMinimis.saveExitAndEdit(t);
  await t.expect(await deMinimis.getRowCount()).eql(2);
});
