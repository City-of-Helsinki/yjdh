import { Button } from 'hds-react';
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import { $ActionsWrapper, $ViewerWrapper } from './PdfViewer.sc';
import { usePdfViewer } from './usePdfViewer';
// test if it works in production
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type PdfViewerProps = {
  file: string;
};

const PdfViewver: React.FC<PdfViewerProps> = ({ file }) => {
  const {
    t,
    handleDocumentLoadSuccess,
    handleNext,
    handleBack,
    currentPage,
    pagesCount,
  } = usePdfViewer();

  const theme = useTheme();
  return (
    <$ViewerWrapper>
      <Document onLoadSuccess={handleDocumentLoadSuccess} file={file}>
        <Page pageNumber={currentPage} />
      </Document>
      <$Grid
        css={`
          margin-bottom: ${theme.spacing.l};
        `}
      >
        <$GridCell>
          <Button
            disabled={currentPage === 1}
            theme="black"
            variant="secondary"
            onClick={handleBack}
          >
            {t('common:pdfViewer.previous')}
          </Button>
        </$GridCell>
        <$GridCell>
          <$ActionsWrapper>
            {`${t('common:pdfViewer.page')} ${currentPage} / ${pagesCount}`}
          </$ActionsWrapper>
        </$GridCell>
        <$GridCell>
          <Button
            disabled={currentPage === pagesCount}
            theme="black"
            variant="secondary"
            onClick={handleNext}
          >
            {t('common:pdfViewer.next')}
          </Button>
        </$GridCell>
      </$Grid>
    </$ViewerWrapper>
  );
};

export default PdfViewver;
