import styled from 'styled-components';

export const $MapWrapper = styled.div`
  & .leaflet-popup-content-wrapper {
    border-radius: 0;
    border-bottom: 10px solid ${(props) => props.theme.colors.success};
  }
`;

export const $Title = styled.h4`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  margin: 0;
`;

export const $Subtitle = styled.h5`
  font-size: ${(props) => props.theme.fontSize.heading.xs};
  margin: 0;
`;
export const $Date = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin-top: ${(props) => props.theme.spacing.s};
  font-weight: normal;
`;

export const $Address = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;
