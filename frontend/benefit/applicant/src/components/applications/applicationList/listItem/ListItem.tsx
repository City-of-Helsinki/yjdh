import { useTranslation } from 'benefit/applicant/i18n';
import { Button } from 'hds-react';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { DefaultTheme } from 'styled-components';

import SC from './ListItem.sc';

export interface ListItemData {
  id: string;
  name: string;
  avatar: {
    initials: string;
    color: keyof DefaultTheme['colors'];
  };
  statusText?: string;
  modifiedAt?: string;
  submittedAt?: string;
  applicationNum?: number;
  allowedAction: {
    label: string;
    handler: () => void;
    Icon?: React.FC;
  };
}

interface Loading {
  isLoading: true;
}

export type ListItemProps = ListItemData | Loading;

const ListItem: React.FC<ListItemProps> = (props) => {
  const { t } = useTranslation();
  const translationBase = 'common:applications.list.drafts';
  const translationListBase = 'common:applications.list.submitted';

  if ('isLoading' in props) {
    return (
      <SC.ListItem>
        <SC.ItemContent>
          <LoadingSkeleton width={60} height={60} circle />
          <SC.DataColumn>
            <LoadingSkeleton width="100%" />
            <LoadingSkeleton width="100%" />
          </SC.DataColumn>
        </SC.ItemContent>
        <SC.ItemActions>
          <LoadingSkeleton height="50px" />
        </SC.ItemActions>
      </SC.ListItem>
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
    <SC.ListItem>
      <SC.ItemContent>
        <SC.Avatar $backgroundColor={avatar.color}>{avatar.initials}</SC.Avatar>
        <SC.DataColumn>
          <SC.DataHeader>{t(`${translationBase}.employee`)}</SC.DataHeader>
          <SC.DataValue>{name}</SC.DataValue>
        </SC.DataColumn>
        {modifiedAt && (
          <SC.DataColumn>
            <SC.DataHeader>{t(`${translationBase}.saved`)}</SC.DataHeader>
            <SC.DataValue>{modifiedAt}</SC.DataValue>
          </SC.DataColumn>
        )}
        {submittedAt && (
          <SC.DataColumn>
            <SC.DataHeader>{t(`${translationListBase}.sent`)}</SC.DataHeader>
            <SC.DataValue>{submittedAt}</SC.DataValue>
          </SC.DataColumn>
        )}
        {applicationNum && (
          <SC.DataColumn>
            <SC.DataHeader>
              {t(`${translationListBase}.applicationNumber`)}
            </SC.DataHeader>
            <SC.DataValue>{applicationNum}</SC.DataValue>
          </SC.DataColumn>
        )}
        {statusText && (
          <SC.DataColumn>
            <SC.DataHeader>{t(`${translationListBase}.status`)}</SC.DataHeader>
            <SC.DataValue>{statusText}</SC.DataValue>
          </SC.DataColumn>
        )}
      </SC.ItemContent>
      <SC.ItemActions>
        <Button
          variant="secondary"
          iconLeft={ActionIcon && <ActionIcon />}
          theme="black"
          onClick={allowedAction.handler}
          fullWidth
        >
          {allowedAction.label}
        </Button>
      </SC.ItemActions>
    </SC.ListItem>
  );
};

export default ListItem;
