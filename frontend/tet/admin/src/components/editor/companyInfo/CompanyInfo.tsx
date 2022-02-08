// TODO a good reference what this should look like is benefit/applicant/src/components/applications/forms/application/step1/companyInfo/CompanyInfo.tsx

import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { Checkbox, TextInput } from 'hds-react';
import { $CompanyInfoRow } from 'tet/admin/components/editor/companyInfo/CompanyInfo.sc';
import Combobox from 'tet/admin/components/editor/Combobox';
import { useQuery } from 'react-query';
import { getWorkKeyWords } from 'tet/admin/backend-api/linked-events-api';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet/admin/types/tetposting';
import debounce from 'lodash/debounce';

const CompanyInfo: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setValue } = useFormContext<TetPosting>();
  const [addressSearch, setAddressSearch] = React.useState('');

  const keywordsResults = useQuery(['keywords', addressSearch], () => getWorkKeyWords(addressSearch));

  const keywords = !keywordsResults.isLoading
    ? keywordsResults.data.data.map((keyword) => ({ label: keyword.name.fi, value: keyword['@id'] }))
    : [];

  const filterSetter = React.useCallback(
    debounce((search) => setAddressSearch(search), 500),
    [],
  );

  const addressFilterHandler = (options: OptionType[], search: string): OptionType[] => {
    filterSetter(search);
    return options;
  };
  const addressChangeHandler = (val) => {
    setValue('address', val);
  };

  return (
    <FormSection header={t('common:editor.employerInfo.header')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={12}>
          <$CompanyInfoRow>Helsingin kaupunki</$CompanyInfoRow>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <Checkbox
            id="company-address-checkbox"
            label={t('common:editor.employerInfo.addressNeededLabel')}
            checked
            disabled
          />
        </$GridCell>
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={6}>
            <TextInput
              id="company-address-department"
              label={t('common:editor.employerInfo.departmentLabel')}
              placeholder={t('common:editor.employerInfo.departmentLabel')}
            />
          </$GridCell>
          <$GridCell $colSpan={6}>
            <Combobox
              id={'address'}
              multiselect={false}
              required={false}
              label={t('common:editor.classification.keywords')}
              placeholder={t('common:editor.classification.search')}
              options={keywords}
              onChange={addressChangeHandler}
              optionLabelField={'label'}
              filter={addressFilterHandler}
            ></Combobox>
          </$GridCell>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default CompanyInfo;
