import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { Notification } from 'hds-react';

const EmployerInfo: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <FormSection withoutDivider={true} header={t('common:editor.companyInfo')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={6}>
            <$GridCell as={$Grid} $colSpan={12}>
              <$GridCell $colSpan={6}>
                <div>Herkkulautanne Oy TEST</div>
                <div>Y-tunnus: 2114560-2 TEST</div>
              </$GridCell>
              <$GridCell $colSpan={6}>
                <div>Keskuskatu 13 A 11 TEST</div>
                <div>00100 Helsinki TEST</div>
              </$GridCell>
            </$GridCell>
          </$GridCell>
          <$GridCell $colSpan={6}>
            <Notification size="small">{t('common:editor.companyInfoFetch')}</Notification>
          </$GridCell>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default EmployerInfo;
