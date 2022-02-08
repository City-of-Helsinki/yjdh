import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
//import { SelectionGroup } from 'hds-react';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import { getWorkMethods, getWorkFeatures, getWorkKeyWords } from 'tet/admin/backend-api/linked-events-api';
import { useQuery, useQueries } from 'react-query';
import { OptionType } from 'tet/admin/types/classification';
import { EditorSectionProps } from 'tet/admin/components/editor/Editor';
import Combobox from 'tet/admin/components/editor/Combobox';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet/admin/types/tetposting';
import SelectionGroup from 'tet/admin/components/editor/SelectionGroup';

const Classification: React.FC<EditorSectionProps> = ({ initialValue }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = React.useState('');
  const { setValue } = useFormContext<TetPosting>();

  const results = useQueries([
    { queryKey: 'workMethods', queryFn: getWorkMethods },
    { queryKey: 'workFeatures', queryFn: getWorkFeatures },
  ]);

  const keywordsResults = useQuery(['keywords', search], () => getWorkKeyWords(search));

  const keywords = !keywordsResults.isLoading
    ? keywordsResults.data?.data.map((keyword) => ({ label: keyword.name.fi, value: keyword['@id'] }))
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

  const getValueLabelList = (list) => {
    return list.map((item) => ({
      label: item.name.fi,
      value: item.id,
    }));
  };

  const workMethodsList = getValueLabelList(workMethods.data.data);
  const workFeaturesList = getValueLabelList(workFeatures.data.data);

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
            fieldId="work_methods"
            label="Työtavat"
            options={workMethodsList}
          ></SelectionGroup>
        </$GridCell>
        <$GridCell $colSpan={4}>
          <SelectionGroup
            required={false}
            fieldId="work_features"
            label="Työn ominaisuudet"
            options={workFeaturesList}
          ></SelectionGroup>
        </$GridCell>
        <$GridCell $colSpan={4}>
          <Combobox
            id={'keywords'}
            multiselect={true}
            required={false}
            label={t('common:editor.classification.keywords')}
            placeholder={t('common:editor.classification.search')}
            options={keywords}
            optionLabelField={'label'}
            filter={filterHandler}
          ></Combobox>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default Classification;
