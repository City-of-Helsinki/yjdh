import * as React from 'react';
import useMediaQuery from 'shared/hooks/useMediaQuery';
import styled, { useTheme } from 'styled-components';
import KeyWordList from 'tet/youth/components/keywordList/KeyWordList';
import JobPosting from 'tet-shared/types/tetposting';

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
  return (
    <$KeywordList>
      <KeyWordList list={jobPosting.keywords_working_methods} color="success-light" />
      {isDesktop && <KeyWordList list={jobPosting.keywords_attributes} color="coat-of-arms-medium-light" />}
      {isDesktop && <KeyWordList list={jobPosting.keywords} color="engel-medium-light" />}
    </$KeywordList>
  );
};

export default JobPostingCardKeywords;
