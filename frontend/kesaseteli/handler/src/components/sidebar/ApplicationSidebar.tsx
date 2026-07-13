import {
  IconAngleLeft,
  IconAngleRight,
  Tab,
  TabList,
  TabPanel,
} from 'hds-react';
import { ApplicationListType } from 'kesaseteli/handler/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useMediaQuery from 'shared/hooks/useMediaQuery';
import { useTheme } from 'styled-components';

import useSessionStorageState from '../../hooks/useSessionStorageState';
import {
  $DeveloperNote,
  $GlobalSidebarStyle,
  $SidebarContent,
  $SidebarEar,
  $SidebarOverlay,
  $SidebarPanel,
  $StickyTabs,
} from './ApplicationSidebar.sc';
import ApplicationTimeline from './ApplicationTimeline';

const TIMELINE_TITLE_KEY = 'common:timeline.title';

type ApplicationSidebarProps = {
  applicationId: string | undefined;
  applicationType: ApplicationListType;
  isOpen: boolean;
  onToggle: () => void;
};

const ApplicationSidebar: React.FC<ApplicationSidebarProps> = ({
  applicationId,
  applicationType,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.m})`);
  // Fix HDS Notification dismiss bug that only sets opacity to 0.
  const [showDeveloperNote, setShowDeveloperNote] = useSessionStorageState(
    'show-timeline-developer-note',
    true
  );

  const EarIcon = isOpen ? IconAngleRight : IconAngleLeft;

  return (
    <>
      <$GlobalSidebarStyle $isOpen={isOpen} $isMobile={isMobile} />
      {isMobile && isOpen && (
        <$SidebarOverlay
          onClick={onToggle}
          aria-hidden="true"
          data-testid="sidebar-overlay"
        />
      )}

      <$SidebarEar
        $isMobile={isMobile}
        $isOpen={isOpen}
        onClick={onToggle}
        aria-label={
          isOpen
            ? t('common:timeline.sidebarToggleClose')
            : t('common:timeline.sidebarToggleOpen')
        }
        aria-expanded={isOpen}
        data-testid="sidebar-ear-button"
      >
        <EarIcon aria-hidden="true" />
        {t(TIMELINE_TITLE_KEY)}
      </$SidebarEar>

      <$SidebarPanel
        $isOpen={isOpen}
        $isMobile={isMobile}
        aria-label={t(TIMELINE_TITLE_KEY)}
        aria-hidden={!isOpen}
        data-testid="sidebar-panel"
      >
        <$SidebarContent>
          <$StickyTabs>
            <TabList>
              <Tab>{t(TIMELINE_TITLE_KEY)}</Tab>
            </TabList>
            <TabPanel>
              {showDeveloperNote && (
                <$DeveloperNote
                  label={t('common:timeline.developerNote.label')}
                  closeButtonLabelText={t('common:common.close')}
                  dismissible
                  onClose={() => setShowDeveloperNote(false)}
                >
                  {t('common:timeline.developerNote.content')}
                </$DeveloperNote>
              )}

              {applicationId && (
                <ApplicationTimeline
                  applicationId={applicationId}
                  applicationType={applicationType}
                  onToggle={onToggle}
                />
              )}
            </TabPanel>
          </$StickyTabs>
        </$SidebarContent>
      </$SidebarPanel>
    </>
  );
};

export default ApplicationSidebar;
