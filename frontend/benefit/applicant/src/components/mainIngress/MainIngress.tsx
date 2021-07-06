import FrontPageContext from 'benefit/applicant/context/FrontPageContext';
import { Button, IconPlus } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import {
  StyledActionContainer,
  StyledContainer,
  StyledDescription,
  StyledHeading,
  StyledLink,
  StyledNotification,
  StyledTextContainer,
} from './styled';
import { useMainIngress } from './useMainIngress';

const MainIngress: React.FC = () => {
  const {
    handleNewApplicationClick,
    handleMoreInfoClick,
    t,
  } = useMainIngress();
  const { errors } = React.useContext(FrontPageContext);

  const notificationItems = errors?.map(({ message, name }) => (
    <StyledNotification key={`${name}-notification`} label={name} type="error">
      {message}
    </StyledNotification>
  ));

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <StyledContainer>
        <StyledHeading>{t('common:mainIngress.heading')}</StyledHeading>
        {notificationItems}
        <StyledTextContainer>
          <StyledDescription>
            {t('common:mainIngress.description1')}
            <StyledLink onClick={handleMoreInfoClick}>
              {t('common:mainIngress.linkText')}
            </StyledLink>
            {t('common:mainIngress.description2')}
          </StyledDescription>
          <StyledActionContainer>
            <Button
              iconLeft={<IconPlus />}
              onClick={handleNewApplicationClick}
              theme="coat"
            >
              {t('common:mainIngress.newApplicationBtnText')}
            </Button>
          </StyledActionContainer>
        </StyledTextContainer>
      </StyledContainer>
    </Container>
  );
};

export default MainIngress;
