import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { useQuery } from 'react-query';
import { getAddressList } from 'tet-shared/backend-api/linked-events-api';
import debounce from 'lodash/debounce';
import TextInput from 'tet/admin/components/editor/TextInput';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';
import { LocationType, OptionType } from 'tet-shared/types/classification';
import ComboboxSingleSelect from 'tet/admin/components/editor/ComboboxSingleSelect';
import TetPosting from 'tet-shared/types/tetposting';
import { getLocalizedString } from 'tet-shared/backend-api/transformations';
import { Language } from 'shared/i18n/i18n';

const CompanyInfo: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [addressSearch, setAddressSearch] = React.useState('');
  const { name } = useValidationRules();

  const keywordsResults = useQuery(['keywords', addressSearch], () => getAddressList(addressSearch));
  const locale = i18n.language as Language;

  const keywords: LocationType[] = React.useMemo(() => {
    return keywordsResults.data
      ? keywordsResults.data.map(
          (keyword) =>
            ({
              name: getLocalizedString(keyword.name, locale),
              label: `${getLocalizedString(keyword.name, locale)}, ${getLocalizedString(
                keyword.street_address,
                locale,
              )}, ${keyword.postal_code ?? ''}`,
              value: keyword['@id'],
              street_address: getLocalizedString(keyword.street_address, locale),
              postal_code: keyword.postal_code ?? '',
              city: getLocalizedString(keyword.address_locality, locale),
              position: keyword.position,
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
              validation={{ required: { value: true, message: t('common:editor.posting.validation.required') } }}
            ></ComboboxSingleSelect>
          </$GridCell>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default CompanyInfo;
