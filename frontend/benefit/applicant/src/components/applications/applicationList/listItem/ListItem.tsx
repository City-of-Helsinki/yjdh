import { useTranslation } from 'benefit/applicant/i18n';
import { Loading } from 'benefit/applicant/types/common';
import StatusIcon from 'benefit-shared/components/statusIcon/StatusIcon';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import { Button, IconSpeechbubbleText } from 'hds-react';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import {
  $Avatar,
  $DataColumn,
  $DataHeader,
  $DataValue,
  $ItemActions,
  $ItemContent,
  $ListInfo,
  $ListInfoInner,
  $ListInfoText,
  $ListItem,
  $ListItemWrapper,
  $StatusDataColumn,
  $StatusDataValue,
} from './ListItem.sc';

export type ListItemProps = ApplicationListItemData | Loading;

const ListItem: React.FC<ListItemProps> = (props) => {
  const { t } = useTranslation();
  const translationBase = 'common:applications.list';

  if ('isLoading' in props) {
    return (
      <$ListItem>
        <$ItemContent>
          <LoadingSkeleton width={60} height={60} circle />
          <$DataColumn>
            <LoadingSkeleton width="100%" />
            <LoadingSkeleton width="100%" />
          </$DataColumn>
        </$ItemContent>
        <$ItemActions>
          <LoadingSkeleton height="50px" />
        </$ItemActions>
      </$ListItem>
    );
  }

  const {
    name,
    contactPersonName,
    avatar,
    statusText,
    modifiedAt,
    submittedAt,
    applicationNum,
    allowedAction,
    status,
    unreadMessagesCount,
    validUntil,
  } = props;

  const ActionIcon = allowedAction.Icon;

  return (
    <$ListItemWrapper>
      <$ListItem>
        <$ItemContent>
          <$Avatar $backgroundColor={avatar.color} title={contactPersonName}>
            {avatar.initials}
          </$Avatar>
          <$DataColumn>
            <$DataHeader>{t(`${translationBase}.common.employee`)}</$DataHeader>
            <$DataValue>{name}</$DataValue>
          </$DataColumn>
          {modifiedAt && (
            <$DataColumn>
              <$DataHeader>{t(`${translationBase}.common.saved`)}</$DataHeader>
              <$DataValue>{modifiedAt}</$DataValue>
            </$DataColumn>
          )}
          {submittedAt && (
            <$DataColumn>
              <$DataHeader>{t(`${translationBase}.common.sent`)}</$DataHeader>
              <$DataValue>{submittedAt}</$DataValue>
            </$DataColumn>
          )}
          {applicationNum && (
            <$DataColumn>
              <$DataHeader>
                {t(`${translationBase}.common.applicationNumber`)}
              </$DataHeader>
              <$DataValue>{applicationNum}</$DataValue>
            </$DataColumn>
          )}
          {statusText && (
            <$StatusDataColumn className={`list-item-status--${status}`}>
              <$DataHeader>{t(`${translationBase}.common.status`)}</$DataHeader>
              <$StatusDataValue>
                <StatusIcon status={status} />
                <span>{statusText}</span>
              </$StatusDataValue>
            </$StatusDataColumn>
          )}
          {validUntil && (
            <$DataColumn>
              <$DataHeader>
                {t(`${translationBase}.common.validUntil`)}
              </$DataHeader>
              <$DataValue>{validUntil}</$DataValue>
            </$DataColumn>
          )}
        </$ItemContent>
        <$ItemActions>
          <Button
            data-testid="application-edit-button"
            variant={
              status === APPLICATION_STATUSES.INFO_REQUIRED
                ? 'primary'
                : 'secondary'
            }
            iconLeft={ActionIcon && <ActionIcon />}
            theme={
              status === APPLICATION_STATUSES.INFO_REQUIRED ? 'coat' : 'black'
            }
            onClick={() => allowedAction.handleAction(false)}
            fullWidth
          >
            {allowedAction.label}
          </Button>
        </$ItemActions>
      </$ListItem>
      {Number(unreadMessagesCount) > 0 && (
        <$ListInfo>
          <$GridCell $colStart={2}>
            <$ListInfoInner onClick={() => allowedAction.handleAction(true)}>
              <IconSpeechbubbleText />
              <$ListInfoText>
                {t('common:applications.list.common.newMessages', {
                  count: unreadMessagesCount,
                })}
              </$ListInfoText>
            </$ListInfoInner>
          </$GridCell>
        </$ListInfo>
      )}
    </$ListItemWrapper>
  );
};

export default ListItem;
