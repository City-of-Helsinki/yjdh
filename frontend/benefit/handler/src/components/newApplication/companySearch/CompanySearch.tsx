import {
  Button,
  LoadingSpinner,
  Notification,
  RadioButton,
  SearchInput,
  SelectionGroup,
} from 'hds-react';
import React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import { useCompanySearch } from './useCompanySearch';

const CompanySearch: React.FC = () => {
  const {
    getCompany,
    getSuggestions,
    t,
    translationsBase,
    errorMessage,
    noResults,
    companies,
    selectedCompany,
    onCompanyChange,
    onSelectCompany,
    isLoading,
  } = useCompanySearch();
  const theme = useTheme();

  return (
    <>
      <div>
        <h2>{t('common:applications.sections.companySearch.heading')}</h2>
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={6}>
            <SearchInput
              label={t(
                `${translationsBase}.companySearch.searchCompanyDetails`
              )}
              loadingSpinnerText={t(`${translationsBase}.messages.loading`)}
              getSuggestions={getSuggestions}
              suggestionLabelField="name"
              highlightSuggestions
              onSubmit={getCompany}
              css={`
                margin-bottom: ${theme.spacing.m};
              `}
            />
          </$GridCell>
          <$GridCell $colStart={1} $colSpan={6}>
            {companies.length > 0 && (
              <>
                <SelectionGroup
                  label={t(`${translationsBase}.companySearch.select`)}
                >
                  {companies.map(({name, business_id: businessId}) => (
                    <RadioButton
                      key={businessId}
                      id={`v-radio-${businessId}`}
                      name={`v-radio-${businessId}`}
                      value={businessId}
                      label={`${name} <${businessId}>`}
                      checked={selectedCompany === businessId}
                      onChange={(event) => onCompanyChange(event.target.value)}
                    />
                  ))}
                </SelectionGroup>
                <Button
                  variant="primary"
                  theme="black"
                  onClick={() => onSelectCompany()}
                  css={`
                    margin-top: ${theme.spacing.l};
                  `}
                >
                  {t(`${translationsBase}.companySearch.selectButton`)}
                </Button>
              </>
            )}
          </$GridCell>
          <$GridCell $colStart={1} $colSpan={6}>
            {errorMessage && (
              <Notification label={errorMessage.label} type="error">
                {errorMessage.text}
              </Notification>
            )}
            {noResults && (
              <Notification label={noResults.label} type="alert">
                {noResults.text}
              </Notification>
            )}
          </$GridCell>
        </$GridCell>
      </div>
      {isLoading && <LoadingSpinner />}
    </>
  );
};

export default CompanySearch;
