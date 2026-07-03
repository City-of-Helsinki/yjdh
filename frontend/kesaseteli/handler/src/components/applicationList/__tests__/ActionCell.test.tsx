import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import mockRouter from 'next-router-mock';
import React from 'react';

import { ApplicationStatus, BaseApplication } from '../../../types/application';
import ActionCell from '../ActionCell';

describe('ActionCell', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
  });

  it('renders a link with the correct youth-application href', () => {
    renderComponent(
      <ActionCell
        value="SSN-123"
        row={
          {
            id: 'test-id-123',
            status: ApplicationStatus.SUBMITTED,
          } as BaseApplication
        }
        type="youth"
      />,
      mockRouter
    );
    expect(screen.getByRole('link', { name: 'SSN-123' })).toHaveAttribute(
      'href',
      '/youth-applications/test-id-123'
    );
  });

  it('navigates to youth-applications detail page on click', async () => {
    renderComponent(
      <ActionCell
        value="SSN-123"
        row={
          {
            id: 'test-id-123',
            status: ApplicationStatus.SUBMITTED,
          } as BaseApplication
        }
        type="youth"
      />,
      mockRouter
    );
    await userEvent.click(screen.getByRole('link'));
    expect(mockRouter.asPath).toBe('/youth-applications/test-id-123');
  });

  it('renders a link with the correct employer-application href', () => {
    renderComponent(
      <ActionCell
        value="SN-001"
        row={
          {
            id: 'test-id-456',
            status: ApplicationStatus.SUBMITTED,
          } as BaseApplication
        }
        type="employer"
      />,
      mockRouter
    );
    expect(screen.getByRole('link', { name: 'SN-001' })).toHaveAttribute(
      'href',
      '/employer-applications/test-id-456'
    );
  });

  it('navigates to employer-applications detail page on click', async () => {
    renderComponent(
      <ActionCell
        value="SN-001"
        row={
          {
            id: 'test-id-456',
            status: ApplicationStatus.SUBMITTED,
          } as BaseApplication
        }
        type="employer"
      />,
      mockRouter
    );
    await userEvent.click(screen.getByRole('link'));
    expect(mockRouter.asPath).toBe('/employer-applications/test-id-456');
  });
});
