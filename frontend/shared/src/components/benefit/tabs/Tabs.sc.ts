import { TabList, TabPanel } from 'hds-react';
import styled from 'styled-components';

type TabListProps = {
  position?: 'center' | 'start';
};

export const $TabList = styled(TabList)<TabListProps>`
  --tab-color: ${(props) => props.theme.colors.black};
  --tab-active-border-color: ${(props) => props.theme.colors.black};
  & > div > ul {
    width: 100% !important;
    display: flex;
    justify-content: ${(props) => props.position ?? 'center'};
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
