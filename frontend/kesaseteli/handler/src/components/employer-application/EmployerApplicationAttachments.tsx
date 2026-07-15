import { Notification } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useMediaQuery from 'shared/hooks/useMediaQuery';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import useOpenAttachment from '../../hooks/backend/useOpenAttachment';
import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import {
  $AttachmentLink,
  $AttachmentsContainer,
  $PlaceholderArea,
  $PlaceholderInputArea,
  $Table,
  $TableWrapper,
} from './EmployerApplicationAttachments.sc';

type Props = {
  application: HandlerEmployerApplication;
};

const EmployerApplicationAttachmentsForm: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.m})`);

  return (
    <>
      <Notification
        label={t('common:handlerApplication.attachments.developerPreviewTitle')}
        type="alert"
      >
        {t('common:handlerApplication.attachments.developerPreviewBody')}
      </Notification>

      {!isMobile && (
        <$PlaceholderArea>
          {t('common:handlerApplication.attachmentsDragAndDropPlaceholder')}
        </$PlaceholderArea>
      )}

      <$PlaceholderInputArea>
        <label htmlFor="attachment-file-input">
          {isMobile
            ? t('common:handlerApplication.attachmentsInputPlaceholderMobile')
            : t('common:handlerApplication.attachmentsInputPlaceholderDesktop')}
        </label>
        <input id="attachment-file-input" type="file" disabled />
      </$PlaceholderInputArea>
    </>
  );
};

const EmployerApplicationAttachments: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.m})`);
  const openAttachment = useOpenAttachment();

  const attachments = application.summer_vouchers.flatMap(
    (voucher) => voucher.attachments || []
  );

  const hasAttachments = attachments.length > 0;
  return (
    <$AttachmentsContainer>
      <EmployerApplicationAttachmentsForm />

      <$TableWrapper>
        <$Table>
          {/* Visually hidden caption for screen readers to describe the table content */}
          <caption>{t('common:handlerApplication.attachmentsTitle')}</caption>
          <thead>
            <tr>
              <th>{t('common:handlerApplication.attachmentName')}</th>
              <th>{t('common:handlerApplication.attachmentType')}</th>
              {!isMobile && (
                <>
                  <th>{t('common:handlerApplication.attachmentAddedBy')}</th>
                  <th>{t('common:handlerApplication.attachmentAddedAt')}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {hasAttachments ? (
              attachments.map((attachment) => (
                <tr key={attachment.id}>
                  <td>
                    <$AttachmentLink onClick={() => openAttachment(attachment)}>
                      {attachment.attachment_file_name}
                    </$AttachmentLink>
                  </td>
                  <td>
                    {attachment.attachment_type === 'employment_contract'
                      ? t('common:handlerApplication.employment_contract')
                      : t('common:handlerApplication.payslip')}
                  </td>
                  {!isMobile && (
                    <>
                      <td>
                        {t('common:handlerApplication.attachmentEmployer')}
                      </td>
                      <td>
                        {convertToUIDateAndTimeFormat(attachment.created_at)}
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isMobile ? 2 : 4}>
                  {t('common:handlerApplication.noAttachments')}
                </td>
              </tr>
            )}
          </tbody>
        </$Table>
      </$TableWrapper>
    </$AttachmentsContainer>
  );
};

export default EmployerApplicationAttachments;
