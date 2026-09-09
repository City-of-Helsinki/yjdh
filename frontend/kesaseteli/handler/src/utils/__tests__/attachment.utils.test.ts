import { AxiosError, AxiosHeaders } from 'axios';
import { TFunction } from 'next-i18next';

import { getAttachmentUploadErrorMessage } from '../attachment.utils';

const createAxiosError = (data: unknown): AxiosError =>
  ({
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Request failed',
    toJSON: () => ({}),
    response: {
      data,
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    },
  } as AxiosError);

describe('getAttachmentUploadErrorMessage', () => {
  const mockT = jest.fn((key: string) => key) as unknown as TFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns non_field_errors[0] if present', () => {
    const error = createAxiosError({
      non_field_errors: ['Korkeintaan viisi liitettä tyyppiä kohden'],
    });
    expect(getAttachmentUploadErrorMessage(error, mockT)).toBe(
      'Korkeintaan viisi liitettä tyyppiä kohden'
    );
  });

  it('returns detail if present', () => {
    const error = createAxiosError({
      detail: 'Something went wrong with the file',
    });
    expect(getAttachmentUploadErrorMessage(error, mockT)).toBe(
      'Something went wrong with the file'
    );
  });

  it('returns attachment_file[0] if present', () => {
    const error = createAxiosError({
      attachment_file: ['Tiedoston tyyppi ei ole sallittu.'],
    });
    expect(getAttachmentUploadErrorMessage(error, mockT)).toBe(
      'Tiedoston tyyppi ei ole sallittu.'
    );
  });

  it('returns generic error if axios error has no recognized fields', () => {
    const error = createAxiosError({ some_other_field: 'error' });
    expect(getAttachmentUploadErrorMessage(error, mockT)).toBe(
      'common:error.attachments.generic'
    );
  });

  it('returns generic error if error is not an AxiosError', () => {
    const error = new Error('Network error');
    expect(getAttachmentUploadErrorMessage(error, mockT)).toBe(
      'common:error.attachments.generic'
    );
  });
});
