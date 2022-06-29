import * as React from 'react';
import { Tag } from 'hds-react';
import { OptionType } from 'tet-shared/types/classification';
import JobPosting from 'tet-shared/types/tetposting';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import useMediaQuery from 'shared/hooks/useMediaQuery';

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
  jobPosting: JobPosting;
};

const JobPostingCardKeywords: React.FC<Props> = ({ jobPosting }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.m})`);
  const keywordList = (list: OptionType[], color: string) => {
    return (
      <>
        {list.map((keyword: OptionType) => (
          <li>
            <Tag
              theme={{
                '--tag-background': `var(--color-${color})`,
                '--tag-color': 'var(--color-black-90)',
                '--tag-focus-outline-color': 'var(--color-black-90)',
              }}
            >
              {keyword.name}
            </Tag>
          </li>
        ))}
      </>
    );
  };

  return (
    <$KeywordList>
      {keywordList(jobPosting.keywords_working_methods, 'success-light')}
      {isDesktop && keywordList(jobPosting.keywords_attributes, 'coat-of-arms-medium-light')}
      {isDesktop && keywordList(jobPosting.keywords, 'engel-medium-light')}
    </$KeywordList>
  );
};

export default JobPostingCardKeywords;
