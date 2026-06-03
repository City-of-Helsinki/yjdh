import { act, renderHook } from '@testing-library/react-hooks';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { KesaseteliAttachment } from 'shared/types/attachment';

import useOpenAttachment from '../useOpenAttachment';

jest.mock('shared/hooks/useBackendAPI');

describe('useOpenAttachment', () => {
  let mockGet: jest.Mock;
  let mockHandleResponse: jest.Mock;
  let originalOpen: typeof window.open;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let mockOpen: jest.Mock;
  let mockFocus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockHandleResponse = jest.fn((promise) => promise);
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        get: mockGet,
      },
      handleResponse: mockHandleResponse,
    });

    originalOpen = window.open;
    mockFocus = jest.fn();
    mockOpen = jest.fn(() => ({
      focus: mockFocus,
    }));
    window.open = mockOpen as never;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  afterEach(() => {
    window.open = originalOpen;
    URL.createObjectURL = originalCreateObjectURL;
  });

  it('fetches attachment blob and opens it in a new window', async () => {
    const mockBlob = new Blob(['content'], { type: 'application/pdf' });
    mockGet.mockResolvedValue(mockBlob);

    const { result } = renderHook(() => useOpenAttachment());

    const mockAttachment = {
      id: 'attach-1',
      summer_voucher: 'voucher-123',
      content_type: 'application/pdf',
    } as KesaseteliAttachment;

    await act(async () => {
      await result.current(mockAttachment);
    });

    expect(mockGet).toHaveBeenCalledWith(
      '/v1/employersummervouchers/voucher-123/attachments/attach-1',
      { responseType: 'blob' }
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenCalledWith('mock-url', '_blank');
    expect(mockFocus).toHaveBeenCalledTimes(1);
  });

  it('does nothing if the response data is not a Blob instance', async () => {
    mockGet.mockResolvedValue('not-a-blob');

    const { result } = renderHook(() => useOpenAttachment());

    const mockAttachment = {
      id: 'attach-1',
      summer_voucher: 'voucher-123',
      content_type: 'application/pdf',
    } as KesaseteliAttachment;

    await act(async () => {
      await result.current(mockAttachment);
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(mockOpen).not.toHaveBeenCalled();
  });
});
