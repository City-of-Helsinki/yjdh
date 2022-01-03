import styled from 'styled-components';
import { TabList, TabPanel } from 'hds-react';

export const $TabList = styled(TabList)`
  --tab-color: ${(props) => props.theme.colors.black};
  --tab-active-border-color: ${(props) => props.theme.colors.black};
  & > div > ul {
    width: 100% !important;
    display: flex;
    justify-content: center;
    li {
      width: 50%;
    }
    margin-bottom: ${(props) => props.theme.spacing.m};
  }
`;

export const $TabPanel = styled(TabPanel)`
  display: flex;
  flex-direction: column;
`;
