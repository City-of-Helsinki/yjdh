import React from 'react';
import Container from 'shared/components/container/Container';
import { $Banner, $Title } from './Banner.sc';

const Banner = () => {
  return (
    <$Banner>
      <Container>
        <$Title>Muistathan etsiä TET-paikkasi ajoissa</$Title>
      </Container>
    </$Banner>
  );
};

export default Banner;
