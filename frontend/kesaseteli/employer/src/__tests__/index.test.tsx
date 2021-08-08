import { axe } from 'jest-axe';
import { expectUnauthorizedReply } from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import EmployerIndex from 'kesaseteli/employer/pages';
import nock from 'nock'
import React from 'react';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { render, waitFor } from 'test-utils';

describe('frontend/kesaseteli/employer/src/pages/index.tsx', () => {
  const queryClient = createReactQueryTestClient();
  beforeEach(() => {
    queryClient.clear();
  });

  afterEach(() => {
    nock.cleanAll();
  })

  it('test for accessibility violations', async () => {
    const { container } = render(<EmployerIndex />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    renderPage(EmployerIndex, queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
  });
});
