import { useTranslation } from 'benefit/applicant/i18n';
import { IconPen } from 'hds-react';
import React from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

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
  StyledPrimaryButton,
  StyledSecondaryButton,
  StyledWrapper,
} from '../styled';

const SubmittedApplicationsList: React.FC = () => {
  const { t } = useTranslation();
  const translationListBase = 'common:applications.list.submitted';
  const translationStatusBase = 'common:applications.statuses';

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <StyledWrapper>
        <StyledHeading>{t(`${translationListBase}.heading`)}</StyledHeading>
        <StyledListWrapper>
          <StyledListItem>
            <StyledItemContent>
              <StyledAvatar status={APPLICATION_STATUSES.INFO_REQUIRED}>
                TR
              </StyledAvatar>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.employee`)}
                </StyledDataHeader>
                <StyledDataValue>Teemu Rantamäki</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.sent`)}
                </StyledDataHeader>
                <StyledDataValue>13.05.2021</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.applicationNumber`)}
                </StyledDataHeader>
                <StyledDataValue>341459</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.status`)}
                </StyledDataHeader>
                <StyledDataValue>
                  {t(`${translationStatusBase}.infoRequired`)}
                </StyledDataValue>
              </StyledDataColumn>
            </StyledItemContent>
            <StyledItemActions>
              <StyledPrimaryButton iconLeft={<IconPen />}>
                {t(`${translationListBase}.edit`)}
              </StyledPrimaryButton>
            </StyledItemActions>
          </StyledListItem>
          <StyledListItem>
            <StyledItemContent>
              <StyledAvatar status={APPLICATION_STATUSES.RECEIVED}>
                TR
              </StyledAvatar>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.employee`)}
                </StyledDataHeader>
                <StyledDataValue>Teemu Rantamäki</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.sent`)}
                </StyledDataHeader>
                <StyledDataValue>13.05.2021</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.applicationNumber`)}
                </StyledDataHeader>
                <StyledDataValue>341459</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.status`)}
                </StyledDataHeader>
                <StyledDataValue>
                  {t(`${translationStatusBase}.received`)}
                </StyledDataValue>
              </StyledDataColumn>
            </StyledItemContent>
            <StyledItemActions>
              <StyledSecondaryButton variant="secondary">
                {t(`${translationListBase}.check`)}
              </StyledSecondaryButton>
            </StyledItemActions>
          </StyledListItem>
          <StyledListItem>
            <StyledItemContent>
              <StyledAvatar status={APPLICATION_STATUSES.APPROVED}>
                TR
              </StyledAvatar>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.employee`)}
                </StyledDataHeader>
                <StyledDataValue>Teemu Rantamäki</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.sent`)}
                </StyledDataHeader>
                <StyledDataValue>13.05.2021</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.applicationNumber`)}
                </StyledDataHeader>
                <StyledDataValue>341459</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.status`)}
                </StyledDataHeader>
                <StyledDataValue>
                  {t(`${translationStatusBase}.approved`)}
                </StyledDataValue>
              </StyledDataColumn>
            </StyledItemContent>
            <StyledItemActions>
              <StyledSecondaryButton variant="secondary">
                {t(`${translationListBase}.check`)}
              </StyledSecondaryButton>
            </StyledItemActions>
          </StyledListItem>
          <StyledListItem>
            <StyledItemContent>
              <StyledAvatar status={APPLICATION_STATUSES.REJECTED}>
                TR
              </StyledAvatar>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.employee`)}
                </StyledDataHeader>
                <StyledDataValue>Teemu Rantamäki</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.sent`)}
                </StyledDataHeader>
                <StyledDataValue>13.05.2021</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.applicationNumber`)}
                </StyledDataHeader>
                <StyledDataValue>341459</StyledDataValue>
              </StyledDataColumn>
              <StyledDataColumn>
                <StyledDataHeader>
                  {t(`${translationListBase}.status`)}
                </StyledDataHeader>
                <StyledDataValue>
                  {t(`${translationStatusBase}.rejected`)}
                </StyledDataValue>
              </StyledDataColumn>
            </StyledItemContent>
            <StyledItemActions>
              <StyledSecondaryButton variant="secondary">
                {t(`${translationListBase}.check`)}
              </StyledSecondaryButton>
            </StyledItemActions>
          </StyledListItem>
        </StyledListWrapper>
      </StyledWrapper>
    </Container>
  );
};

export default SubmittedApplicationsList;
