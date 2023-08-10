import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { Button } from 'hds-react';
import url from 'pdfjs-dist/build/pdf.worker';
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import { $ActionsWrapper, $ViewerWrapper } from './PdfViewer.sc';
import { usePdfViewer } from './usePdfViewer';

pdfjs.GlobalWorkerOptions.workerSrc = String(url);

type PdfViewerProps = {
  file: string;
  scale?: number;
};

const PdfViewer: React.FC<PdfViewerProps> = ({ file, scale }) => {
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
    <>
      <$ViewerWrapper>
        <Document
          onLoadSuccess={handleDocumentLoadSuccess}
          file={file}
          className="Document"
        >
          <Page pageNumber={currentPage} scale={scale} />
        </Document>
      </$ViewerWrapper>
      {pagesCount > 1 ? (
        <$Grid
          css={`
            margin-top: ${theme.spacing.l};
            margin-bottom: ${theme.spacing.xl};
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
      ) : null}
    </>
  );
};

export default PdfViewer;
