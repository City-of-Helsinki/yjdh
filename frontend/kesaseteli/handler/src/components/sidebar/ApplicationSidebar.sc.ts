import { Notification, NotificationProps, TabPanel, Tabs } from 'hds-react';
import styled, { createGlobalStyle, DefaultTheme } from 'styled-components';

export const SIDEBAR_WIDTH = '380px';

export const $GlobalSidebarStyle = createGlobalStyle<{
  $isOpen: boolean;
  $isMobile: boolean;
}>`
  [data-testid="header"] {
    transition: padding-right 0.25s ease-in-out;
    padding-right: ${({ $isOpen, $isMobile }) =>
    $isOpen && !$isMobile ? SIDEBAR_WIDTH : '0'};
  }
`;

type SidebarPanelProps = { $isOpen: boolean; $isMobile: boolean };

export const $SidebarWrapper = styled.div`
  position: relative;
`;

/**
 * The sidebar panel itself.
 * Desktop: fixed right-edge, 380px wide, slides in/out via transform.
 * Mobile: full-width overlay from the right.
 */
export const $SidebarPanel = styled.aside<SidebarPanelProps>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: ${({ $isMobile }) => ($isMobile ? '100%' : SIDEBAR_WIDTH)};
  background-color: var(--color-white);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.12);
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: ${({ $isOpen }) =>
    $isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.25s ease-in-out;
`;

/**
 * The "ear" tab button protruding from the left edge of the sidebar.
 * On desktop it sits at vertical center; on mobile it becomes a floating button.
 */
export const $SidebarEar = styled.button<{
  $isMobile: boolean;
  $isOpen: boolean;
}>`
  position: fixed;
  right: ${({ $isOpen }) => ($isOpen ? SIDEBAR_WIDTH : '0')};
  top: 60%;
  transform: translateY(-50%);
  /* Rounded left side, square right side */
  border-radius: 8px 0 0 8px;
  background-color: var(--color-coat-of-arms);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-s) var(--spacing-xs);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2-xs);
  font-size: var(--fontsize-body-s);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transition: right 0.25s ease-in-out;
  z-index: 201;

  &:hover {
    background-color: var(--color-coat-of-arms-dark);
  }
`;

export const $SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  @media (max-width: ${({ theme }: { theme: DefaultTheme }) =>
    theme.breakpoints.m}) {
    padding: 0 var(--spacing-m);
  }
`;

/** Mobile-only backdrop overlay */
export const $SidebarOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 199;
`;

/** Two-line clamped preview text in timeline step descriptions */
export const $TimelineNotePreview = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 var(--spacing-2-xs);
  color: var(--color-black-70);
  font-size: var(--fontsize-body-s);
`;

export const $DeveloperNote = styled(Notification) <NotificationProps>`

  width: unset;

  & div {
    font-size: var(--fontsize-body-s);
    white-space: pre-line;
  }
`;

export const $StickyTabs = styled(Tabs)`
  & > div[class*='Tabs-module_tablistBar'] {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: var(--color-white);
  }
`;


export const $TabPanel = styled(TabPanel)`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-m);
`;
