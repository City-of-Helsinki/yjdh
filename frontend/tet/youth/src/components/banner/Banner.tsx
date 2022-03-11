import React from 'react';
import Container from 'shared/components/container/Container';
import { $Banner, $BannerWrapper, $Title, $ImageWrapper } from './Banner.sc';
import useMediaQuery from 'shared/hooks/useMediaQuery';
import Image from 'next/image';
import { useTheme } from 'styled-components';

const Banner = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(`(min-width: ${theme.breakpoints.s})`);

  return (
    <$Banner>
      <Container>
        <$BannerWrapper>
          <$Title>Muistathan etsiä TET-paikkasi ajoissa</$Title>
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
