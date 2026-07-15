import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import * as React from 'react';
import { KesaseteliAttachment } from 'shared/types/attachment';

const useOpenAttachment = (): ((attachment: KesaseteliAttachment) => void) =>
  React.useCallback((attachment: KesaseteliAttachment) => {
    const { id: attachmentId, summer_voucher } = attachment;
    const url = `${getBackendDomain()}${
      BackendEndpoint.EMPLOYER_SUMMER_VOUCHERS
    }${summer_voucher}${BackendEndpoint.ATTACHMENTS}${attachmentId}/`;
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

export default useOpenAttachment;
