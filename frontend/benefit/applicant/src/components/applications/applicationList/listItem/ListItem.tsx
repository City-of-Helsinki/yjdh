import { APPLICATION_STATUSES } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { ApplicationListItemData } from 'benefit/applicant/types/application';
import { Loading } from 'benefit/applicant/types/common';
import { Button, IconSpeechbubbleText, StatusLabel } from 'hds-react';
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
  $ItemInfo,
  $ItemInfoInner,
  $ItemInfoText,
  $ListItem,
  $ListItemWrapper,
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
    avatar,
    statusText,
    createdAt,
    submittedAt,
    applicationNum,
    allowedAction,
    editEndDate,
    status,
  } = props;

  const ActionIcon = allowedAction.Icon;

  return (
    <$ListItemWrapper>
      <$ListItem>
        <$ItemContent>
          <$Avatar $backgroundColor={avatar.color}>{avatar.initials}</$Avatar>
          <$DataColumn>
            <$DataHeader>{t(`${translationBase}.common.employee`)}</$DataHeader>
            <$DataValue>{name}</$DataValue>
          </$DataColumn>
          {createdAt && (
            <$DataColumn>
              <$DataHeader>
                {t(`${translationBase}.common.created`)}
              </$DataHeader>
              <$DataValue>{createdAt}</$DataValue>
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
            <$DataColumn>
              <$DataHeader>{t(`${translationBase}.common.status`)}</$DataHeader>
              <$DataValue>{statusText}</$DataValue>
            </$DataColumn>
          )}
          {editEndDate && (
            <$DataColumn>
              <$DataHeader>
                {t(`${translationBase}.common.editEndDate`)}
              </$DataHeader>
              <StatusLabel type="alert">{editEndDate}</StatusLabel>
            </$DataColumn>
          )}
        </$ItemContent>
        <$ItemActions>
          <Button
            variant={
              status === APPLICATION_STATUSES.INFO_REQUIRED
                ? 'primary'
                : 'secondary'
            }
            iconLeft={ActionIcon && <ActionIcon />}
            theme={
              status === APPLICATION_STATUSES.INFO_REQUIRED ? 'coat' : 'black'
            }
            onClick={allowedAction.handleAction}
            fullWidth
          >
            {allowedAction.label}
          </Button>
        </$ItemActions>
      </$ListItem>
      {status === APPLICATION_STATUSES.INFO_REQUIRED && (
        <$ItemInfo>
          <$GridCell $colStart={2}>
            <$ItemInfoInner>
              <IconSpeechbubbleText />
              <$ItemInfoText>1 uusi viesti</$ItemInfoText>
            </$ItemInfoInner>
          </$GridCell>
        </$ItemInfo>
      )}
    </$ListItemWrapper>
  );
};

export default ListItem;
