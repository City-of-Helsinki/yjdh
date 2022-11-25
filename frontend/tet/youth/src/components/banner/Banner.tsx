import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import useMediaQuery from 'shared/hooks/useMediaQuery';
import { useTheme } from 'styled-components';

import { $Banner, $BannerWrapper, $ImageWrapper, $Title } from './Banner.sc';

const Banner: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(`(min-width: ${theme.breakpoints.s})`);
  const { t } = useTranslation();

  return (
    <$Banner>
      <Container>
        <$BannerWrapper>
          <$Title>{t('common:frontPage.heading')}</$Title>
          {isSmall && (
            <$ImageWrapper>
              {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
              <img src="/lippakioski.png" />
            </$ImageWrapper>
          )}
        </$BannerWrapper>
      </Container>
    </$Banner>
  );
};

export default Banner;
