import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Container from 'shared/components/container/Container';

import { $SupportingContentSection } from './SupportingContent.sc';

const SupportingContent: React.FC = () => {
  const { t } = useTranslation();
  const translationBase = 'common:supportingContent';

  return (
    <Container>
      <$SupportingContentSection>
        {t(`${translationBase}.contact.text`)}
      </$SupportingContentSection>
    </Container>
  );
};

export default SupportingContent;
