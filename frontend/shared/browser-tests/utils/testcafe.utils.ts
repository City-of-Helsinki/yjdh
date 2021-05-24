import { screen, within } from '@testing-library/testcafe';
import pretty from 'pretty';
import TestController, { ClientFunction } from 'testcafe';

export const setDataToPrintOnFailure = (
  t: TestController,
  key: string,
  value: unknown
): void => {
  // eslint-disable-next-line no-param-reassign
  t.ctx[key] = value;
};

const injectCallback = <
  Key extends string,
  Obj extends Record<Key, (...args) => Selector | SelectorPromise>
  >(
  obj: Obj,
  callback: (...args) => void
): Obj =>
  Object.keys(obj)
    .filter((key) => typeof obj[key] === 'function')
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: (...params) => {
          callback(key, params);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
          return obj[key](...params);
        },
      }),
      {}
    ) as Obj;


export const screenContext = (t: TestController): typeof screen =>
  injectCallback(screen, (key: string, params) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [matcher, options] = params;
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
  injectCallback(within(selector), (key, params) => {
    setDataToPrintOnFailure(t, 'latestSearch', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(t.ctx.within && { within: t.ctx.within }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      key,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
    ? `[data-testid="${t.ctx.within.matcher}"]`
    : 'body';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const componentHtml = pretty(await getHtml(testIdSelector)) as string;
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
