import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { TextArea, NumberInput } from 'hds-react';
import { $CompanyInfoRow } from 'tet/admin/components/editor/companyInfo/CompanyInfo.sc';
import DateInput from 'shared/components/forms/inputs/DateInput';
import TetPosting from 'tet/admin/types/tetposting';
import TextInput from 'shared/components/forms/inputs/TextInput';

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
        <$GridCell $colSpan={6}>
          <TextInput<TetPosting>
            id="title"
            label={t('common:editor.posting.title')}
            placeholder={t('common:editor.posting.title')}
            registerOptions={{
              required: true,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput<TetPosting> id="start_date" label="Alkaen *" />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput<TetPosting>
            id="end_date"
            label="Päättyen"
            registerOptions={{
              required: false,
            }}
          />
        </$GridCell>
      </$GridCell>
      <$GridCell $colSpan={12}>
        <$CompanyInfoRow>Työaika on aina sama 30h per viikko.</$CompanyInfoRow>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <NumberInput
          id="job-count-selector"
          helperText="Assistive text"
          label="Työharjoittelupaikkoja"
          minusStepButtonAriaLabel="Decrease by one"
          plusStepButtonAriaLabel="Increase by one"
          step={1}
          defaultValue={3}
        />
      </$GridCell>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={6}>
          <TextInput<TetPosting> type="textArea" id="description" label={t('common:editor.posting.description')} />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default PostingDetails;
