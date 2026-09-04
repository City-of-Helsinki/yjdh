import type { QueryClient } from '@tanstack/react-query';
import {
  getEmployerApplicationQueryKey,
  getEmployerApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';

import invalidateAttachmentQueries from '../invalidateAttachmentQueries';

describe('invalidateAttachmentQueries', () => {
  it('invalidates employer application query and timeline query', async () => {
    const invalidateQueries = jest.fn().mockResolvedValue([]);
    const queryClient = {
      invalidateQueries,
    } as unknown as QueryClient;

    const applicationId = 'app-123';
    await invalidateAttachmentQueries(queryClient, applicationId);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [getEmployerApplicationQueryKey(applicationId)],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [getEmployerApplicationTimelineKey(applicationId)],
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(2);
  });
});
