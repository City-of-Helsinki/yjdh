import { screen, within } from '@testing-library/testcafe';
import pretty from 'pretty';
import TestController, { ClientFunction } from 'testcafe';

export const setDataToPrintOnFailure = (
  t: TestController,
  key: string,
  value: unknown
): void => {
  t.ctx[key] = value;
};

export const screenContext = (t: TestController): typeof screen =>
  injectCallback(screen, (key, params) => {
    const [matcher, options] = params;
    setDataToPrintOnFailure(
      t,
      key?.startsWith('get') ? 'within' : 'latestSearch',
      {
        matcher,
        key,
        ...(options && { options }),
      }
    );
  });

export const withinContext = (t: TestController): typeof within => (selector) =>
  injectCallback(within(selector), (key, params) => {
    setDataToPrintOnFailure(t, 'latestSearch', {
      ...(t.ctx.within && { within: t.ctx.within }),
      key,
      params: params?.length === 1 ? params[0] : params,
    });
  });

const injectCallback = <
  Key extends string,
  Obj extends Record<Key, (...args) => Selector | SelectorPromise>
>(
  obj: Obj,
  callback: (...args) => void
): Obj =>
  Object.keys(obj)
    .filter((key) => typeof obj[key] === 'function')
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: (...params) => {
          callback(key, params);
          return obj[key](...params);
        },
      }),
      {}
    ) as Obj;

const getHtml = ClientFunction(
  (selector: string) => document.querySelector(selector)?.outerHTML
);

export const getErrorMessage = async (t: TestController): Promise<string> => {
  const testIdSelector = t.ctx.within?.key?.match(/TestId/gi)
    ? `[data-testid="${t.ctx.within.matcher}"]`
    : 'body';
  const componentHtml = pretty(await getHtml(testIdSelector));
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
  t.ctx = {};
};
