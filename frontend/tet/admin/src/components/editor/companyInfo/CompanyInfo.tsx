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
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';
import { useFormContext } from 'react-hook-form';

const CompanyInfo: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [addressSearch, setAddressSearch] = React.useState('');
  const { name } = useValidationRules();
  const { getLocalizedString } = useEventPostingTransformation();
  const { getValues } = useFormContext<TetPosting>();

  const keywordsResults = useQuery(['keywords', addressSearch], () => getAddressList(addressSearch));

  const keywords: LocationType[] = React.useMemo(() => {
    return keywordsResults.data
      ? keywordsResults.data.map(
          (keyword) =>
            ({
              name: getLocalizedString(keyword.name),
              label: `${getLocalizedString(keyword.name)}, ${getLocalizedString(keyword.street_address)}, ${
                keyword.postal_code ?? ''
              }`,
              value: keyword['@id'],
              street_address: getLocalizedString(keyword.street_address),
              postal_code: keyword.postal_code ?? '',
              position: keyword.position,
              city: getLocalizedString(keyword.address_locality),
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

  const locationRequired = () => {
    return getValues('location')?.value.length > 0 ? true : t('common:editor.posting.validation.required');
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
              testId={'posting-form-org_name'}
              label={t('common:editor.employerInfo.departmentLabel')}
              placeholder={t('common:editor.employerInfo.departmentLabel')}
              registerOptions={name}
            />
          </$GridCell>
          <$GridCell $colSpan={6}>
            <ComboboxSingleSelect<TetPosting, LocationType>
              id="location"
              testId={'posting-form-location'}
              required={true}
              label={t('common:editor.employerInfo.address')}
              placeholder={t('common:editor.employerInfo.streetAddress')}
              options={keywords}
              optionLabelField={'label'}
              filter={addressFilterHandler}
              validation={{ validate: locationRequired }}
            ></ComboboxSingleSelect>
          </$GridCell>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default CompanyInfo;
