import { Button, DateInput, IconGlobe, IconGroup, SearchInput, Select } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { Language } from 'shared/i18n/i18n';
import { convertToBackendDateFormat, convertToUIDateFormat } from 'shared/utils/date.utils';
import { $Search } from 'tet/youth/components/jobPostingSearch/JobPostingSearch.sc';
import PostingSearchTags from 'tet/youth/components/jobPostingSearch/jobPostingSearchTags/JobPostingSearchTags';
import { QueryParams } from 'tet/youth/types/queryparams';
import useKeywordType from 'tet-shared/hooks/backend/useKeywordType';
import { OptionType } from 'tet-shared/types/classification';

type Props = {
  initParams: QueryParams;
  onSearchByFilters: (value: QueryParams) => void;
};

const PostingSearch: React.FC<Props> = ({ initParams, onSearchByFilters }) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [chosenLanguage, setChosenLanguage] = React.useState('');

  const [workMethod, setWorkMethod] = React.useState<string>('');
  const [chosenWorkFeatures, setChosenWorkFeatures] = React.useState<string[]>([]);
  const [initKeywords, setInitKeywords] = React.useState<OptionType[]>([]);

  const { t, i18n } = useTranslation();
  const languageOptions = [
    { name: 'fi', value: 'fi', label: t('common:editor.posting.contactLanguageFi') },
    { name: 'sv', value: 'sv', label: t('common:editor.posting.contactLanguageSv') },
    { name: 'en', value: 'en', label: t('common:editor.posting.contactLanguageEn') },
  ];
  const { isLoading, error, workMethodsList, workFeaturesList } = useKeywordType('id');

  React.useEffect(() => {
    if (initParams.keyword) {
      const paramKeywords = initParams.keyword.split(',');
      const features = workFeaturesList.filter((feature) => paramKeywords.includes(feature.value));
      setChosenWorkFeatures(features.map((feature) => feature.value));
      const method = workMethodsList.find((m) => paramKeywords.includes(m.value));
      if (method) {
        setWorkMethod(method.value);
        setInitKeywords([...features, method]);
      } else {
        setInitKeywords([...features]);
      }
    }

    setStartTime(initParams.start ? convertToUIDateFormat(initParams.start) : '');
    setEndTime(initParams.end ? convertToUIDateFormat(initParams.end) : '');
    setSearchText(initParams.text ? initParams.text : '');
    setChosenLanguage(initParams.language ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initParams]);

  const searchHandler = (): void => {
    const keywords = [...chosenWorkFeatures];
    if (workMethod.length > 0) {
      keywords.push(workMethod);
    }
    onSearchByFilters({
      text: searchText.length > 0 ? searchText : initParams.text,
      start: convertToBackendDateFormat(startTime),
      end: convertToBackendDateFormat(endTime),
      keyword: keywords.join(keywords.length > 1 ? ',' : ''),
      language: chosenLanguage,
    });
  };

  const removeFilterHandler = (removeKeys: keyof QueryParams | Array<keyof QueryParams> | 'all'): void => {
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

  const removeKeyWordHandler = (keyword: OptionType): void => {
    const remainingKeywords = initKeywords
      .filter((initKeyword) => initKeyword.value !== keyword.value)
      .map((initKeyword) => initKeyword.value);
    if (remainingKeywords.length > 0) {
      onSearchByFilters({
        ...initParams,
        keyword: remainingKeywords.join(remainingKeywords.length > 1 ? ',' : ''),
      });
    } else {
      removeFilterHandler('keyword');
    }
  };

  const onWorkFeatureChange = (features: OptionType[]): void => {
    setChosenWorkFeatures(features.map((feature) => feature.value));
  };

  const searchSubmitHandler = (e: React.FormEvent): void => {
    e.preventDefault();
    searchHandler();
  };

  const workMethods = isLoading || error ? [] : workMethodsList;
  const workFeatures = isLoading || error ? [] : workFeaturesList;

  return (
    <$Search onSubmit={searchSubmitHandler}>
      <Container>
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={12}>
            <$GridCell $colSpan={10}>
              <SearchInput
                label={t('common:filters.searchJobs')}
                onSubmit={() => searchHandler()}
                onChange={(value) => setSearchText(value)}
                placeholder={t('common:filters.searchPlaceholder')}
                searchButtonAriaLabel={t('common:filters.searchJobs')}
              />
            </$GridCell>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Select<OptionType>
              id="workMethod"
              label=""
              placeholder={t('common:filters.workMethod')}
              onChange={(val: OptionType) => setWorkMethod(val.value)}
              value={workMethods.find((method) => method.value === workMethod)}
              icon={<IconGroup />}
              options={workMethods}
              optionLabelField="label"
            />
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Select<OptionType>
              multiselect
              label=""
              placeholder={t('common:filters.workFeatures')}
              onChange={(features: OptionType[]) => onWorkFeatureChange(features)}
              value={workFeatures.filter((feature) => chosenWorkFeatures.includes(feature.value))}
              icon={<IconGroup />}
              options={workFeatures}
              optionLabelField="label"
              clearButtonAriaLabel={t('common:filters.combobox.clearButtonAriaLabel')}
              selectedItemRemoveButtonAriaLabel={t('common:filters.combobox.selectedItemRemoveButtonAriaLabel')}
            />
          </$GridCell>
          <$GridCell $colSpan={3}>
            <DateInput
              id="start_time"
              onChange={(value) => setStartTime(value)}
              value={startTime}
              language={i18n.language as Language}
              placeholder={t('common:filters.startDate')}
            />
          </$GridCell>
          <$GridCell $colSpan={3}>
            <DateInput
              id="end_time"
              onChange={(value) => setEndTime(value)}
              value={endTime}
              language={i18n.language as Language}
              placeholder={t('common:filters.endDate')}
            />
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
              optionLabelField="label"
            />
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Button
              type="submit"
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
        <PostingSearchTags
          initParams={initParams}
          onRemoveFilter={removeFilterHandler}
          initKeywords={initKeywords}
          onRemoveKeyword={removeKeyWordHandler}
          languageOptions={languageOptions}
        />
      </Container>
    </$Search>
  );
};

export default PostingSearch;
