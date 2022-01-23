import styled from 'styled-components';

export const $Heading = styled.h2`
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: 500;
`;

export const $ListWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs2};
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const $ListInfo = styled.div`
  display: grid;
  grid-template-columns: 60px 3fr;
  grid-gap: ${(props) => props.theme.spacing.m};
  background-color: ${(props) => props.theme.colors.coatOfArms};
  padding: ${(props) => props.theme.spacing.xs2};
  color: ${(props) => props.theme.colors.white};
  margin-bottom: ${(props) => props.theme.spacing.l};
`;

export const $ListInfoInner = styled.div`
  display: flex;
  align-items: center;
`;

export const $ListInfoText = styled.div`
  padding: 0 ${(props) => props.theme.spacing.xs2};
`;
