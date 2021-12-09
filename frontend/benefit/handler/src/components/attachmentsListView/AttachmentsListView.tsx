import { ATTACHMENT_TYPES } from 'benefit/handler/constants';
import { IconLinkExternal, IconPaperclip } from 'hds-react';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import { BenefitAttachment } from 'shared/types/attachment';

export interface AttachmentsListViewProps {
  attachments: BenefitAttachment[];
  type: ATTACHMENT_TYPES;
  title?: string;
}

const AttachmentsListView: React.FC<AttachmentsListViewProps> = ({
  attachments,
  type,
  title,
}) => {
  const attachmentItems = React.useMemo(
    (): BenefitAttachment[] =>
      attachments?.filter((att) => att.attachmentType === type),
    [attachments, type]
  );

  const handleOpenFile = React.useCallback(
    (file: BenefitAttachment) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      window.open(file.attachmentFile, '_blank')?.focus(),
    []
  );
  if (attachmentItems.length === 0) return <></>;
  return (
    <>
      {attachmentItems.length > 0 && (
        <$GridCell $colStart={1} $colSpan={6}>
          {title && (
            <$ViewFieldBold css={{ fontSize: theme.fontSize.body.m }}>
              {title}
            </$ViewFieldBold>
          )}
          {attachmentItems.map((attachment) => (
            <$ViewField
              css={{
                display: 'flex',
                alignItems: 'center',
                marginTop: `${theme.spacing.xs}`,
                fontSize: theme.fontSize.body.m,
                color: theme.colors.coatOfArms,
              }}
              key={attachment.attachmentFileName}
            >
              <IconPaperclip
                css={{ color: theme.colors.black }}
                aria-label={attachment.attachmentFileName}
              />
              {attachment.attachmentFileName}
              <IconLinkExternal
                onClick={() => handleOpenFile(attachment)}
                aria-label={`${attachment.attachmentFileName}_open`}
                css={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }}
                size="s"
              />
            </$ViewField>
          ))}
        </$GridCell>
      )}
    </>
  );
};

export default AttachmentsListView;
