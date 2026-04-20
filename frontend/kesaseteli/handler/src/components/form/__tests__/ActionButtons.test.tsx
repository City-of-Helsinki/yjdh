import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { fakeActivatedYouthApplication } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import React from 'react';
import ActionButtons from '../ActionButtons';

describe('ActionButtons', () => {
  it('should be enabled when SSN is provided even if VTJ data is not found', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: '010101-123A',
      encrypted_handler_vtj_json: {
        Henkilo: { Henkilotunnus: { '@voimassaolokoodi': '0' } },
      },
    });
    renderComponent(<ActionButtons application={application} />);

    expect(screen.getByTestId('accept-button')).toBeEnabled();
    expect(screen.getByTestId('reject-button')).toBeEnabled();
  });

  it('should be enabled when non-VTJ birthdate is provided and SSN is missing', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: undefined,
      non_vtj_birthdate: '2000-01-01',
    });
    renderComponent(<ActionButtons application={application} />);

    expect(screen.getByTestId('accept-button')).toBeEnabled();
    expect(screen.getByTestId('reject-button')).toBeEnabled();
  });

  it('should be disabled when both SSN and non-VTJ birthdate are missing', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: undefined,
      non_vtj_birthdate: undefined,
    });
    renderComponent(<ActionButtons application={application} />);

    expect(screen.getByTestId('accept-button')).toBeDisabled();
    expect(screen.getByTestId('reject-button')).toBeDisabled();
  });
});
