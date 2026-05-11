import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import AppContext, { AppContextType } from 'benefit/handler/context/AppContext';
import React from 'react';

import FooterSection from '../Footer';

const buildContextValue = (
  overrides: Partial<AppContextType> = {}
): AppContextType => ({
  isNavigationVisible: false,
  isFooterVisible: true,
  isSidebarVisible: false,
  layoutBackgroundColor: '#ffffff',
  handledApplication: null,
  setIsNavigationVisible: jest.fn(),
  setIsFooterVisible: jest.fn(),
  setLayoutBackgroundColor: jest.fn(),
  setHandledApplication: jest.fn(),
  setIsSidebarVisible: jest.fn(),
  ...overrides,
});

const renderSubject = (
  contextOverrides: Partial<AppContextType> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(
    <AppContext.Provider value={buildContextValue(contextOverrides)}>
      <FooterSection />
    </AppContext.Provider>
  );

describe('Footer', () => {
  it('does not render when footer visibility is disabled', () => {
    renderSubject({ isFooterVisible: false });

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Helsinki-lisä käsittelijä')
    ).not.toBeInTheDocument();
  });

  it('renders footer title, copyright texts and logo when visible', () => {
    renderSubject({ isFooterVisible: true });

    expect(screen.getByText('Helsinki-lisä käsittelijä')).toBeInTheDocument();
    expect(screen.getByText(/Copyright/)).toBeInTheDocument();
    expect(screen.getByText('Kaikki oikeudet pidätetään')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Helsingin kaupunki' })
    ).toBeInTheDocument();
  });
});
