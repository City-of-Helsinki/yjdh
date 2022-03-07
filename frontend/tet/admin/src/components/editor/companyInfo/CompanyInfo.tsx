// TODO a good reference what this should look like is benefit/applicant/src/components/applications/forms/application/step1/companyInfo/CompanyInfo.tsx

import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { Checkbox } from 'hds-react';
import { $CompanyInfoRow } from 'tet/admin/components/editor/companyInfo/CompanyInfo.sc';
import { useQuery } from 'react-query';
import { getAddressList } from 'tet/admin/backend-api/linked-events-api';
import debounce from 'lodash/debounce';
import TextInput from 'tet/admin/components/editor/TextInput';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';
import { LocationType, OptionType } from 'tet/admin/types/classification';
import ComboboxSingleSelect from 'tet/admin/components/editor/ComboboxSingleSelect';
import TetPosting from 'tet/admin/types/tetposting';

const CompanyInfo: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [addressSearch, setAddressSearch] = React.useState('');
  const { name } = useValidationRules();

  const keywordsResults = useQuery(['keywords', addressSearch], () => getAddressList(addressSearch));

  const keywords: LocationType[] = React.useMemo(() => {
    return keywordsResults.data
      ? keywordsResults.data.map(
          (keyword) =>
            ({
              name: keyword.name?.fi,
              label: `${keyword.name.fi}, ${keyword.street_address?.fi ?? ''}, ${keyword.postal_code ?? ''}`,
              value: keyword['@id'],
              street_address: keyword.street_address?.fi ?? '',
              postal_code: keyword.postal_code ?? '',
              city: keyword.address_locality?.fi ?? '',
            } as LocationType),
        )
      : [];
  }, [keywordsResults]);

  const filterSetter = React.useCallback(
    debounce((search) => setAddressSearch(search), 500),
    [],
  );

  const addressFilterHandler = (options: OptionType[], search: string): OptionType[] => {
    filterSetter(search);
    return options;
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
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={6}>
            <TextInput
              id="org_name"
              label={t('common:editor.employerInfo.departmentLabel')}
              placeholder={t('common:editor.employerInfo.departmentLabel')}
              registerOptions={name}
            />
          </$GridCell>
          <$GridCell $colSpan={6}>
            <ComboboxSingleSelect<TetPosting, LocationType>
              id="location"
              required={true}
              label={t('common:editor.employerInfo.address')}
              placeholder={t('common:editor.employerInfo.streetAddress')}
              options={keywords}
              optionLabelField={'label'}
              filter={addressFilterHandler}
              validation={{ required: { value: true, message: 'Vaaditaan' } }}
            ></ComboboxSingleSelect>
          </$GridCell>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default CompanyInfo;
