import React from 'react';
import {
  $Bar,
  $BarWrapper,
  $BackLink,
  $PreviewText,
} from 'tet/admin/components/editor/previewWrapper/PreviewWrapper.sc';
import { Button } from 'hds-react';
import Container from 'tet/shared/components/container/Container';
import { IconArrowLeft, IconUpload } from 'hds-react';

const PreviewBar: React.FC = () => {
  return (
    <$Bar>
      <Container>
        <$BarWrapper>
          <$BackLink>
            <IconArrowLeft />
            <span>Takaisin lomakkeelle</span>
          </$BackLink>
          <$PreviewText>ESIKATSELU</$PreviewText>
          <Button variant="success" iconLeft={<IconUpload />}>
            Julkaise
          </Button>
        </$BarWrapper>
      </Container>
    </$Bar>
  );
};

const PreviewWrapper: React.FC = ({ children }) => {
  return (
    <>
      <PreviewBar />
      <div>{children}</div>
      <PreviewBar />
    </>
  );
};

export default PreviewWrapper;
