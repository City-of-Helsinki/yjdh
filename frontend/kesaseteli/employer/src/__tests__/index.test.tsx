import { fireEvent, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import EmployerIndex from 'kesaseteli/employer/pages';
import React from 'react';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { render } from 'test-utils';

describe('frontend/kesaseteli/employer/src/pages/index.tsx', () => {
  const queryClient = createReactQueryTestClient();
  beforeEach(() => {
    queryClient.clear();
  });

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

  it('Should show component when authorized', async () => {
    const expectedUser = expectAuthorizedReply(true);
    renderPage(EmployerIndex, queryClient);
    await screen.findByText(new RegExp(`tervetuloa ${expectedUser.name}`, 'i'));
    expect(queryClient.getQueryData('user')).toEqual(expectedUser);
  });

  it('Should redirect to company page when clicked create new application button', async () => {
    const expectedUser = expectAuthorizedReply(true);
    const spyPush = jest.fn();
    renderPage(EmployerIndex, queryClient, { push: spyPush });
    await screen.findByText(new RegExp(`tervetuloa ${expectedUser.name}`, 'i'));
    fireEvent.click(
      screen.getByRole('button', {
        name: /luo uusi hakemus/i,
      })
    );
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('fi/company'));
  });
});
