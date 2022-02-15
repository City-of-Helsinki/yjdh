import styled from 'styled-components';

export const $SearchBar = styled.div`
  margin-left: auto;
  margin-right: auto;
  margin-top: -5rem;
  max-width: 1400px;
  background-color: ${(props) => props.theme.colors.black60};
  padding: ${(props) => props.theme.spacing.xl2} ${(props) => props.theme.spacing.m} ${(props) => props.theme.spacing.m};

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    width: 95%;
  }
`;

export const $SearchBarWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

export const $SearchText = styled.div`
  width: 100%;
  color: ${(props) => props.theme.colors.white};
  font-size: ${(props) => props.theme.fontSize.heading.l};
  font-weight: bold;

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    width: 20%;
  }
`;

export const $Filters = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  color: ${(props) => props.theme.colors.white};
  font-size: ${(props) => props.theme.fontSize.body.l};
  font-weight: bold;
  width: 100%;

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    flex-wrap: nowrap;
    width: 80%;
  }
`;

export const $SearchField = styled.div`
  margin-top: ${(props) => props.theme.spacing.s};
  width: 100%;

  @media (min-width: ${(props) => props.theme.breakpoints.m}) {
    width: 60%;
    padding-right: ${(props) => props.theme.spacing.s};
  }

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    width: 55%;
    padding-right: ${(props) => props.theme.spacing.s};
  }
`;

export const $DateField = styled.div`
  width: 100%;
  margin-top: ${(props) => props.theme.spacing.s};

  @media (min-width: ${(props) => props.theme.breakpoints.m}) {
    width: 37%;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    width: 25%;
    padding-right: ${(props) => props.theme.spacing.s};
  }
`;

export const $ButtonContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.s};
  flex-grow: 1;
`;

export const $FiltersLink = styled.a`
  margin-top: ${(props) => props.theme.spacing.m};
  justify-content: flex-end;
  display: flex;
  align-items: center;
  font-weight: bold;
  color: ${(props) => props.theme.colors.white};
  text-decoration: none;
  align-items: center;
`;
