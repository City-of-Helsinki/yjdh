import MainIngress from 'benefit/applicant/components/mainIngress/MainIngress';
import { useTranslation } from 'benefit/applicant/i18n';
import * as React from 'react';

const DecisionsMainIngress: React.FC = () => {
  const { t } = useTranslation();
  return (
    <MainIngress
      heading={t('common:mainIngress.decisions.heading')}
      description={<>{t('common:mainIngress.decisions.description')}</>}
    />
  );
};

export default DecisionsMainIngress;
