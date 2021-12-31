// TODO a good reference what this should look like is benefit/applicant/src/components/applications/forms/application/step1/companyInfo/CompanyInfo.tsx

import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { Checkbox, TextInput } from 'hds-react';
import { $CompanyInfoRow } from 'tet/admin/components/editor/companyInfo/CompanyInfo.sc';

const CompanyInfo: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <FormSection header={t('common:editor.employerInfo.header')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={12}>
          <$CompanyInfoRow>Helsingin kaupunki</$CompanyInfoRow>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <Checkbox id="company-address-checkbox" label={t('common:editor.employerInfo.addressNeededLabel')} />
        </$GridCell>
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={6}>
            <TextInput
              id="company-address-department"
              label={t('common:editor.employerInfo.departmentLabel')}
              placeholder={t('common:editor.employerInfo.departmentLabel')}
            />
          </$GridCell>
        </$GridCell>
        <$GridCell $colSpan={5}>
          <TextInput id="company-address-department" label="Osoite *" />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <TextInput id="company-address-department" label="Postinumero *" />
        </$GridCell>
        <$GridCell $colSpan={5}>
          <TextInput id="company-address-department" label="Postitoimipaikka *" />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default CompanyInfo;
