import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Container from 'shared/components/container/Container';

import { $SupportingContentSection } from './SupportingContent.sc';

const SupportingContent: React.FC = () => {
  const { t } = useTranslation();
  const translationBase = 'common:supportingContent';

  const sections = [
    {
      id: 'contact',
      title: t(`${translationBase}.contact.title`),
      text: t(`${translationBase}.contact.text`),
    },
  ];

  return (
    <Container>
      {sections.map((section) => (
        <$SupportingContentSection key={section.id}>
          {section.text}
        </$SupportingContentSection>
      ))}
    </Container>
  );
};

export default SupportingContent;
