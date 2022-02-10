import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
//import { SelectionGroup } from 'hds-react';
import { getWorkMethods, getWorkFeatures, getWorkKeywords } from 'tet/admin/backend-api/linked-events-api';
import { useQuery, useQueries } from 'react-query';
import { OptionType } from 'tet/admin/types/classification';
import { EditorSectionProps } from 'tet/admin/components/editor/Editor';
import Combobox from 'tet/admin/components/editor/Combobox';
import SelectionGroup from 'tet/admin/components/editor/SelectionGroup';

export type FilterFunction = (options: OptionType[], search: string) => OptionType[];

const Classification: React.FC<EditorSectionProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = React.useState('');

  const results = useQueries([
    { queryKey: 'workMethods', queryFn: getWorkMethods },
    { queryKey: 'workFeatures', queryFn: getWorkFeatures },
  ]);

  const keywordsResults = useQuery(['keywords', search], () => getWorkKeywords(search));

  const keywords = !keywordsResults.isLoading && keywordsResults.data ? keywordsResults.data : [];

  const [workMethods, workFeatures] = results;

  if (workMethods.isLoading || workFeatures.isLoading) {
    return <div>Lataa</div>;
  }

  const filterHandler: FilterFunction = (options, search) => {
    setSearch(search);
    return options;
  };

  const workMethodsList = workMethods.data;
  const workFeaturesList = workFeatures.data;

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
          <Combobox
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
