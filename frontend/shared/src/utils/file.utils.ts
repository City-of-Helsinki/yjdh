import fileDownload from 'js-file-download';

export const downloadFile = (data: string, type: 'pdf' | 'csv'): void => {
  if (type === 'csv') {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(`data:text/csv;charset=utf-8,${data}`);
  } else {
    fileDownload(data, 'report.zip');
  }
};

export const openFileInNewTab = (fileUrl: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  window.open(fileUrl, '_blank')?.focus();
};
