import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import React from 'react';
import { openFileInNewTab } from 'shared/utils/file.utils';

import PrerequisiteReminder from '../PrerequisiteReminder';

jest.mock('shared/utils/file.utils', () => ({
  openFileInNewTab: jest.fn(),
}));

const mockOpenFileInNewTab = openFileInNewTab as jest.Mock;

const headingText = 'Muistitko nämä ennen hakulomakkeen täyttämistä?';
const bodyText =
  'Tarvitset hakemuksen liitteeksi työllistettävän allekirjoituksen henkilötietojen käsittelystä, allekirjoitetun työsopimuksen, mahdollisesti Helsinki-lisä -kortin.';
const downloadButtonText =
  'Lataa tiedoksianto työllistettävän henkilötietojen käsittelystä';
const detailsLinkText = 'Katso ohjeet Helsinki-lisän hakemiseen';

const renderReminder = (): ReturnType<typeof renderComponent> =>
  renderComponent(<PrerequisiteReminder />);

describe('PrerequisiteReminder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders translated heading, body and actions', () => {
    renderReminder();

    expect(
      screen.getByRole('heading', { name: headingText })
    ).toBeInTheDocument();
    expect(screen.getByText(bodyText)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: downloadButtonText })
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent(detailsLinkText);
  });

  it('opens the prerequisite pdf in a new tab when download button is clicked', async () => {
    const user = setupUserAndRender(() => {
      renderReminder();
    });

    await user.click(screen.getByRole('button', { name: downloadButtonText }));

    expect(mockOpenFileInNewTab).toHaveBeenCalledWith(
      '/employee_consent_fi.pdf'
    );
  });

  it('renders details link with expected href and new tab target', () => {
    renderReminder();

    const detailsLink = screen.getByRole('link');

    expect(detailsLink).toHaveTextContent(detailsLinkText);
    expect(detailsLink).toHaveAttribute('href', 'https://hel.fi/helsinki-lisa');
    expect(detailsLink).toHaveAttribute('target', '_blank');
    expect(detailsLink).toHaveAttribute('rel', 'noopener');
  });
});
