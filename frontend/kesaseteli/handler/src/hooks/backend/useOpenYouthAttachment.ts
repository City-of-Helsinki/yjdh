import {
  BackendEndpoint,
  getBackendUrl,
} from 'kesaseteli-shared/backend-api/backend-api';
import React from 'react';
import type { KesaseteliAttachment } from 'shared/types/attachment';

/**
 * Returns a callback to open a youth application's attachment in a new browser tab.
 * The backend GET endpoint returns a secure `FileResponse` containing the binary data.
 */
const useOpenYouthAttachment = (
  applicationId: string
): ((attachment: KesaseteliAttachment) => void) =>
  React.useCallback(
    (attachment: KesaseteliAttachment) => {
      const url = `${getBackendUrl(
        BackendEndpoint.YOUTH_APPLICATIONS
      )}${applicationId}/attachments/${attachment.id}/`;
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [applicationId]
  );

export default useOpenYouthAttachment;
