import styled from 'styled-components';

export const $Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing.m};
  background-color: ${(props) => props.theme.colors.silverLight};
  padding: ${(props) => props.theme.spacing.l};
  padding-top: ${(props) => props.theme.spacing.s};
`;

export const $Heading = styled.h3`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: 600;
  margin-bottom: ${(props) => props.theme.spacing.s};
`;

export const $Message = styled.span`
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin-bottom: ${(props) => props.theme.spacing.l};
`;

export const $UploadContainer = styled.div``;
