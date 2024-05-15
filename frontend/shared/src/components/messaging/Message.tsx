import { IconCheck } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import theme from 'shared/styles/theme';
import { MessageVariant } from 'shared/types/messages';

import {
  $Date,
  $Hr,
  $Message,
  $MessageContainer,
  $Meta,
  $SeenByUser,
  $Sender,
} from './Messaging.sc';

export interface MessageProps {
  sender: string;
  date: string;
  text: string;
  isPrimary?: boolean;
  alignRight?: boolean;
  wrapAsColumn?: boolean;
  variant: MessageVariant;
  seenByApplicant?: boolean;
}

const Message: React.FC<MessageProps> = ({
  sender,
  date,
  text,
  isPrimary,
  variant,
  alignRight,
  wrapAsColumn,
  seenByApplicant = false,
}) => {
  const { t } = useTranslation();

  return (
    <$MessageContainer>
      <$Meta alignRight={alignRight} wrapAsColumn={wrapAsColumn}>
        <$Sender>{sender}</$Sender>
        <$Date>{date}</$Date>
        {seenByApplicant && (
          <$SeenByUser>
            {t('common:messenger.seenByUser')}{' '}
            <IconCheck size="xs" color={theme.colors.tram} />
          </$SeenByUser>
        )}
      </$Meta>
      <$Message isPrimary={isPrimary} variant={variant} alignRight={alignRight}>
        {text}
      </$Message>
      {variant === 'note' && <$Hr />}
    </$MessageContainer>
  );
};

export default Message;
