import { useTranslation } from 'benefit/applicant/i18n';
import { ApplicationListItemData } from 'benefit/applicant/types/application';
import { Loading } from 'benefit/applicant/types/common';
import { Button } from 'hds-react';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';

import {
  StyledAvatar,
  StyledDataColumn,
  StyledDataHeader,
  StyledDataValue,
  StyledItemActions,
  StyledItemContent,
  StyledListItem,
} from './styled';

export type ListItemProps = ApplicationListItemData | Loading;

const ListItem: React.FC<ListItemProps> = (props) => {
  const { t } = useTranslation();
  const translationBase = 'common:applications.list.drafts';
  const translationListBase = 'common:applications.list.submitted';

  if ('isLoading' in props) {
    return (
      <StyledListItem>
        <StyledItemContent>
          <LoadingSkeleton width={60} height={60} circle />
          <StyledDataColumn>
            <LoadingSkeleton width="100%" />
            <LoadingSkeleton width="100%" />
          </StyledDataColumn>
        </StyledItemContent>
        <StyledItemActions>
          <LoadingSkeleton height="50px" />
        </StyledItemActions>
      </StyledListItem>
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
    <StyledListItem>
      <StyledItemContent>
        <StyledAvatar $backgroundColor={avatar.color}>
          {avatar.initials}
        </StyledAvatar>
        <StyledDataColumn>
          <StyledDataHeader>
            {t(`${translationBase}.employee`)}
          </StyledDataHeader>
          <StyledDataValue>{name}</StyledDataValue>
        </StyledDataColumn>
        {modifiedAt && (
          <StyledDataColumn>
            <StyledDataHeader>{t(`${translationBase}.saved`)}</StyledDataHeader>
            <StyledDataValue>{modifiedAt}</StyledDataValue>
          </StyledDataColumn>
        )}
        {submittedAt && (
          <StyledDataColumn>
            <StyledDataHeader>
              {t(`${translationListBase}.sent`)}
            </StyledDataHeader>
            <StyledDataValue>{submittedAt}</StyledDataValue>
          </StyledDataColumn>
        )}
        {applicationNum && (
          <StyledDataColumn>
            <StyledDataHeader>
              {t(`${translationListBase}.applicationNumber`)}
            </StyledDataHeader>
            <StyledDataValue>{applicationNum}</StyledDataValue>
          </StyledDataColumn>
        )}
        {statusText && (
          <StyledDataColumn>
            <StyledDataHeader>
              {t(`${translationListBase}.status`)}
            </StyledDataHeader>
            <StyledDataValue>{statusText}</StyledDataValue>
          </StyledDataColumn>
        )}
      </StyledItemContent>
      <StyledItemActions>
        <Button
          variant="secondary"
          iconLeft={ActionIcon && <ActionIcon />}
          theme="black"
          onClick={allowedAction.handleAction}
          fullWidth
        >
          {allowedAction.label}
        </Button>
      </StyledItemActions>
    </StyledListItem>
  );
};

export default ListItem;
