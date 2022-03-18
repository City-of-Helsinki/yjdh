import React from 'react';
import Container from 'shared/components/container/Container';
import { $Banner, $BannerWrapper, $Title, $ImageWrapper } from './Banner.sc';
import useMediaQuery from 'shared/hooks/useMediaQuery';
import Image from 'next/image';
import { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

const Banner = () => {
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
              <img src="/lippakioski.png" alt="canteen counter" />
            </$ImageWrapper>
          )}
        </$BannerWrapper>
      </Container>
    </$Banner>
  );
};

export default Banner;
