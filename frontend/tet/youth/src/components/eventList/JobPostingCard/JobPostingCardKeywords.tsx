import * as React from 'react';
import { Tag } from 'hds-react';
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
  jobPosting: any;
};

const JobPostingCardKeywords: React.FC<Props> = ({ jobPosting }) => {
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

  return (
    <$KeywordList>
      {keywordList(jobPosting.keywords_working_methods, 'success-light')}
      {keywordList(jobPosting.keywords_attributes, 'coat-of-arms-medium-light')}
      {keywordList(jobPosting.keywords, 'engel-medium-light')}
    </$KeywordList>
  );
};

export default JobPostingCardKeywords;
