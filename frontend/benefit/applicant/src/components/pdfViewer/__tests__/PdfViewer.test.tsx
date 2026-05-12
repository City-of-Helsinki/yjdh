import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import React from 'react';

import i18n from '../../../../test/i18n/i18n-test';
import PdfViewer from '../PdfViewer';
import { usePdfViewer } from '../usePdfViewer';

jest.mock('react-pdf', () => ({
  Document: ({
    file,
    children,
  }: {
    file: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="pdf-document" data-file={file}>
      {children}
    </div>
  ),
  Page: ({ pageNumber }: { pageNumber: number }) => (
    <div data-testid="pdf-page" data-page={pageNumber} />
  ),
  pdfjs: { GlobalWorkerOptions: {} },
}));

jest.mock('benefit/applicant/components/pdfViewer/usePdfViewer');

const mockUsePdfViewer = usePdfViewer as jest.Mock;

const t = i18n.t.bind(i18n);

const defaultHook = {
  t,
  currentPage: 1,
  pagesCount: 1,
  handleDocumentLoadSuccess: jest.fn(),
  handleNext: jest.fn(),
  handleBack: jest.fn(),
};

const setupHook = (overrides: Partial<typeof defaultHook> = {}): void => {
  mockUsePdfViewer.mockReturnValue({ ...defaultHook, ...overrides });
};

const renderPdfViewer = ({
  file = '/test.pdf',
  hookOverrides = {},
}: {
  file?: string;
  hookOverrides?: Partial<typeof defaultHook>;
} = {}): ReturnType<typeof renderComponent> => {
  setupHook(hookOverrides);
  return renderComponent(<PdfViewer file={file} />);
};

const getPreviousButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Edellinen sivu' });

const getNextButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Seuraava sivu' });

const queryPreviousButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Edellinen sivu' });

const queryNextButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Seuraava sivu' });

describe('PdfViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the pdf document with the given file', () => {
    renderPdfViewer({ file: '/my-document.pdf' });

    expect(screen.getByTestId('pdf-document')).toHaveAttribute(
      'data-file',
      '/my-document.pdf'
    );
  });

  it('does not render navigation when there is only one page', () => {
    renderPdfViewer();

    expect(queryPreviousButton()).not.toBeInTheDocument();
    expect(queryNextButton()).not.toBeInTheDocument();
  });

  it('renders navigation buttons when there are multiple pages', () => {
    renderPdfViewer({ hookOverrides: { pagesCount: 3, currentPage: 2 } });

    expect(getPreviousButton()).toBeInTheDocument();
    expect(getNextButton()).toBeInTheDocument();
  });

  it('shows the current page indicator', () => {
    renderPdfViewer({ hookOverrides: { pagesCount: 5, currentPage: 3 } });

    expect(screen.getByText('Sivu 3 / 5')).toBeInTheDocument();
  });

  it('disables the previous button on the first page', () => {
    renderPdfViewer({ hookOverrides: { pagesCount: 3, currentPage: 1 } });

    expect(getPreviousButton()).toBeDisabled();
    expect(getNextButton()).toBeEnabled();
  });

  it('disables the next button on the last page', () => {
    renderPdfViewer({ hookOverrides: { pagesCount: 3, currentPage: 3 } });

    expect(getNextButton()).toBeDisabled();
    expect(getPreviousButton()).toBeEnabled();
  });

  it('calls handleNext when next button is clicked', async () => {
    const handleNext = jest.fn();
    const user = setupUserAndRender(() => {
      renderPdfViewer({
        hookOverrides: { pagesCount: 3, currentPage: 1, handleNext },
      });
    });

    await user.click(getNextButton());

    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('calls handleBack when previous button is clicked', async () => {
    const handleBack = jest.fn();
    const user = setupUserAndRender(() => {
      renderPdfViewer({
        hookOverrides: { pagesCount: 3, currentPage: 2, handleBack },
      });
    });

    await user.click(getPreviousButton());

    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
