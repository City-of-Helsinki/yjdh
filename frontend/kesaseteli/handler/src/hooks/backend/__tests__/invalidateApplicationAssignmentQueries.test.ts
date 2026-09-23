import type { QueryClient } from '@tanstack/react-query';
import { APPLICATION_LIST_TYPES } from 'kesaseteli/handler/types/application';
import {
  BackendEndpoint,
  getEmployerApplicationQueryKey,
  getEmployerApplicationTimelineKey,
  getYouthApplicationQueryKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';

import invalidateApplicationAssignmentQueries from '../invalidateApplicationAssignmentQueries';

describe('invalidateApplicationAssignmentQueries', () => {
  it('invalidates list, detail, and timeline queries for youth application', async () => {
    const invalidateQueries = jest.fn().mockResolvedValue([]);
    const queryClient = {
      invalidateQueries,
    } as unknown as QueryClient;

    const applicationId = 'youth-app-123';
    await invalidateApplicationAssignmentQueries(
      queryClient,
      APPLICATION_LIST_TYPES.YOUTH,
      applicationId
    );

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [BackendEndpoint.YOUTH_APPLICATIONS],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [getYouthApplicationQueryKey(applicationId)],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [getYouthApplicationTimelineKey(applicationId)],
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it('invalidates list, detail, and timeline queries for employer application', async () => {
    const invalidateQueries = jest.fn().mockResolvedValue([]);
    const queryClient = {
      invalidateQueries,
    } as unknown as QueryClient;

    const applicationId = 'employer-app-456';
    await invalidateApplicationAssignmentQueries(
      queryClient,
      APPLICATION_LIST_TYPES.EMPLOYER,
      applicationId
    );

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [BackendEndpoint.EMPLOYER_APPLICATIONS],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [getEmployerApplicationQueryKey(applicationId)],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [getEmployerApplicationTimelineKey(applicationId)],
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });
});
