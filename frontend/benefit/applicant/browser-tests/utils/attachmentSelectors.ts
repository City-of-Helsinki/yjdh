import { Selector } from 'testcafe';

const toEscapedFilenamePattern = (filename: string): RegExp => {
  const filenameWithoutExtension = filename.replace(/\.[^.]+$/, '');
  const escapedFilename = filenameWithoutExtension.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );

  return new RegExp(escapedFilename, 'i');
};

export const getUploadedFileLinkInScope = (
  scope: Selector | string,
  filename: string
): Selector =>
  Selector(scope)
    .find('a')
    .withAttribute('aria-label', toEscapedFilenamePattern(filename))
    .filterVisible();

export const getUploadFieldContainer = (inputId: string): Selector =>
  Selector(inputId).parent().parent();
