import { RenderResult, screen } from '@testing-library/react';
import {
  clickDialogButton,
  getDialog,
  getDialogButton,
} from 'benefit/handler/__tests__/utils/modal-test-helpers';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import React from 'react';

import AlterationDeleteModal from '../AlterationDeleteModal';

const onClose = jest.fn();
const onDelete = jest.fn();

const labels = {
  title:
    'Haluatko varmasti poistaa saapuneen ilmoituksen muutoksesta työsuhteessa?',
  body: 'Jos jatkat, tiedot työsuhteen muutoksesta poistuvat lopullisesti hakijan ja käsittelijän järjestelmistä.',
  confirm: 'Poista',
  close: 'Takaisin',
  loading: 'Poistetaan...',
};

const renderSubject = (isDeleting = false): RenderResult =>
  renderComponent(
    <AlterationDeleteModal
      isOpen
      onClose={onClose}
      onDelete={onDelete}
      isDeleting={isDeleting}
    />
  ).renderResult;

describe('AlterationDeleteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the delete confirmation content', () => {
    renderSubject();

    const dialog = getDialog();

    expect(dialog).toHaveTextContent(labels.title);
    expect(dialog).toHaveTextContent(labels.body);
    expect(getDialogButton(labels.close)).toBeInTheDocument();
    expect(getDialogButton(labels.confirm)).toBeInTheDocument();
  });

  it('calls onClose when the secondary action is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await clickDialogButton(labels.close, user);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('calls onDelete when the danger action is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await clickDialogButton(labels.confirm, user);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables both actions while deletion is in progress', () => {
    renderSubject(true);

    expect(screen.getByRole('button', { name: labels.close })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.loading })).toBeDisabled();
  });
});
