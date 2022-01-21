import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { $CompanyInfoRow } from 'tet/admin/components/editor/companyInfo/CompanyInfo.sc';
import TetPosting from 'tet/admin/types/tetposting';
import TextInput from 'shared/components/forms/inputs/TextInput';
import { EditorSectionProps } from 'tet/admin/components/editor/Editor';
import PhoneInput from 'tet/admin/components/editor/PhoneInput';
import Dropdown from 'tet/admin/components/editor/Dropdown';

const PostingDetails: React.FC<EditorSectionProps> = ({ initialValue }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const languageOptions = [
    { value: 'fi', label: t('common:editor.posting.contactLanguageFi') },
    { value: 'sv', label: t('common:editor.posting.contactLanguageSv') },
    { value: 'en', label: t('common:editor.posting.contactLanguageEn') },
  ];
  console.log(initialValue, 'editorProps');
  return (
    <FormSection header={t('common:editor.posting.header')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={3}>
          <TextInput<TetPosting>
            id="contact_first_name"
            initialValue={initialValue.contact_first_name}
            label={t('common:editor.posting.contactFirstName')}
            placeholder={t('common:editor.posting.contactFirstName')}
            registerOptions={{
              required: true,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <TextInput<TetPosting>
            id="contact_last_name"
            initialValue={initialValue.contact_last_name}
            label={t('common:editor.posting.contactLastName')}
            placeholder={t('common:editor.posting.contactLastName')}
            registerOptions={{
              required: true,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <PhoneInput
            id="contact_phone"
            initialValue={initialValue.contact_phone}
            label={t('common:editor.posting.contactPhone')}
            placeholder={t('common:editor.posting.contactPhone')}
            registerOptions={{
              required: true,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={4}>
          <TextInput<TetPosting>
            id="contact_email"
            initialValue={initialValue.contact_email}
            label={t('common:editor.posting.contactEmail')}
            placeholder={t('common:editor.posting.contactEmail')}
            registerOptions={{
              required: true,
            }}
          />
        </$GridCell>
      </$GridCell>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={3}>
          <Dropdown
            id="contact_language"
            options={languageOptions}
            initialValue={initialValue.contact_language}
            label={t('common:editor.posting.contactLanguage')}
            registerOptions={{
              required: true,
            }}
          />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default PostingDetails;
