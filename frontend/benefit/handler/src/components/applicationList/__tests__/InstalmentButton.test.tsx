import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import React from 'react';

import InstalmentButton from '../InstalmentButton';

type RenderProps = {
  isLoading?: boolean;
  isLoadingStatusChange?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

const renderSubject = ({
  isLoading = false,
  isLoadingStatusChange = false,
  onClick = jest.fn(),
  children = 'Merkitse maksetuksi',
}: RenderProps = {}): void => {
  renderComponent(
    <InstalmentButton
      isLoading={isLoading}
      isLoadingStatusChange={isLoadingStatusChange}
      onClick={onClick}
    >
      {children}
    </InstalmentButton>
  );
};

describe('InstalmentButton', () => {
  it('renders children as button label', () => {
    renderSubject({ children: 'Tallenna' });

    expect(
      screen.getByRole('button', { name: 'Tallenna' })
    ).toBeInTheDocument();
  });

  it.each([
    {
      label: 'both loading flags are false',
      isLoading: false,
      isLoadingStatusChange: false,
      isDisabled: false,
    },
    {
      label: 'isLoading is true',
      isLoading: true,
      isLoadingStatusChange: false,
      isDisabled: true,
    },
    {
      label: 'isLoadingStatusChange is true',
      isLoading: false,
      isLoadingStatusChange: true,
      isDisabled: true,
    },
    {
      label: 'both loading flags are true',
      isLoading: true,
      isLoadingStatusChange: true,
      isDisabled: true,
    },
  ])(
    'applies disabled state when $label',
    ({ isLoading, isLoadingStatusChange, isDisabled }) => {
      renderSubject({ isLoading, isLoadingStatusChange });

      const button = screen.getByRole('button', {
        name: 'Merkitse maksetuksi',
      });

      if (isDisabled) {
        expect(button).toBeDisabled();
      } else {
        expect(button).toBeEnabled();
      }
    }
  );

  it('calls onClick when clicked and enabled', async () => {
    const onClick = jest.fn();
    const user = setupUserAndRender(() => renderSubject({ onClick }));

    await user.click(
      screen.getByRole('button', { name: 'Merkitse maksetuksi' })
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
