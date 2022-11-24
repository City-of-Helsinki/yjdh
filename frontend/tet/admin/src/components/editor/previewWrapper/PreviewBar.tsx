import { Button, IconArrowLeft, IconUpload } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useContext } from 'react';
import {
  $BackLink,
  $Bar,
  $BarWrapper,
  $PreviewText,
} from 'tet/admin/components/editor/previewWrapper/PreviewWrapper.sc';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import Container from 'tet-shared/components/container/Container';

type BarProps = {
  hasMargin?: boolean;
  allowPublish: boolean;
  onPublish: () => void;
};

const PreviewBar: React.FC<BarProps> = ({ hasMargin, allowPublish, onPublish }) => {
  const { setPreviewVisibility } = useContext(PreviewContext);
  const { t } = useTranslation();

  return (
    <$Bar style={hasMargin ? { marginBottom: '20px' } : {}}>
      <Container>
        <$BarWrapper style={{ minHeight: '3.5rem' }}>
          <$BackLink href="javascipt:void(0)" onClick={() => setPreviewVisibility(false)}>
            <IconArrowLeft />
            <span>{t('common:editor.backToEdit')}</span>
          </$BackLink>
          <$PreviewText>{t('common:editor.preview')}</$PreviewText>
          {allowPublish && (
            <Button onClick={onPublish} variant="success" iconLeft={<IconUpload />}>
              {t('common:editor.publish')}
            </Button>
          )}
        </$BarWrapper>
      </Container>
    </$Bar>
  );
};

PreviewBar.defaultProps = {
  hasMargin: false,
};

export default PreviewBar;
