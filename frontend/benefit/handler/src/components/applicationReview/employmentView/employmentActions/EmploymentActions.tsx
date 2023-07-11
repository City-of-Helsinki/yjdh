import { UploadProps } from 'benefit/handler/types/application';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { IconPlus } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import UploadAttachment from 'shared/components/attachments/UploadAttachment';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { ATTACHMENT_MAX_SIZE } from 'shared/constants/attachment-constants';
import { useTheme } from 'styled-components';

import { $ActionsWrapper } from '../../ApplicationReview.sc';

const EmploymentActions: React.FC<UploadProps> = ({
  isUploading,
  handleUpload,
}) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <$ActionsWrapper>
      <$Grid>
        <$GridCell
          $colSpan={3}
          css={`
            background-color: ${theme.colors.white};
            button {
              width: 100%;
            }
          `}
        >
          <UploadAttachment
            theme="black"
            variant="secondary"
            onUpload={handleUpload}
            isUploading={isUploading}
            attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
            allowedFileTypes={['application/pdf']}
            maxSize={ATTACHMENT_MAX_SIZE}
            uploadText={t(`${translationsBase}.addAttachment`)}
            loadingText={t(`common:upload.isUploading`)}
            errorTitle={t('common:error.attachments.title')}
            errorFileSizeText={t('common:error.attachments.tooBig')}
            errorFileTypeText={t('common:error.attachments.fileType')}
            icon={<IconPlus />}
          />
        </$GridCell>
      </$Grid>
    </$ActionsWrapper>
  );
};

export default EmploymentActions;
