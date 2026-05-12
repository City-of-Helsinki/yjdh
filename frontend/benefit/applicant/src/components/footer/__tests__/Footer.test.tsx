import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import React from 'react';

import FooterSection from '../Footer';

const appName = 'Helsinki-lisä';
const allRightsReservedText = 'Kaikki oikeudet pidätetään';
const backToTopText = 'Takaisin ylös';
const accessibilityStatementText = 'Saavutettavuusseloste';
const cookieSettingsText = 'Evästeasetukset';
const aboutTheServiceText = 'Tietoa palvelusta';
const aboutTheServiceLink = 'https://www.hel.fi/helsinki-lisa';

const renderFooter = (): ReturnType<typeof renderComponent> =>
  renderComponent(<FooterSection />, {
    locale: 'fi',
    defaultLocale: 'fi',
    locales: ['fi', 'sv', 'en'],
  });

describe('Footer', () => {
  it('renders translated footer title, copyright text, and back to top label', () => {
    renderFooter();

    expect(screen.getByText(appName)).toBeInTheDocument();
    expect(screen.getByText(/Copyright/)).toBeInTheDocument();
    expect(screen.getByText(allRightsReservedText)).toBeInTheDocument();
    expect(screen.getByText(backToTopText)).toBeInTheDocument();
  });

  it('renders footer links using the active locale and translated labels', () => {
    renderFooter();

    expect(
      screen.getByRole('link', { name: accessibilityStatementText })
    ).toHaveAttribute('href', '/fi/accessibility-statement');
    expect(
      screen.getByRole('link', { name: cookieSettingsText })
    ).toHaveAttribute('href', '/fi/cookie-settings');
    expect(
      screen.getByRole('link', { name: aboutTheServiceText })
    ).toHaveAttribute('href', aboutTheServiceLink);
  });

  it('renders the city logo alt text', () => {
    renderFooter();

    expect(
      screen.getByRole('img', { name: 'Helsingin kaupunki' })
    ).toBeInTheDocument();
  });

  it('opens external accessibility and about links in a new tab', () => {
    renderFooter();

    expect(
      screen.getByRole('link', { name: accessibilityStatementText })
    ).toHaveAttribute('target', '_blank');
    expect(
      screen.getByRole('link', { name: accessibilityStatementText })
    ).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByRole('link', { name: aboutTheServiceText })
    ).toHaveAttribute('target', '_blank');
    expect(
      screen.getByRole('link', { name: aboutTheServiceText })
    ).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByRole('link', { name: cookieSettingsText })
    ).not.toHaveAttribute('target');
  });
});
