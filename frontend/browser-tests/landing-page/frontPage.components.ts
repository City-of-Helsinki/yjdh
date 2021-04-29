/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import TestController from 'testcafe';

import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '../utils/testcafe.utils';

export const getFrontPageComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const header = async () => {
    const withinHeader = () =>
      within(screen.getByRole('heading', {
        name: /kesaseteli/i
      }));

    await t
      .expect(screen.findByRole('heading', {
        name: /kesaseteli/i
      }))
      .ok(await getErrorMessage(t));

    const selectors = {
    };
    const expectations = {
    };
    const actions = {
    };
    return {
      selectors,
      expectations,
      actions,
    };
  };
  return {
    header,
  };
};
