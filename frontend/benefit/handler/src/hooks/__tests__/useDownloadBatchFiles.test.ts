import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { downloadFile } from 'shared/utils/file.utils';

import useDownloadBatchFiles from '../useDownloadBatchFiles';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());
jest.mock('shared/utils/file.utils', () => ({ downloadFile: jest.fn() }));

describe('useDownloadBatchFiles', () => {
  const axios = { get: jest.fn() };
  const handleResponse = jest.fn();
  let capturedMutationFn: (batchId: string) => unknown;
  let capturedOnSuccess: (data: string) => void;
  let capturedOnError: () => void;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });

    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedMutationFn = options.mutationFn;
      capturedOnSuccess = options.onSuccess;
      capturedOnError = options.onError;
      return { mutate: jest.fn() };
    });

    renderHook(() => useDownloadBatchFiles());
  });

  it('calls the batch PDF download endpoint with arraybuffer response type', () => {
    handleResponse.mockReturnValue(Promise.resolve(''));
    axios.get.mockReturnValue({});

    capturedMutationFn('batch-1');

    expect(axios.get).toHaveBeenCalledWith(
      HandlerEndpoint.BATCH_DOWNLOAD_PDF_FILES('batch-1'),
      { responseType: 'arraybuffer' }
    );
  });

  it('calls downloadFile with csv/pdf type on success', () => {
    capturedOnSuccess('file-data');

    expect(downloadFile).toHaveBeenCalledWith('file-data', 'csv/pdf');
  });

  it('shows error toast on error', () => {
    capturedOnError();

    expect(showErrorToast).toHaveBeenCalled();
  });
});
