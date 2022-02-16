import React, { useContext } from 'react';
import {
  $Bar,
  $BarWrapper,
  $BackLink,
  $PreviewText,
} from 'tet/admin/components/editor/previewWrapper/PreviewWrapper.sc';
import { Button } from 'hds-react';
import Container from 'tet/shared/src/components/container/Container';
import { IconArrowLeft, IconUpload } from 'hds-react';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import { useTranslation } from 'next-i18next';

const PreviewBar: React.FC = () => {
  const { setPreviewVisibility } = useContext(PreviewContext);
  const { t } = useTranslation();

  return (
    <$Bar>
      <Container>
        <$BarWrapper>
          <$BackLink onClick={() => setPreviewVisibility(false)}>
            <IconArrowLeft />
            <span>{t('common:editor.backToEdit')}</span>
          </$BackLink>
          <$PreviewText>{t('common:editor.preview')}</$PreviewText>
          <Button variant="success" iconLeft={<IconUpload />}>
            {t('common:editor.publish')}
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
