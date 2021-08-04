import { useTranslation } from 'benefit/applicant/i18n';
import { ApplicationListItemData } from 'benefit/applicant/types/application';
import { Loading } from 'benefit/applicant/types/common';
import { Button } from 'hds-react';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';

import {
  $Avatar,
  $DataColumn,
  $DataHeader,
  $DataValue,
  $ItemActions,
  $ItemContent,
  $ListItem,
} from './ListItem.sc';

export type ListItemProps = ApplicationListItemData | Loading;

const ListItem: React.FC<ListItemProps> = (props) => {
  const { t } = useTranslation();
  const translationBase = 'common:applications.list.drafts';
  const translationListBase = 'common:applications.list.submitted';

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
    modifiedAt,
    submittedAt,
    applicationNum,
    allowedAction,
  } = props;

  const ActionIcon = allowedAction.Icon;

  return (
    <$ListItem>
      <$ItemContent>
        <$Avatar $backgroundColor={avatar.color}>{avatar.initials}</$Avatar>
        <$DataColumn>
          <$DataHeader>{t(`${translationBase}.employee`)}</$DataHeader>
          <$DataValue>{name}</$DataValue>
        </$DataColumn>
        {modifiedAt && (
          <$DataColumn>
            <$DataHeader>{t(`${translationBase}.saved`)}</$DataHeader>
            <$DataValue>{modifiedAt}</$DataValue>
          </$DataColumn>
        )}
        {submittedAt && (
          <$DataColumn>
            <$DataHeader>{t(`${translationListBase}.sent`)}</$DataHeader>
            <$DataValue>{submittedAt}</$DataValue>
          </$DataColumn>
        )}
        {applicationNum && (
          <$DataColumn>
            <$DataHeader>
              {t(`${translationListBase}.applicationNumber`)}
            </$DataHeader>
            <$DataValue>{applicationNum}</$DataValue>
          </$DataColumn>
        )}
        {statusText && (
          <$DataColumn>
            <$DataHeader>{t(`${translationListBase}.status`)}</$DataHeader>
            <$DataValue>{statusText}</$DataValue>
          </$DataColumn>
        )}
      </$ItemContent>
      <$ItemActions>
        <Button
          variant="secondary"
          iconLeft={ActionIcon && <ActionIcon />}
          theme="black"
          onClick={allowedAction.handleAction}
          fullWidth
        >
          {allowedAction.label}
        </Button>
      </$ItemActions>
    </$ListItem>
  );
};

export default ListItem;
