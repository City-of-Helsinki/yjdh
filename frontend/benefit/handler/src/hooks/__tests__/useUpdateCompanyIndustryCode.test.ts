import { useMutation } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useUpdateCompanyIndustryCode from '../useUpdateCompanyIndustryCode';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

describe('useUpdateCompanyIndustryCode', () => {
  const handleResponse = jest.fn();
  const patch = jest.fn();

  let capturedMutationFn: (variables: {
    companyId: string;
    industryCode: string;
    industry?: string;
  }) => unknown;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: { patch },
      handleResponse,
    });

    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedMutationFn = options.mutationFn;
      return { mutate: jest.fn() };
    });
  });

  it('calls the correct endpoint with industry_code and industry fields', () => {
    renderHook(() => useUpdateCompanyIndustryCode());

    handleResponse.mockReturnValue(Promise.resolve({}));
    patch.mockReturnValue(Promise.resolve({ data: {} }));

    capturedMutationFn({
      companyId: 'company-123',
      industryCode: '62010',
      industry: 'Computer programming activities',
    });

    expect(patch).toHaveBeenCalledWith(
      HandlerEndpoint.COMPANY_INDUSTRY_CODE('company-123'),
      {
        industry_code: '62010',
        industry: 'Computer programming activities',
      }
    );
  });

  it('sends empty string for industry when industry is undefined', () => {
    renderHook(() => useUpdateCompanyIndustryCode());

    handleResponse.mockReturnValue(Promise.resolve({}));
    patch.mockReturnValue(Promise.resolve({ data: {} }));

    capturedMutationFn({
      companyId: 'company-456',
      industryCode: '47111',
      industry: undefined,
    });

    expect(patch).toHaveBeenCalledWith(
      HandlerEndpoint.COMPANY_INDUSTRY_CODE('company-456'),
      {
        industry_code: '47111',
        industry: '',
      }
    );
  });

  it('registers the mutation with the correct key', () => {
    renderHook(() => useUpdateCompanyIndustryCode());

    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationKey: ['updateCompanyIndustryCode'],
      })
    );
  });
});
