import AttachmentsIngress from 'benefit/applicant/components/attachmentsIngress/AttachmentsIngress';
import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

import AttachmentsList from './attachmentsList/AttachmentsList';

const ApplicationFormStep3: React.FC = () => (
    <>
      <FormSection>
        <AttachmentsIngress />
        <AttachmentsList
          attachmentType={ATTACHMENT_TYPES.COMMISSION_CONTRACT}
        />
        <AttachmentsList attachmentType={ATTACHMENT_TYPES.EDUCATION_CONTRACT} />
        <AttachmentsList
          attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
        />
        <AttachmentsList
          attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
        />
        <AttachmentsList
          attachmentType={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
        />
      </FormSection>
    </>
  );

export default ApplicationFormStep3;
