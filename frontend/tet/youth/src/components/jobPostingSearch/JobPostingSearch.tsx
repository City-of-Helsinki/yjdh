import React from 'react';
import { TextInput, Select, DateInput } from 'hds-react';
import { Button } from 'hds-react';
import { QueryParams } from 'tet/youth/types/queryparams';
import Container from 'shared/components/container/Container';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { $Search } from 'tet/youth/components/jobPostingSearch/JobPostingSearch.sc';
import { useTranslation } from 'next-i18next';
import { IconGroup, IconGlobe } from 'hds-react';
import { convertToBackendDateFormat, convertToUIDateFormat } from 'shared/utils/date.utils';
import PostingSearchTags from 'tet/youth/components/jobPostingSearch/jobPostingSearchTags/JobPostingSearchTags';
import { keywordToOptionType } from 'tet-shared/backend-api/linked-events-api';
import { Language } from 'shared/i18n/i18n';
import { OptionType } from 'tet-shared/types/classification';
import { useQuery } from 'react-query';
import { getWorkMethods, getWorkFeatures } from 'tet-shared/backend-api/linked-events-api';
import useKeywordType from 'tet-shared/hooks/backend/useKeywordType';

type Props = {
  initParams: QueryParams;
  onSearchByFilters: (value: QueryParams) => void;
};

const PostingSearch: React.FC<Props> = ({ initParams, onSearchByFilters }) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [chosenLanguage, setChosenLanguage] = React.useState('');

  const [workMethod, setWorkMethod] = React.useState<string>();
  const [workFeature, setWorkFeature] = React.useState<string>();
  const { t, i18n } = useTranslation();
  const languageOptions = [
    { name: 'fi', value: 'fi', label: t('common:languages.fi') },
    { name: 'sv', value: 'sv', label: t('common:languages.sv') },
    { name: 'en', value: 'en', label: t('common:languages.en') },
  ];
  const { isLoading, error, workMethodsList, workFeaturesList } = useKeywordType('id');

  React.useEffect(() => {
    setStartTime(initParams.hasOwnProperty('start') ? convertToUIDateFormat(initParams.start as string) : '');
    setEndTime(initParams.hasOwnProperty('end') ? convertToUIDateFormat(initParams.end as string) : '');
    setWorkMethod(initParams.keyword ?? '');
    setSearchText(initParams.text ?? '');
    setChosenLanguage(initParams.language ?? '');
  }, [initParams]);

  const searchHandler = () => {
    onSearchByFilters({
      text: searchText,
      start: convertToBackendDateFormat(startTime),
      end: convertToBackendDateFormat(endTime),
      keyword: workMethod,
      language: chosenLanguage,
    });
  };

  const removeFilterHandler = (removeKeys: keyof QueryParams | Array<keyof QueryParams> | 'all') => {
    let searchObj = { ...initParams };
    if (removeKeys === 'all') {
      searchObj = {};
    } else if (Array.isArray(removeKeys)) {
      removeKeys.forEach((item) => delete searchObj[item]);
    } else {
      delete searchObj[removeKeys];
    }
    onSearchByFilters(searchObj);
  };

  const workMethods = isLoading || error ? [] : workMethodsList;
  const workFeatures = isLoading || error ? [] : workFeaturesList;

  return (
    <$Search>
      <Container>
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={12}>
            <$GridCell $colSpan={10}>
              <TextInput
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                id="searchText"
                placeholder={t('common:filters.searchPlaceholder')}
              ></TextInput>
            </$GridCell>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Select<OptionType>
              id="workMethod"
              label=""
              placeholder={t('common:filters.workMethod')}
              onChange={(val: OptionType) => setWorkMethod(val.value)}
              value={workMethods.find((method) => method.value === workMethod) as OptionType}
              icon={<IconGroup />}
              options={workMethods}
              optionLabelField={'label'}
              clearButtonAriaLabel=""
              selectedItemRemoveButtonAriaLabel=""
            ></Select>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Select<OptionType>
              id="workFeature"
              label=""
              placeholder={t('common:filters.workFeatures')}
              onChange={(val: OptionType) => setWorkMethod(val.value)}
              value={workFeatures.find((method) => method.value === workMethod) as OptionType}
              icon={<IconGroup />}
              options={workFeatures}
              optionLabelField={'label'}
              clearButtonAriaLabel=""
              selectedItemRemoveButtonAriaLabel=""
            ></Select>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <DateInput
              id="start_time"
              onChange={(value) => setStartTime(value)}
              value={startTime}
              language={i18n.language as Language}
              placeholder={t('common:filters.startDate')}
            ></DateInput>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <DateInput
              id="end_time"
              onChange={(value) => setEndTime(value)}
              value={endTime}
              language={i18n.language as Language}
              placeholder={t('common:filters.endDate')}
            ></DateInput>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Select
              id="language"
              label=""
              options={languageOptions}
              icon={<IconGlobe />}
              placeholder={t('common:filters.language')}
              onChange={(val: OptionType) => setChosenLanguage(val.value)}
              value={languageOptions.find((language) => language.value === chosenLanguage)}
              optionLabelField={'label'}
            ></Select>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Button
              onClick={searchHandler}
              css={`
                background-color: #008567;
                border-color: #008567 !important;
                width: 100%;
              `}
              theme="black"
            >
              {t('common:frontPage.search')}
            </Button>
          </$GridCell>
        </$GridCell>
        <PostingSearchTags initParams={initParams} onRemoveFilter={removeFilterHandler} workMethods={workMethods} />
      </Container>
    </$Search>
  );
};

export default PostingSearch;
