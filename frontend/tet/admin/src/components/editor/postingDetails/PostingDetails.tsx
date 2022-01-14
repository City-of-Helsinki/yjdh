import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { TextInput, TextArea } from 'hds-react';
import { $CompanyInfoRow } from 'tet/admin/components/editor/companyInfo/CompanyInfo.sc';

const PostingDetails: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <FormSection header={t('common:editor.posting.header')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={6}>
            <TextInput
              id="company-address-department"
              label={t('common:editor.posting.title')}
              placeholder={t('common:editor.posting.title')}
            />
          </$GridCell>
          <$GridCell $colSpan={6}>
            <TextArea
              id="textarea"
              label={t('common:editor.posting.description')}
              helperText="Assistive text"
              required
            />
          </$GridCell>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default PostingDetails;
