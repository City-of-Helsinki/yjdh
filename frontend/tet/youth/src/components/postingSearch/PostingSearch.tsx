import React from 'react';
import { TextInput, Select, DateInput } from 'hds-react';
import { Button } from 'hds-react';
import { QueryParams } from 'tet/youth/types/queryparams';
import Container from 'shared/components/container/Container';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { $Search } from 'tet/youth/components/postingSearch/PostingSearch.sc';
import { useTranslation } from 'next-i18next';
import { IconGroup } from 'hds-react';
import { convertToBackendDateFormat, convertToUIDateFormat } from 'shared/utils/date.utils';
import PostingSearchTags from 'tet/youth/components/postingSearch/postingSearchTags/PostingSearchTags';
import useGetKeywords from 'tet/youth/hooks/backend/useGetKeywords';
import { keywordToOptionType } from 'tet/youth/backend-api/backend-api'; //TODO to shared

type Props = {
  initParams: QueryParams;
  onSearchByFilters: (value: QueryParams) => void;
};

const PostingSearch: React.FC<Props> = ({ initParams, onSearchByFilters }) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [workMethod, setWorkMethod] = React.useState<string>();
  const { i18n } = useTranslation();

  const workMethodsResults = useGetKeywords();

  const workMethods =
    !workMethodsResults.isLoading && workMethodsResults.data
      ? workMethodsResults.data.data.map((k) => keywordToOptionType(k))
      : [];

  React.useEffect(() => {
    setStartTime(initParams.hasOwnProperty('start') ? convertToUIDateFormat(initParams.start as string) : '');
    setEndTime(initParams.hasOwnProperty('end') ? convertToUIDateFormat(initParams.end as string) : '');
    setWorkMethod(initParams.keyword ?? '');
    setSearchText(initParams.text ?? '');
  }, [initParams]);

  const searchHandler = () => {
    onSearchByFilters({
      text: searchText,
      start: convertToBackendDateFormat(startTime),
      end: convertToBackendDateFormat(endTime),
      keyword: workMethod,
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
                placeholder="Kirjoita hakusana tai paikan nimi"
              ></TextInput>
            </$GridCell>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Select
              placeholder="Valitse työtapa"
              onChange={(val) => setWorkMethod(val.value)}
              value={workMethods.find((method) => method.value === workMethod)}
              icon={<IconGroup />}
              options={workMethods}
            ></Select>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <DateInput
              id="start_time"
              onChange={(value) => setStartTime(value)}
              value={startTime}
              language={i18n.language}
              placeholder="Alkamispäivä"
            ></DateInput>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <DateInput
              id="end_time"
              onChange={(value) => setEndTime(value)}
              value={endTime}
              language={i18n.language}
              placeholder="Päättymispäivä"
            ></DateInput>
          </$GridCell>
          <$GridCell $colSpan={3}></$GridCell>
          <$GridCell $colSpan={3}>
            <Button
              onClick={searchHandler}
              css={`
                background-color: #008567;
                border-color: #008567;
                width: 100%;
              `}
              theme="black"
            >
              Etsi
            </Button>
          </$GridCell>
        </$GridCell>
        <PostingSearchTags initParams={initParams} onRemoveFilter={removeFilterHandler} workMethods={workMethods} />
      </Container>
    </$Search>
  );
};

export default PostingSearch;
