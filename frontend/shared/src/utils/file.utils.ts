export const downloadCSVFile = (data: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  window.open(`data:text/csv;charset=utf-8,${data}`);
};

export const openFileInNewTab = (fileUrl: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  window.open(fileUrl, '_blank')?.focus();
};
