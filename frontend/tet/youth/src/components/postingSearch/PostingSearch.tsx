import React from 'react';
import { TextInput, Select, DateInput } from 'hds-react';
import { Button } from 'hds-react';
import { QueryParams } from 'tet/youth/types/queryparams';
import Container from 'shared/components/container/Container';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { $Search } from 'tet/youth/components/postingSearch/PostingSearch.sc';
import { useTranslation } from 'next-i18next';
import { IconGroup, IconCalendar, IconLocation, IconGlobe } from 'hds-react';
import {
  DATE_FORMATS,
  convertDateFormat,
  formatDate,
  parseDate,
  convertToBackendDateFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';
import PostingSearchTags from 'tet/youth/components/postingSearch/postingSearchTags/PostingSearchTags';
import { Query } from 'react-query';

type Props = {
  initParams: QueryParams;
  onSearchByFilters: (value: QueryParams) => void;
};

const PostingSearch: React.FC<Props> = ({ initParams, onSearchByFilters }) => {
  const [searchText, setSearchText] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const { i18n } = useTranslation();

  React.useEffect(() => {
    setStartTime(initParams.hasOwnProperty('start') ? convertToUIDateFormat(initParams.start as string) : '');
    setEndTime(initParams.hasOwnProperty('end') ? convertToUIDateFormat(initParams.end as string) : '');
  }, []);

  const searchHandler = () => {
    onSearchByFilters({
      text: searchText,
      start: convertToBackendDateFormat(startTime),
      end: convertToBackendDateFormat(endTime),
    });
  };

  const removeFilterHandler = (key: keyof QueryParams) => {
    const searchObj = { ...initParams };
    delete searchObj[key];
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
                id="searchText"
                placeholder="Kirjoita hakusana"
              ></TextInput>
            </$GridCell>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Select placeholder="Valitse työtapa" icon={<IconGroup />} options={[{ label: 'test' }]}></Select>
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
          <$GridCell $colSpan={3}>
            <Select placeholder="Valitse kieli" icon={<IconGlobe />} options={[{ label: 'test' }]}></Select>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <Button onClick={searchHandler}>Etsi</Button>
          </$GridCell>
        </$GridCell>
        <PostingSearchTags initParams={initParams} onRemoveFilter={removeFilterHandler} />
      </Container>
    </$Search>
  );
};

export default PostingSearch;
