import { screen, within } from '@testing-library/testcafe';
import pretty from 'pretty';
import TestController, { ClientFunction } from 'testcafe';

export const setDataToPrintOnFailure = <V>(
  t: TestController,
  key: string,
  value: V
): void => {
  // eslint-disable-next-line no-param-reassign
  t.ctx[key] = value;
};

const injectCallback = (
  obj: typeof screen | typeof within,
  callback: (...args: unknown[]) => void
): typeof obj =>
  Object.keys(obj)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .filter((key: Key) => typeof obj[key] === 'function')
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: (...params: unknown[]) => {
          callback(key, params);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
          return obj[key](...params);
        },
      }),
      {}
    ) as typeof obj;

export const screenContext = (t: TestController): typeof screen =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  injectCallback(screen, (key: string, matcher: unknown, options: unknown) => {
    setDataToPrintOnFailure(
      t,
      key?.startsWith('get') ? 'within' : 'latestSearch',
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        matcher,
        key,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...(options && { options }),
      }
    );
  });

export const withinContext = (t: TestController): typeof within => (selector) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  injectCallback(within(selector), (key, params: unknown[]) => {
    setDataToPrintOnFailure(t, 'latestSearch', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(t.ctx.within && { within: t.ctx.within }),
      key,
      params: params?.length === 1 ? params[0] : params,
    });
  });

const getHtml = ClientFunction(
  // eslint-disable-next-line testing-library/no-node-access
  (selector: string) => document.querySelector(selector)?.outerHTML
);

export const getErrorMessage = async (t: TestController): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  const testIdSelector = t.ctx.within?.key?.match(/testid/gi)
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
      `[data-testid="${t.ctx.within.matcher}"]`
    : 'body';

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion
  const componentHtml = pretty((await getHtml(testIdSelector)) ?? '') as string;
  return `Expectation failed on test context:
  ------------------------------------------------
  ${JSON.stringify(t.ctx, null, '\t')}
  ------------------------------------------------
  Failure occured within '${testIdSelector}' component:
  ------------------------------------------------
  ${componentHtml}
  ------------------------------------------------
  `;
};

export const clearDataToPrintOnFailure = (t: TestController): void => {
  // eslint-disable-next-line no-param-reassign
  t.ctx = {};
};
