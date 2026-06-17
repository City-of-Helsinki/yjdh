import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { renderHook } from '@testing-library/react-hooks';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useDownloadApplicationPdf from '../useDownloadApplicationPdf';

jest.mock('react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useDownloadApplicationPdf', () => {
  const handleResponse = jest.fn();
  const get = jest.fn();
  const mutationFn = jest.fn();

  let mutationOptions: {
    onSuccess?: (data: ArrayBuffer, applicationId: string) => void;
    onError?: () => void;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: { get },
      handleResponse,
    });

    mutationOptions = {};

    (useMutation as jest.Mock).mockImplementation(
      (_key, passedMutationFn, options) => {
        mutationFn.mockImplementation(passedMutationFn);
        mutationOptions = options;
        return { mutate: jest.fn() };
      }
    );
  });

  it('calls the correct endpoint with arraybuffer responseType', async () => {
    const getResponse = {};
    get.mockReturnValue(getResponse);
    handleResponse.mockResolvedValue(new ArrayBuffer(0));

    renderHook(() => useDownloadApplicationPdf());

    await mutationFn('abc-123');

    expect(get).toHaveBeenCalledWith(
      HandlerEndpoint.HANDLER_APPLICATION_PDF('abc-123'),
      { responseType: 'arraybuffer' }
    );
    expect(handleResponse).toHaveBeenCalledWith(getResponse);
  });

  it('triggers a file download with the correct filename on success', () => {
    const click = jest.fn();
    const anchorElement = {
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement;
    const originalCreateElement = document.createElement.bind(document);
    const createElement = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string) =>
        tag === 'a' ? anchorElement : originalCreateElement(tag)
      );

    // JSDOM does not define URL.createObjectURL/revokeObjectURL, so assign directly
    const createObjectURL = jest.fn(() => 'blob:fake-url');
    const revokeObjectURL = jest.fn();
    const originalCreateObjectURL = URL.createObjectURL?.bind(URL);
    const originalRevokeObjectURL = URL.revokeObjectURL?.bind(URL);
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    renderHook(() => useDownloadApplicationPdf());

    const data = new ArrayBuffer(8);
    mutationOptions.onSuccess?.(data, 'abc-123');

    expect(createObjectURL).toHaveBeenCalledWith(
      new Blob([data], { type: 'application/pdf' })
    );
    expect(anchorElement.download).toBe('hakemus_abc-123.pdf');
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');

    createElement.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('shows an error toast on failure', () => {
    renderHook(() => useDownloadApplicationPdf());

    mutationOptions.onError?.();

    expect(showErrorToast).toHaveBeenCalled();
  });
});
