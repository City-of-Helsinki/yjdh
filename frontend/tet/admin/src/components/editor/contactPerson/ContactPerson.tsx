import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import TetPosting from 'tet-shared/types/tetposting';
import TextInput from 'tet/admin/components/editor/TextInput';
import { EditorSectionProps } from 'tet/admin/components/editor/Editor';
import PhoneInput from 'tet/admin/components/editor/PhoneInput';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';

const ContactPerson: React.FC = () => {
  const { t } = useTranslation();
  const { required, name, email, phone } = useValidationRules();
  const theme = useTheme();

  return (
    <FormSection header={t('common:editor.employerInfo.contactPerson')}>
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
            registerOptions={name}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <TextInput
            id="contact_last_name"
            label={t('common:editor.posting.contactLastName')}
            placeholder={t('common:editor.posting.contactLastName')}
            registerOptions={name}
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <PhoneInput
            id="contact_phone"
            label={t('common:editor.posting.contactPhone')}
            placeholder={t('common:editor.posting.contactPhone')}
            registerOptions={phone}
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
    </FormSection>
  );
};

export default ContactPerson;
