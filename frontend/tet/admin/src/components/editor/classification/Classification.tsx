import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { Language } from 'shared/i18n/i18n';
import { useTheme } from 'styled-components';
import Combobox from 'tet/admin/components/editor/Combobox';
import EditorLoadingError from 'tet/admin/components/editor/EditorLoadingError';
import SelectionGroup from 'tet/admin/components/editor/SelectionGroup';
import { getWorkKeywords, keywordToOptionType } from 'tet-shared/backend-api/linked-events-api';
import useKeywordType from 'tet-shared/hooks/backend/useKeywordType';
import { OptionType } from 'tet-shared/types/classification';
import TetPosting from 'tet-shared/types/tetposting';

export type FilterFunction = (options: OptionType[], search: string) => OptionType[];

const Classification: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = React.useState('');
  const { getValues } = useFormContext<TetPosting>();
  const methodsAndFeatures = useKeywordType();

  const keywordsResults = useQuery(['keywords', search], () => getWorkKeywords(search), { enabled: !!search });

  const keywords = React.useMemo(
    () =>
      !keywordsResults.isLoading && keywordsResults.data
        ? keywordsResults.data.map((k) => keywordToOptionType(k, i18n.language as Language))
        : [],
    [i18n.language, keywordsResults.data, keywordsResults.isLoading],
  );

  if (methodsAndFeatures.isLoading) {
    return <div>Lataa</div>;
  }

  const filterHandler: FilterFunction = (options, searchText) => {
    setSearch(searchText);
    return options;
  };

  if (methodsAndFeatures.error) {
    return <EditorLoadingError error={methodsAndFeatures.error} />;
  }
  const isSetRule = (): string | true =>
    getValues('keywords_working_methods').length > 0 ? true : t<string>('common:editor.posting.validation.isSet');

  return (
    <FormSection header={t('common:editor.classification.classifications')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={4}>
          <SelectionGroup
            required
            testId="posting-form-keywords_working_methods"
            fieldId="keywords_working_methods"
            label={t('common:editor.classification.workMethod')}
            rules={isSetRule}
            options={methodsAndFeatures.workMethodsList}
          />
        </$GridCell>
        <$GridCell $colSpan={4}>
          <SelectionGroup
            required={false}
            testId="posting-form-keywords_attributes"
            fieldId="keywords_attributes"
            label={t('common:editor.classification.workFeature')}
            options={methodsAndFeatures.workFeaturesList}
          />
        </$GridCell>
        <$GridCell $colSpan={4}>
          <Combobox<OptionType>
            id="keywords"
            testId="posting-form-keywords"
            multiselect
            required={false}
            label={t('common:editor.classification.keywords')}
            placeholder={t('common:editor.classification.search')}
            options={keywords}
            optionLabelField="label"
            filter={filterHandler}
          />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default Classification;
