import { Card, IconInfoCircle, Link } from 'hds-react';
import styled from 'styled-components';

export const $PrerequisiteCard = styled(Card)`
  --background-color: ${(props) => props.theme.colors.fogMediumLight};
  display: flex;
  gap: ${(props) => props.theme.spacing.m};
  padding-bottom: ${(props) => props.theme.spacingLayout.m};

  p {
    line-height: ${(props) => props.theme.lineHeight.l};
  }
`;

export const $IconInfoCircle = styled(IconInfoCircle)`
  flex: 0 0 auto;
  && {
    --icon-size: ${(props) => props.theme.spacingLayout.xl2};
  }
`;

export const $Heading = styled.h2`
  font-weight: 300;
  font-size: ${(props) => props.theme.fontSize.heading.l};
`;

export const $DownloadButtonContainer = styled.div`
  margin: ${(props) => props.theme.spacing.m} 0;
`;

export const $Link = styled(Link)`
  --link-color: ${(props) => props.theme.colors.black};
  --link-visited-color: ${(props) => props.theme.colors.black};
`;
