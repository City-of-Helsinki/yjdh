import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import {
  getWorkMethods,
  getWorkFeatures,
  getWorkKeywords,
  keywordToOptionType,
} from 'tet/admin/backend-api/linked-events-api';
import { useQuery, useQueries } from 'react-query';
import { OptionType } from 'tet-shared/types/classification';
import Combobox from 'tet/admin/components/editor/Combobox';
import SelectionGroup from 'tet/admin/components/editor/SelectionGroup';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet-shared/types/tetposting';
import EditorLoadingError from 'tet/admin/components/editor/EditorLoadingError';

export type FilterFunction = (options: OptionType[], search: string) => OptionType[];

const Classification: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = React.useState('');
  const { getValues } = useFormContext<TetPosting>();

  const results = useQueries([
    { queryKey: 'workMethods', queryFn: getWorkMethods },
    { queryKey: 'workFeatures', queryFn: getWorkFeatures },
  ]);

  const keywordsResults = useQuery(['keywords', search], () => getWorkKeywords(search));

  const keywords =
    !keywordsResults.isLoading && keywordsResults.data ? keywordsResults.data.map((k) => keywordToOptionType(k)) : [];

  const [workMethods, workFeatures] = results;

  if (workMethods.isLoading || workFeatures.isLoading) {
    return <div>Lataa</div>;
  }

  const filterHandler: FilterFunction = (options, search) => {
    setSearch(search);
    return options;
  };

  if (workMethods.error || workFeatures.error) {
    const error = (workMethods.error || workFeatures.error) as Error;
    return <EditorLoadingError error={error} />;
  }

  const workMethodsList = workMethods.data?.map((k) => keywordToOptionType(k)) || [];
  const workFeaturesList = workFeatures.data?.map((k) => keywordToOptionType(k)) || [];

  const isSetRule = () => {
    return getValues('keywords_working_methods').length > 0 ? true : 'Valitse yksi';
  };

  return (
    <FormSection header={'Luokittelut'}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={4}>
          <SelectionGroup
            required={true}
            fieldId="keywords_working_methods"
            label="Työtavat"
            rules={isSetRule}
            options={workMethodsList}
          ></SelectionGroup>
        </$GridCell>
        <$GridCell $colSpan={4}>
          <SelectionGroup
            required={false}
            fieldId="keywords_attributes"
            label="Työn ominaisuudet"
            options={workFeaturesList}
          ></SelectionGroup>
        </$GridCell>
        <$GridCell $colSpan={4}>
          <Combobox<OptionType>
            id={'keywords'}
            multiselect
            required={false}
            label={t('common:editor.classification.keywords')}
            placeholder={t('common:editor.classification.search')}
            options={keywords}
            optionLabelField={'label'}
            filter={filterHandler}
          />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default Classification;
