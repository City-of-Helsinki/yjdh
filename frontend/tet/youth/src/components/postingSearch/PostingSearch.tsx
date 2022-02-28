import React from 'react';
import { TextInput, Select } from 'hds-react';
import { Button } from 'hds-react';
import { QueryParams } from 'tet/youth/types/queryparams';
import Container from 'shared/components/container/Container';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { $Search } from 'tet/youth/components/postingSearch/PostingSearch.sc';

type Props = {
  onSearchByFilters: (value: QueryParams) => void;
};

const PostingSearch: React.FC<Props> = ({ onSearchByFilters }) => {
  const [searchText, setSearchText] = React.useState('');

  const searchHandler = () => {
    onSearchByFilters({
      searchText: searchText,
    });
  };

  return (
    <$Search>
      <Container>
        <$GridCell as={$Grid} $colSpan={12}>
          <$GridCell $colSpan={12}>
            <$GridCell $colSpan={10}>
              <TextInput onChange={(e) => setSearchText(e.target.value)} id="searchText" label="Hakusana"></TextInput>
            </$GridCell>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <Select placeholder="Valitse työtapa" options={[{ label: 'test' }]}></Select>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <Select options={[{ label: 'test' }]}></Select>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <Select placeholder="Valitse alue" options={[{ label: 'test' }]}></Select>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <Select placeholder="Valitse kieli" options={[{ label: 'test' }]}></Select>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <Button onClick={searchHandler}>Etsi</Button>
          </$GridCell>
        </$GridCell>
      </Container>
    </$Search>
  );
};

export default PostingSearch;
