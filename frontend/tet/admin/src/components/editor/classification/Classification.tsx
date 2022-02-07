import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { SelectionGroup } from 'hds-react';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
//import { Combobox } from 'hds-react';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import { getWorkMethods, getWorkFeatures, getWorkKeyWords } from 'tet/admin/backend-api/linked-events-api';
import { useQuery, useQueries } from 'react-query';
import { OptionType } from 'tet/admin/types/classification';
import { EditorSectionProps } from 'tet/admin/components/editor/Editor';
import Combobox from 'tet/admin/components/editor/Combobox';

const Classification: React.FC<EditorSectionProps> = ({ initialValue }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = React.useState('');

  const results = useQueries([
    { queryKey: 'workMethods', queryFn: getWorkMethods },
    { queryKey: 'workFeatures', queryFn: getWorkFeatures },
  ]);

  const keywordsResults = useQuery(['keywords', search], () => getWorkKeyWords(search));
  console.log(keywordsResults);

  const keywords = !keywordsResults.isLoading
    ? keywordsResults.data.data.map((keyword) => ({ label: keyword.name.fi, value: keyword.id }))
    : [];

  const [workMethods, workFeatures] = results;

  if (workMethods.isLoading || workFeatures.isLoading) {
    return <div>Lataa</div>;
  }

  const handleWorkMethodChange = (checkedMethod) => {
    console.log(checkedMethod);
  };
  const filterHandler = (options: OptionType[], search: string): OptionType[] => {
    setSearch(search);
    return options;
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
          <SelectionGroup label={t('common:editor.classification.workMethod')}>
            {workMethods.data.data.map((workMethod) => (
              <Checkbox
                id={workMethod.id}
                label={workMethod.name.fi}
                onChange={() => handleWorkMethodChange(workMethod.name.fi)}
              />
            ))}
          </SelectionGroup>
        </$GridCell>
        <$GridCell $colSpan={4}>
          <SelectionGroup label={t('common:editor.classification.workFeature')}>
            {workFeatures.data.data.map((workFeature) => (
              <Checkbox id={workFeature.id} label={workFeature.name.fi} />
            ))}
          </SelectionGroup>
        </$GridCell>
        <$GridCell $colSpan={4}>
          <Combobox
            id={'keywords'}
            multiselect={true}
            required
            label={t('common:editor.classification.keywords')}
            placeholder={t('common:editor.classification.search')}
            options={keywords}
            optionLabelField={'label'}
            filter={filterHandler}
          ></Combobox>
          {/*
          <Combobox
            multiselect={true}
            required
            label={t('common:editor.classification.keywords')}
            placeholder={t('common:editor.classification.search')}
            options={keywords}
            clearButtonAriaLabel="Clear all selections"
            selectedItemRemoveButtonAriaLabel="Remove ${value}"
            toggleButtonAriaLabel="Toggle menu"
            optionLabelField={'label'}
            filter={filterHandler}
          ></Combobox>
			*/}
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default Classification;
