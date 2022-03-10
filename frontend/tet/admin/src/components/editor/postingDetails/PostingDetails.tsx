import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { $CompanyInfoRow } from 'tet/admin/components/editor/companyInfo/CompanyInfo.sc';
import DateInput from 'tet/admin/components/editor/DateInput';
import TextInput from 'tet/admin/components/editor/TextInput';
import TextArea from 'tet/admin/components/editor/TextArea';
import NumberInput from 'tet/admin/components/editor/NumberInput';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';
import { Notification } from 'hds-react';
import { OptionType } from 'tet-shared/types/classification';
import Dropdown from 'tet/admin/components/editor/Dropdown';
import Combobox from 'tet/admin/components/editor/Combobox';
import useLanguageOptions from 'tet-shared/hooks/translation/useLanguageOptions';

const PostingDetails: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { required, name, description } = useValidationRules();

  const languageOptions = useLanguageOptions();

  return (
    <FormSection header={t('common:editor.posting.header')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={6}>
          <TextInput
            id="title"
            label={t('common:editor.posting.title')}
            placeholder={t('common:editor.posting.title')}
            registerOptions={name}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput
            id="start_date"
            label={t('common:editor.posting.startDateLabel')}
            required={true}
            registerOptions={{ required: required }}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput id="end_date" label={t('common:editor.posting.endDateLabel')} required={false} />
        </$GridCell>
        <$GridCell $colSpan={3}></$GridCell>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <NumberInput
          id="spots"
          label={t('common:editor.posting.spotsLabel')}
          registerOptions={{ required: required }}
          required={true}
        />
      </$GridCell>
      <$GridCell $colSpan={3}>
        <Dropdown
          id="languages"
          options={languageOptions}
          initialValue={[languageOptions[0]]}
          label={t('common:editor.posting.contactLanguage')}
          registerOptions={{
            required: required,
          }}
        />
      </$GridCell>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={6}>
          <Notification size="small">{t('common:editor.posting.workHoursNotice')}</Notification>
        </$GridCell>
      </$GridCell>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={12}>
          <TextArea
            id="description"
            label={t('common:editor.posting.description')}
            // registerOptions={description}
            required={true}
          />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default PostingDetails;
