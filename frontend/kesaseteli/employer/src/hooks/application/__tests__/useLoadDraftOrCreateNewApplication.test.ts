import { useQueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import { useRouter } from 'next/router';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import Application from 'shared/types/application';

import useLoadDraftOrCreateNewApplication, {
  useCreateApplication,
} from '../useLoadDraftOrCreateNewApplication';

jest.mock('kesaseteli/employer/hooks/backend/useApplicationsQuery');
jest.mock('kesaseteli/employer/hooks/backend/useCreateApplicationQuery');
jest.mock('shared/hooks/useLocale', () => jest.fn(() => 'fi'));
jest.mock('shared/hooks/useErrorHandler', () => jest.fn(() => jest.fn()));
jest.mock('shared/hooks/useBackendAPI');
jest.mock('@tanstack/react-query');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('kesaseteli/employer/services/ApplicationPersistenceService');

/**
 * Tests for the `useCreateApplication` hook.
 * This hook is responsible for:
 * 1. Making API requests to create new applications.
 * 2. Sycing prefilled employer data (from local persistence) to the newly created draft.
 * 3. Clearing the temporary employer data from storage after it has been saved to the backend.
 * 4. Navigating the user to the correct localized application form page.
 */
describe('useCreateApplication', () => {
  let mockPush: jest.Mock;
  let mockCancelQueries: jest.Mock;
  let mockMutate: jest.Mock;
  let mockPut: jest.Mock;
  let mockHandleResponse: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    mockCancelQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({
      cancelQueries: mockCancelQueries,
    });

    mockMutate = jest.fn();
    (useCreateApplicationQuery as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });

    mockPut = jest.fn();
    mockHandleResponse = jest.fn();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        put: mockPut,
      },
      handleResponse: mockHandleResponse,
    });
  });

  /**
   * Test: Redirects Swedish users (or applications marked Swedish) to the Swedish version of the app.
   * Business rule: The UI language must be preserved or match the application's language preference.
   */
  it('goToApplicationPage redirects to application page', () => {
    const { result } = renderHook(() => useCreateApplication());
    const mockApp = { id: 'app-123', language: 'sv' } as Application;

    act(() => {
      result.current.goToApplicationPage(mockApp);
    });

    // Inflight queries are cancelled before navigation to prevent UI state updates on unmounted pages
    expect(mockCancelQueries).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('sv/application?id=app-123');
  });

  /**
   * Test: Standard application creation workflow where no local draft data exists.
   * UI Flow: User clicks "Create application" -> API call occurs -> User is redirected to draft form directly.
   */
  it('createApplication calls mutate and triggers onSuccess without prefilled data', () => {
    const { result } = renderHook(() => useCreateApplication());

    act(() => {
      result.current.createApplication();
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
    const [, options] = mockMutate.mock.calls[0];

    // Simulate empty persistence storage
    (
      ApplicationPersistenceService.getEmployerData as jest.Mock
    ).mockReturnValue(null);
    const mockNewApp = { id: 'app-456' } as Application;

    act(() => {
      options.onSuccess(mockNewApp);
    });

    expect(mockPush).toHaveBeenCalledWith('fi/application?id=app-456');
  });

  /**
   * Test: Prefilled/unsaved form data integration.
   * UI Flow: If the user filled in employer details beforehand (stored locally) and then starts an application:
   * 1. We must send a PUT request to update the newly created draft with these details.
   * 2. Only after the PUT resolves, we clear the local store (preventing loss of typed data if network fails).
   * 3. Finally, we route the user to the form.
   */
  it('createApplication calls mutate and handles prefilled data put and clear storage on success', async () => {
    const { result } = renderHook(() => useCreateApplication());

    act(() => {
      result.current.createApplication();
    });

    const [, options] = mockMutate.mock.calls[0];

    const mockPrefilled = { company_name: 'Test Co' };
    (
      ApplicationPersistenceService.getEmployerData as jest.Mock
    ).mockReturnValue(mockPrefilled);

    const mockNewApp = { id: 'app-456' } as Application;
    const mockUpdatedApp = {
      id: 'app-456',
      company_name: 'Test Co',
    } as unknown as Application;

    mockHandleResponse.mockResolvedValue(mockUpdatedApp);

    await act(async () => {
      await options.onSuccess(mockNewApp);
    });

    // Verify PUT carries the prefilled company info and status is preserved/set as 'draft'
    expect(mockPut).toHaveBeenCalledWith('/v1/employerapplications/app-456/', {
      id: 'app-456',
      company_name: 'Test Co',
      status: 'draft',
    });
    // Verify local storage is cleared to prevent reuse on subsequent new applications
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ApplicationPersistenceService.clearAll).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('fi/application?id=app-456');
  });
});

/**
 * Tests for the `useLoadDraftOrCreateNewApplication` hook.
 * This hook acts as a router/orchestrator when the user accesses the landing/dashboard page:
 * - If the user already has a pending "draft" application, redirect them to it immediately (avoids creating empty duplicate drafts).
 * - If no draft application exists, trigger creation of a new application and redirect there.
 */
describe('useLoadDraftOrCreateNewApplication', () => {
  let mockPush: jest.Mock;
  let mockMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      cancelQueries: jest.fn(),
    });

    mockMutate = jest.fn();
    (useCreateApplicationQuery as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isIdle: true,
    });

    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: { put: jest.fn() },
      handleResponse: jest.fn(),
    });
  });

  /**
   * Test: Draft recovery.
   * UI behavior: Avoid creating a duplicate draft. Route user to the existing draft application.
   */
  it('routes to draft application if draft is found', () => {
    (useApplicationsQuery as jest.Mock).mockReturnValue({
      isSuccess: true,
      data: { id: 'app-draft', status: 'draft' },
    });

    renderHook(() => useLoadDraftOrCreateNewApplication());

    expect(mockPush).toHaveBeenCalledWith('fi/application?id=app-draft');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  /**
   * Test: Auto-creation of new application when no draft is found.
   * UI behavior: If no draft exists and the hook is idle (not already mutating), auto-start draft creation.
   */
  it('creates new application if no draft is found and mutation is idle', () => {
    (useApplicationsQuery as jest.Mock).mockReturnValue({
      isSuccess: true,
      data: undefined,
    });

    renderHook(() => useLoadDraftOrCreateNewApplication());

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  /**
   * Test: Guard against loading states and backend errors.
   * UI behavior: Do not trigger mutations or redirect if the query list is still fetching or has failed.
   */
  it('does nothing if query is not successful', () => {
    (useApplicationsQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
      data: undefined,
    });

    renderHook(() => useLoadDraftOrCreateNewApplication());

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
