import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { useState } from 'react';

type ExtendedComponentProps = {
  handleDocumentLoadSuccess: (pdf: PDFDocumentProxy) => void;
  handleBack: () => void;
  handleNext: () => void;
  currentPage: number;
  pagesCount: number;
};

const usePdfViewer = (): ExtendedComponentProps => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagesCount, setPagesCount] = useState<number>(1);

  const handleDocumentLoadSuccess = ({ _pdfInfo }: PDFDocumentProxy): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    setPagesCount(_pdfInfo.numPages);
  };

  const handleNext = (): void => {
    if (pagesCount > currentPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    handleDocumentLoadSuccess,
    handleNext,
    handleBack,
    currentPage,
    pagesCount,
  };
};

export { usePdfViewer };
