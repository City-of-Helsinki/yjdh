import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';

import { $SupportingContentSection } from './SupportingContent.sc';

const SupportingContent: React.FC = () => {
  const { t } = useTranslation();
  const translationBase = 'common:supportingContent';

  const emailAddress = t(`${translationBase}.contact.emailAddress`);
  const href = `mailto:${emailAddress}`;

  return (
    <Container>
      <$SupportingContentSection>
        <span>{t(`${translationBase}.contact.text`)} </span>
        <a href={href}>{emailAddress}</a>
        <span>.</span>
      </$SupportingContentSection>
    </Container>
  );
};

export default SupportingContent;
