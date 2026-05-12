import { RenderResult, screen } from '@testing-library/react';
import { createMockAlteration } from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import { ApplicationAlteration } from 'benefit-shared/types/application';
import React from 'react';

import AlterationDeleteModal from '../AlterationDeleteModal';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

type AlterationDeleteModalProps = React.ComponentProps<
  typeof AlterationDeleteModal
>;

const baseAlteration: ApplicationAlteration = createMockAlteration({
  contactPersonName: 'Maija Meikalainen',
});

const defaultProps: AlterationDeleteModalProps = {
  isOpen: true,
  isDeleting: false,
  onDelete: jest.fn(),
  onClose: jest.fn(),
  alteration: baseAlteration,
};

const renderAlterationDeleteModal = (
  props: Partial<AlterationDeleteModalProps> = {}
): RenderResult =>
  renderComponent(<AlterationDeleteModal {...defaultProps} {...props} />)
    .renderResult;

const getDeleteButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Poista' });

const getCancelButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Peruuta' });

describe('AlterationDeleteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders suspension delete modal title and body text', () => {
    renderAlterationDeleteModal({
      alteration: {
        ...baseAlteration,
        alterationType: ALTERATION_TYPE.SUSPENSION,
      },
    });

    expect(
      screen.getByText(
        'Haluatko poistaa tehdyn ilmoituksen työsuhteen keskeytymisestä?'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tehty ilmoitus työsuhteen keskeytymisestä poistetaan.')
    ).toBeInTheDocument();
    expect(getDeleteButton()).toBeInTheDocument();
    expect(getCancelButton()).toBeInTheDocument();
  });

  it('renders termination delete modal title and body text', () => {
    renderAlterationDeleteModal({
      alteration: {
        ...baseAlteration,
        alterationType: ALTERATION_TYPE.TERMINATION,
        resumeDate: undefined,
      },
    });

    expect(
      screen.getByText(
        'Haluatko poistaa tehdyn ilmoituksen työsuhteen päättymisestä?'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tehty ilmoitus työsuhteen päättymisestä poistetaan.')
    ).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = jest.fn();
    const user = setupUserAndRender(() => {
      renderAlterationDeleteModal({ onDelete });
    });

    await user.click(getDeleteButton());

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = jest.fn();
    const user = setupUserAndRender(() => {
      renderAlterationDeleteModal({ onClose });
    });

    await user.click(getCancelButton());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables action buttons and shows deleting text while deleting', () => {
    renderAlterationDeleteModal({ isDeleting: true });

    expect(
      screen.getByRole('button', { name: 'Poistetaan...' })
    ).toBeDisabled();
    expect(getCancelButton()).toBeDisabled();
  });

  it('does not render modal content when isOpen is false', () => {
    renderAlterationDeleteModal({ isOpen: false });

    expect(screen.queryByText('Poista')).not.toBeInTheDocument();
    expect(screen.queryByText('Peruuta')).not.toBeInTheDocument();
  });
});
