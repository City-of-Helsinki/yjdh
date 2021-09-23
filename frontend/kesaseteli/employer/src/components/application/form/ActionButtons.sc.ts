import FormSection from 'shared/components/forms/section/FormSection';
import styled from 'styled-components';

export const $ButtonSection = styled(FormSection)`
  margin-top: ${(props) => props.theme.spacing.m};
  padding-bottom: ${(props) => props.theme.spacing.m};
`;
