import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ButtonVariant } from 'hds-react';
import React from 'react';

import ConfirmModalContent from '../confirm';

const onClose = jest.fn();
const onSubmit = jest.fn();

type ConfirmModalContentProps = React.ComponentProps<
  typeof ConfirmModalContent
>;

const renderSubject = (
  overrides: Partial<ConfirmModalContentProps> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(
    <ConfirmModalContent
      onClose={onClose}
      onSubmit={onSubmit}
      variant={ButtonVariant.Primary}
      {...overrides}
    />
  );

const getCancelButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Peruuta' });

const getConfirmButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Vahvista' });

describe('ConfirmModalContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders default action buttons without optional heading/text', () => {
    renderSubject();

    expect(getCancelButton()).toBeInTheDocument();
    expect(getConfirmButton()).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(
      screen.queryByText('Haluatko varmasti jatkaa?')
    ).not.toBeInTheDocument();
  });

  it('renders heading and text when they are provided', () => {
    renderSubject({
      heading: 'Vahvista toimenpide',
      text: 'Haluatko varmasti jatkaa?',
    });

    expect(
      screen.getByRole('heading', { name: 'Vahvista toimenpide' })
    ).toBeInTheDocument();
    expect(screen.getByText('Haluatko varmasti jatkaa?')).toBeInTheDocument();
  });

  it('calls onClose and onSubmit from their corresponding action buttons', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getCancelButton());
    await user.click(getConfirmButton());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits correctly with danger variant', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ variant: ButtonVariant.Danger })
    );

    await user.click(getConfirmButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
