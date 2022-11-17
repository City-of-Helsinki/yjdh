import fileDownload from 'js-file-download';
import ExportFileType from 'shared/types/export-file-type';

export const downloadFile = (data: string, type: ExportFileType): void => {
  if (type === 'csv') {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fileDownload(data, 'report.csv', 'text/csv;charset=utf-8');
  } else {
    fileDownload(data, 'report.zip');
  }
};

export const openFileInNewTab = (fileUrl: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  window.open(fileUrl, '_blank')?.focus();
};
