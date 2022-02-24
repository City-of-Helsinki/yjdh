import * as React from 'react';
import { Tag } from 'hds-react';
import { useQueries } from 'react-query';
import { IdObject, Keyword, LocalizedObject } from 'tet/youth/linkedevents';
import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import styled from 'styled-components';

const $KeywordList = styled.ul`
  display: inline-flex;
  flex-flow: row wrap;
  list-style: none;
  padding-left: 0;
  margin-top: 0;

  li {
    margin-right: ${(props) => props.theme.spacing.xs};
    margin-top: ${(props) => props.theme.spacing.xs};
  }
`;

type Props = {
  keywords: any;
};

const JobPostingCardKeywords: React.FC<Props> = ({ keywords = [] }) => {
  const keywordList = (list: string[], color: string) => {
    return (
      <>
        {list.map((keyword: string) => (
          <li>
            <Tag
              theme={{
                '--tag-background': `var(--color-${color})`,
                '--tag-color': 'var(--color-black-90)',
                '--tag-focus-outline-color': 'var(--color-black-90)',
              }}
            >
              {keyword}
            </Tag>
          </li>
        ))}
      </>
    );
  };

  const getIdFromUrl = (keyword: IdObject) => {
    const prefix = '/keyword/';
    const url = keyword['@id'];
    return url.substring(url.indexOf(prefix) + prefix.length);
  };

  const queries = keywords.map((keyword) => ({
    queryKey: getIdFromUrl(keyword),
    queryFn: BackendEndpoint.KEYWORD + getIdFromUrl(keyword),
  }));

  const results = useQueries(queries);

  console.log(results);
  return (
    <$KeywordList>
      {keywordList(['test1'], 'success-light')}
      {keywordList(['test2'], 'coat-of-arms-medium-light')}
      {keywordList(['test3'], 'engel-medium-light')}
    </$KeywordList>
  );
};

export default JobPostingCardKeywords;
