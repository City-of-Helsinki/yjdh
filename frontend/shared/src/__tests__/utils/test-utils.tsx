import {
  render,
  RenderResult,
  waitFor as _waitFor,
  waitForOptions,
} from '@testing-library/react';
import * as router from 'next/router';
import { NextRouter } from 'next/router';
import React from 'react';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  // eslint-disable-next-line react/jsx-no-useless-fragment
  <>{children}</>
);

const customRender: CustomRender = (ui, routerOverride) => {
  jest.spyOn(router, 'useRouter').mockReturnValue(routerOverride as NextRouter);

  const utils = render(ui, { wrapper: Wrapper });
  return { ...utils };
};

type CustomRender = {
  (ui: React.ReactElement, router?: Partial<NextRouter>): CustomRenderResult;
};

type CustomRenderResult = RenderResult;

export { customRender as render };

export const waitFor = (
  callback: () => void | Promise<void>,
  options?: waitForOptions
): Promise<void> => {
  // Overwrite default options
  const mergedOptions = {
    timeout: 5000,
    ...options,
  };
  return _waitFor(callback, mergedOptions);
};

// re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
