import Field from 'kesaseteli/handler/components/form/Field';
import { $Notification } from 'shared/components/notification/Notification.sc';
import styled from 'styled-components';

export const $AssigneeBox = styled.div`
  box-sizing: border-box;
  border: 1px solid var(--color-black-10);
  background-color: var(--color-black-5);
  padding: var(--spacing-m);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme?.spacing?.xs ?? 'var(--spacing-xs)'};
  width: 100%;
  margin-bottom: ${(props) => props.theme?.spacing?.xl ?? 'var(--spacing-xl)'};
`;

export const $AssigneeHeading = styled.h4`
  margin: 0;
  font-size: ${(props) => props.theme?.fontSize?.body?.m ?? '1rem'};
  font-weight: 600;
  color: ${(props) => props.theme?.colors?.black90 ?? 'var(--color-black-90)'};
`;

export const $StatusValueWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs2};
`;

export const $PanelGrid = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  > * {
    flex: 1 1 400px;
    min-width: 0;
  }
`;

export const $Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.m};
`;

export const $VtjBlockerNotification = styled($Notification)`
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $ActionButtonsWrapper = styled.div`
  width: 100%;
  margin-top: ${(props) => props.theme.spacing.xl};
`;

export const $DescriptionField = styled(Field)`
  margin-bottom: ${(props) => props.theme.spacing.s};
`;
