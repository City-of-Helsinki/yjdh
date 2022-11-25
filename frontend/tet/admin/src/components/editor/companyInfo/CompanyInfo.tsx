import debounce from 'lodash/debounce';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';
import ComboboxSingleSelect from 'tet/admin/components/editor/ComboboxSingleSelect';
import TextInput from 'tet/admin/components/editor/TextInput';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';
import { getAddressList } from 'tet-shared/backend-api/linked-events-api';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';
import { LocationType, OptionType } from 'tet-shared/types/classification';
import TetPosting from 'tet-shared/types/tetposting';

const CompanyInfo: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [addressSearch, setAddressSearch] = React.useState('');
  const { name } = useValidationRules();
  const { getLocalizedString } = useEventPostingTransformation();
  const { getValues } = useFormContext<TetPosting>();

  const keywordsResults = useQuery(['keywords', addressSearch], () => getAddressList(addressSearch), {
    enabled: !!addressSearch,
  });

  const keywords: LocationType[] = React.useMemo(
    () =>
      keywordsResults.data
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
        : [],
    [getLocalizedString, keywordsResults.data],
  );

  const filterSetter = debounce((search: string) => setAddressSearch(search), 500);

  const addressFilterHandler = (options: OptionType[], search: string): OptionType[] => {
    filterSetter(search);
    return options;
  };

  const locationRequired = (): true | string =>
    getValues('location')?.value.length > 0 ? true : t<string>('common:editor.posting.validation.required');

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
              id="title"
              testId="posting-form-title"
              label={t('common:editor.posting.title')}
              placeholder={t('common:editor.posting.title')}
              registerOptions={name}
            />
          </$GridCell>
        </$GridCell>
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={6}>
            <TextInput
              id="org_name"
              testId="posting-form-org_name"
              label={t('common:editor.employerInfo.departmentLabel')}
              placeholder={t('common:editor.employerInfo.departmentLabel')}
              registerOptions={name}
            />
          </$GridCell>
          <$GridCell $colSpan={6}>
            <ComboboxSingleSelect<TetPosting, OptionType>
              id="location"
              testId="posting-form-location"
              required
              label={t('common:editor.employerInfo.address')}
              placeholder={t('common:editor.employerInfo.streetAddress')}
              options={keywords}
              optionLabelField="label"
              filter={addressFilterHandler}
              validation={{ validate: locationRequired }}
            />
          </$GridCell>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default CompanyInfo;
