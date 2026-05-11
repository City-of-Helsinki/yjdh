import { ROUTES } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
  IconAlertCircleFill,
  IconPen,
} from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { DefaultTheme } from 'styled-components';

import {
  $Avatar,
  $DataColumn,
  $DataHeader,
  $DataValue,
  $ItemContent,
  $ListItem,
  $ListItemWrapper,
  $StatusDataColumn,
  $StatusDataValue,
} from './ListItem.sc';

export type SecondInstalmentListItemProps = ApplicationListItemData;

const $StatusText = styled.span`
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.summerDark};
  display: inline-flex;
  align-items: center;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs3};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs3}
    ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
`;

const SecondInstalmentListItem: React.FC<SecondInstalmentListItemProps> = ({
  avatar,
  contactPersonName,
  name,
  submittedAt,
  applicationNum,
  secondInstalmentDueDate,
  id,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const translationBase = 'common:applications.list';

  return (
    <$ListItemWrapper>
      <$ListItem>
        <$ItemContent>
          <$Avatar $backgroundColor="summerDark" title={contactPersonName}>
            {avatar?.initials}
          </$Avatar>

          <$DataColumn>
            <$DataHeader>{t(`${translationBase}.common.employee`)}</$DataHeader>
            <$DataValue>{name}</$DataValue>
          </$DataColumn>

          <$DataColumn>
            <$DataHeader>{t(`${translationBase}.common.sent`)}</$DataHeader>
            <$DataValue>{submittedAt}</$DataValue>
          </$DataColumn>

          <$DataColumn>
            <$DataHeader>
              {t(`${translationBase}.common.applicationNumber`)}
            </$DataHeader>
            <$DataValue>{applicationNum}</$DataValue>
          </$DataColumn>

          <$StatusDataColumn>
            <$DataHeader>{t(`${translationBase}.common.status`)}</$DataHeader>
            <$StatusDataValue>
              <$StatusText>
                <IconAlertCircleFill aria-hidden="true" />
                <span>
                  {t(`${translationBase}.secondInstalments.prompt1`)}{' '}
                  {secondInstalmentDueDate}{' '}
                  {t(`${translationBase}.secondInstalments.prompt2`)}
                </span>
              </$StatusText>
            </$StatusDataValue>
          </$StatusDataColumn>

          <$DataColumn>
            <Button
              iconStart={<IconPen />}
              variant={ButtonVariant.Primary}
              theme={ButtonPresetTheme.Coat}
              onClick={() =>
                router.push(`${ROUTES.SECOND_INSTALMENT_UPLOAD}?id=${id ?? ''}`)
              }
            >
              {t(`${translationBase}.secondInstalments.button`)}
            </Button>
          </$DataColumn>
        </$ItemContent>
      </$ListItem>
    </$ListItemWrapper>
  );
};

export default SecondInstalmentListItem;
