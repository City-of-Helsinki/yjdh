import { IconPen } from 'hds-react';
import React from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import { useTranslation } from '../../../../i18n';
import { APPLICATION_STATUSES } from '../constants';
import {
  StyledAvatar,
  StyledDataColumn,
  StyledDataHeader,
  StyledDataValue,
  StyledHeading,
  StyledItemActions,
  StyledItemContent,
  StyledListItem,
  StyledListWrapper,
  StyledSecondaryButton,
  StyledWrapper,
} from '../styled';

const DraftApplicationsList = (): React.ReactElement => {
  const { t } = useTranslation();
  const translationBase = 'common:applications.list.drafts';

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <StyledWrapper>
        <StyledHeading>{t(`${translationBase}.heading`)}</StyledHeading>
        <StyledListWrapper>
          <StyledListItem>
            <StyledItemContent>
              <StyledAvatar status={APPLICATION_STATUSES.DRAFT}>
                JK
              </StyledAvatar>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationBase}.employee`)}
                </StyledDataHeader>
                <StyledDataValue>Annika Pesonen</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationBase}.saved`)}
                </StyledDataHeader>
                <StyledDataValue>08.05.2021</StyledDataValue>
              </StyledDataColumn>
            </StyledItemContent>
            <StyledItemActions>
              <StyledSecondaryButton variant="secondary" iconLeft={<IconPen />}>
                {t(`${translationBase}.edit`)}
              </StyledSecondaryButton>
            </StyledItemActions>
          </StyledListItem>
          <StyledListItem>
            <StyledItemContent>
              <StyledAvatar status={APPLICATION_STATUSES.DRAFT}>
                SR
              </StyledAvatar>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationBase}.employee`)}
                </StyledDataHeader>
                <StyledDataValue>Jaakko Nousiainen</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationBase}.saved`)}
                </StyledDataHeader>
                <StyledDataValue>11.05.2021</StyledDataValue>
              </StyledDataColumn>
            </StyledItemContent>
            <StyledItemActions>
              <StyledSecondaryButton variant="secondary" iconLeft={<IconPen />}>
                {t(`${translationBase}.edit`)}
              </StyledSecondaryButton>
            </StyledItemActions>
          </StyledListItem>
        </StyledListWrapper>
      </StyledWrapper>
    </Container>
  );
};

export default DraftApplicationsList;
