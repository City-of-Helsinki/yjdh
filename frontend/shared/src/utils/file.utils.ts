import { format } from 'date-fns';
import fileDownload from 'js-file-download';
import ExportFileType from 'shared/types/export-file-type';

import { DATE_FORMATS } from './date.utils';

export const downloadFile = (data: string, type: ExportFileType): void => {
  const now = new Date();
  const dateFormat = `${DATE_FORMATS.BACKEND_DATE} HH.mm.ss`;
  const dateString = format(now, dateFormat);

  if (type === 'csv') {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fileDownload(data, `hl ${dateString}.csv`, 'text/csv;charset=utf-8-sig', '\uFEFF');
  } else {
    fileDownload(data, `hl ${dateString}.zip`);
  }
};

export const openFileInNewTab = (fileUrl: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  window.open(fileUrl, '_blank')?.focus();
};
