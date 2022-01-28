import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import TetPosting from 'tet/admin/types/tetposting';
import TextInput from 'tet/admin/components/editor/TextInput';
import { EditorSectionProps } from 'tet/admin/components/editor/Editor';
import PhoneInput from 'tet/admin/components/editor/PhoneInput';
import Dropdown from 'tet/admin/components/editor/Dropdown';
import { EMAIL_REGEX, NAMES_REGEX, PHONE_NUMBER_REGEX } from 'shared/constants';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';

const ContactPerson: React.FC<EditorSectionProps> = ({ initialValue }) => {
  const { t } = useTranslation();
  const { required, maxLength, email } = useValidationRules();
  const theme = useTheme();
  const languageOptions = [
    { value: 'fi', label: t('common:editor.posting.contactLanguageFi') },
    { value: 'sv', label: t('common:editor.posting.contactLanguageSv') },
    { value: 'en', label: t('common:editor.posting.contactLanguageEn') },
  ];

  console.log(required);
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
          <TextInput
            id="contact_first_name"
            label={t('common:editor.posting.contactFirstName')}
            placeholder={t('common:editor.posting.contactFirstName')}
            registerOptions={{
              required: required,
              pattern: NAMES_REGEX,
              maxLength: 128,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <TextInput
            id="contact_last_name"
            label={t('common:editor.posting.contactLastName')}
            placeholder={t('common:editor.posting.contactLastName')}
            registerOptions={{
              required: required,
              pattern: NAMES_REGEX,
              maxLength: 128,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <PhoneInput
            id="contact_phone"
            label={t('common:editor.posting.contactPhone')}
            placeholder={t('common:editor.posting.contactPhone')}
            registerOptions={{
              required: {
                value: true,
                message: t('common:editor.posting.validation.required'),
              },
              maxLength: 64,
              pattern: PHONE_NUMBER_REGEX,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={4}>
          <TextInput
            id="contact_email"
            label={t('common:editor.posting.contactEmail')}
            placeholder={t('common:editor.posting.contactEmail')}
            registerOptions={email}
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
            initialValue={languageOptions[0]}
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

export default ContactPerson;
