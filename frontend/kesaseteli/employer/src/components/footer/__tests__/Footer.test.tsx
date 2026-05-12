import { screen } from '@testing-library/react';
import FooterSection from 'kesaseteli/employer/components/footer/Footer';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

const informationLink = 'https://kesaseteli.fi/';
const accessibilityStatementLink =
  'https://nuorten.hel.fi/opiskelu-ja-tyo/kesaseteli/kesaseteli-saavutettavuusseloste/';

const renderFooter = (locale = 'fi'): ReturnType<typeof renderComponent> =>
  renderComponent(<FooterSection />, {
    locale,
    defaultLocale: 'fi',
    locales: ['fi', 'sv', 'en'],
  });

const getFooterLinks = (): {
  accessibility: HTMLElement;
  cookieSettings: HTMLElement;
  information: HTMLElement;
} => ({
  accessibility: screen.getByRole('link', { name: /saavutettavuusseloste/i }),
  cookieSettings: screen.getByRole('link', { name: /evästeasetukset/i }),
  information: screen.getByRole('link', { name: /tietoa palvelusta/i }),
});

const setup = (
  locale = 'fi'
): {
  links: {
    accessibility: HTMLElement;
    cookieSettings: HTMLElement;
    information: HTMLElement;
  };
} => {
  renderFooter(locale);
  return { links: getFooterLinks() };
};

describe('Footer', () => {
  it('renders title, copyright texts and city logo', () => {
    setup();

    expect(screen.getByText(/kesäseteli/i)).toBeInTheDocument();
    expect(screen.getByText(/helsingin kaupunki/i)).toBeInTheDocument();
    expect(screen.getByText(/kaikki oikeudet pidätetään/i)).toBeInTheDocument();
    expect(screen.getByText(/takaisin ylös/i)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Helsingin kaupunki' })
    ).toBeInTheDocument();
  });

  it('renders footer links with translated labels and expected urls', () => {
    const { links } = setup('fi');

    expect(links.accessibility).toHaveAttribute(
      'href',
      accessibilityStatementLink
    );
    expect(links.cookieSettings).toHaveAttribute('href', '/fi/cookie-settings');
    expect(links.information).toHaveAttribute('href', informationLink);
  });

  it('opens external links in a new tab and keeps cookie settings as internal link', () => {
    const { links } = setup();

    expect(links.accessibility).toHaveAttribute('target', '_blank');
    expect(links.accessibility).toHaveAttribute('rel', 'noopener noreferrer');
    expect(links.information).toHaveAttribute('target', '_blank');
    expect(links.information).toHaveAttribute('rel', 'noopener noreferrer');
    expect(links.cookieSettings).not.toHaveAttribute('target');
  });

  it('uses active locale in cookie settings link', () => {
    setup('sv');

    expect(screen.getByRole('link', { name: /eväste/i })).toHaveAttribute(
      'href',
      '/sv/cookie-settings'
    );
  });
});
