import { ROUTES } from 'benefit/handler/constants';
import { UploadProps } from 'benefit/handler/types/application';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { Button, IconGlyphEuro, IconPlus } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import UploadAttachment from 'shared/components/attachments/UploadAttachment';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import {
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_MAX_SIZE,
} from 'shared/constants/attachment-constants';
import { useTheme } from 'styled-components';

import { $ActionsWrapper } from '../../ApplicationReview.sc';

const EmployeeActions: React.FC<UploadProps> = ({
  isUploading,
  handleUpload,
}) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const handleCloseClick = (): void => {
    void router.push(ROUTES.HOME);
  };

  return (
    <$ActionsWrapper>
      <$Grid>
        <$GridCell
          $colSpan={3}
          css={`
            margin-bottom: ${theme.spacing.m};
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
            attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
            allowedFileTypes={ATTACHMENT_CONTENT_TYPES}
            maxSize={ATTACHMENT_MAX_SIZE}
            uploadText={t(`${translationsBase}.addAttachment`)}
            loadingText={t(`common:upload.isUploading`)}
            errorTitle={t('common:error.attachments.title')}
            errorFileSizeText={t('common:error.attachments.tooBig')}
            errorFileTypeText={t('common:error.attachments.fileType')}
            icon={<IconPlus />}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <Button
            css={`
              background-color: ${theme.colors.white};
            `}
            onClick={handleCloseClick}
            theme="black"
            variant="secondary"
            iconLeft={<IconGlyphEuro />}
          >
            {t(`${translationsBase}.addPreviouslyGrantedBenefit`)}
          </Button>
        </$GridCell>
      </$Grid>
    </$ActionsWrapper>
  );
};

export default EmployeeActions;
