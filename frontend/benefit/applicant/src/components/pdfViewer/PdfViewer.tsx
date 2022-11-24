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
  documentMarginLeft?: string; // FIXME: A way to crop pdf white margins will be better because not all pdf have same margins
  scale?: number;
};

const PdfViewer: React.FC<PdfViewerProps> = ({
  file,
  documentMarginLeft,
  scale,
}) => {
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
    <$ViewerWrapper documentMarginLeft={documentMarginLeft}>
      <Document
        onLoadSuccess={handleDocumentLoadSuccess}
        file={file}
        className="Document"
      >
        <Page pageNumber={currentPage} scale={scale} />
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

export default PdfViewer;
