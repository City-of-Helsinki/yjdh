import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { fakeActivatedYouthApplication } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import React from 'react';

import ActionButtons from '../ActionButtons';

jest.mock('kesaseteli/handler/hooks/backend/useUserQuery', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockReturnValue({ data: { id: 'test-user-id', name: 'Test User' } }),
}));

describe('ActionButtons', () => {
  it('should be enabled when SSN is provided even if VTJ data is not found', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: '010101-123A',
      encrypted_handler_vtj_json: {
        Henkilo: { Henkilotunnus: { '@voimassaolokoodi': '0' } },
      },
      assignee: { id: 'test-user-id', name: 'Test User' },
    });
    renderComponent(<ActionButtons application={application} />);

    expect(screen.getByRole('button', { name: /hyväksy/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /hylkää/i })).toBeEnabled();
  });

  it('should be enabled when non-VTJ birthdate is provided and SSN is missing', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: undefined,
      non_vtj_birthdate: '2000-01-01',
      assignee: { id: 'test-user-id', name: 'Test User' },
    });
    renderComponent(<ActionButtons application={application} />);

    expect(screen.getByRole('button', { name: /hyväksy/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /hylkää/i })).toBeEnabled();
  });

  it('should be disabled when both SSN and non-VTJ birthdate are missing', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: undefined,
      non_vtj_birthdate: undefined,
      assignee: { id: 'test-user-id', name: 'Test User' },
    });
    renderComponent(<ActionButtons application={application} />);

    expect(screen.getByRole('button', { name: /hyväksy/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /hylkää/i })).toBeDisabled();
  });

  it('should be disabled when user is not the assignee', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: '010101-123A',
      assignee: { id: 'other-user-id', name: 'Other User' },
    });
    renderComponent(<ActionButtons application={application} />);

    expect(screen.getByRole('button', { name: /hyväksy/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /hylkää/i })).toBeDisabled();
  });
});
