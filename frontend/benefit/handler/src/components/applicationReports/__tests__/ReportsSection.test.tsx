import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import React from 'react';

import ReportsSection, { ReportsSectionProp } from '../ReportsSection';

const onDownloadButtonClick = jest.fn();

const defaultProps: ReportsSectionProp = {
  exportFileType: 'csv',
  header: 'Raporttiosio',
  buttonText: 'Lataa',
  compactButtonText: 'Lataa tiivistetty',
  onDownloadButtonClick,
};

const renderSubject = (
  overrides: Partial<ReportsSectionProp> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<ReportsSection {...defaultProps} {...overrides} />);

const getDownloadButton = (fileType = 'csv'): HTMLElement =>
  screen.getByRole('button', { name: new RegExp(`lataa ${fileType}`, 'i') });

const getCompactButton = (): HTMLElement =>
  screen.getByRole('button', { name: /lataa tiivistetty/i });

const getHeading = (name: string): HTMLElement =>
  screen.getByRole('heading', { name });

const getChildrenText = (text: string): HTMLElement => screen.getByText(text);

const queryChildrenText = (text: string): HTMLElement | null =>
  screen.queryByText(text);

const queryDivider = (): HTMLElement | null =>
  // eslint-disable-next-line testing-library/no-node-access
  document.querySelector('hr');

describe('ReportsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders heading with provided header text', () => {
    renderSubject();

    expect(getHeading('Raporttiosio')).toBeInTheDocument();
  });

  it.each(['csv', 'csv/pdf'] as const)(
    'renders download button with %s file type appended to label',
    (fileType) => {
      renderSubject({ exportFileType: fileType });

      expect(getDownloadButton(fileType)).toBeInTheDocument();
    }
  );

  it('renders compact download button', () => {
    renderSubject();

    expect(getCompactButton()).toBeInTheDocument();
  });

  it.each([
    [false, 'full', getDownloadButton],
    [true, 'compact', getCompactButton],
  ])(
    'calls onDownloadButtonClick(exportFileType, %s) when %s button clicked',
    async (isCompact, _label, getButton) => {
      const user = setupUserAndRender(() => {
        renderSubject();
      });

      await user.click(getButton());

      expect(onDownloadButtonClick).toHaveBeenCalledTimes(1);
      expect(onDownloadButtonClick).toHaveBeenCalledWith('csv', isCompact);
    }
  );

  it('renders children when provided', () => {
    renderSubject({ children: <p>Lisätiedot</p> });

    expect(getChildrenText('Lisätiedot')).toBeInTheDocument();
  });

  it('does not render children area when children are not provided', () => {
    renderSubject({ children: undefined });

    expect(queryChildrenText('Lisätiedot')).not.toBeInTheDocument();
  });

  it('does not render divider by default', () => {
    renderSubject();

    expect(queryDivider()).not.toBeInTheDocument();
  });

  it('renders divider when withDivider is true', () => {
    renderSubject({ withDivider: true });

    expect(queryDivider()).toBeInTheDocument();
  });
});
