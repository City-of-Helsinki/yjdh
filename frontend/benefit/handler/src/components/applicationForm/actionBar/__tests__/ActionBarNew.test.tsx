import { RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import React from 'react';

import ActionBarNew from '../ActionBarNew';

const mockPush = jest.fn();
const getNextButton = (): HTMLElement => screen.getByTestId('nextButton');
const getButton = (name: string): HTMLElement =>
  screen.getByRole('button', { name });
const getDeleteConfirmationButton = (): Promise<HTMLElement> =>
  screen.findByTestId('modalSubmit');

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ActionBarNew', () => {
  const labels = {
    back: 'Edellinen',
    next: 'Jatka',
    saveDraft: 'Tallenna luonnoksena ja sulje',
    submit: 'Lähetä saapuneisiin',
    deleteApplication: 'Poista hakemus',
  };

  const defaultProps = {
    handleSaveDraft: jest.fn(),
    id: undefined,
  };

  const renderActionBar = (
    props: Partial<React.ComponentProps<typeof ActionBarNew>> = {}
  ): RenderResult =>
    renderComponent(<ActionBarNew {...defaultProps} {...props} />).renderResult;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders optional action buttons when handlers are provided', () => {
    renderActionBar({
      handleBack: jest.fn(),
      handleSave: jest.fn(),
    });

    expect(getButton(labels.back)).toBeInTheDocument();
    expect(getNextButton()).toHaveTextContent(labels.next);
    expect(getButton(labels.saveDraft)).toBeInTheDocument();
    expect(getButton(labels.deleteApplication)).toBeInTheDocument();
  });

  it('calls action handlers when buttons are clicked', async () => {
    const handleBack = jest.fn();
    const handleSave = jest.fn();
    const handleSaveDraft = jest.fn();

    const user = setupUserAndRender(() => {
      renderActionBar({
        handleBack,
        handleSave,
        handleSaveDraft,
      });
    });

    await user.click(getButton(labels.back));
    await user.click(getNextButton());
    await user.click(getButton(labels.saveDraft));

    expect(handleBack).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSaveDraft).toHaveBeenCalledTimes(1);
  });

  it('navigates to front page when delete is clicked without id', async () => {
    const user = setupUserAndRender(() => {
      renderActionBar();
    });

    await user.click(getButton(labels.deleteApplication));

    expect(mockPush).toHaveBeenCalledWith('/');
    expect(screen.queryByTestId('modalSubmit')).not.toBeInTheDocument();
  });

  it('opens delete confirmation modal and calls handleDelete', async () => {
    const handleDelete = jest.fn();
    const user = setupUserAndRender(() => {
      renderActionBar({
        id: '123',
        handleDelete,
      });
    });

    await user.click(getButton(labels.deleteApplication));
    await user.click(await getDeleteConfirmationButton());

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('renders submit button label when handleSubmit is provided', () => {
    renderActionBar({
      handleSubmit: jest.fn(),
    });

    expect(getNextButton()).toHaveTextContent(labels.submit);
  });
});
