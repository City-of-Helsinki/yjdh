import { Button, IconDownload } from 'hds-react';
import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
  $Hr,
} from 'shared/components/forms/section/FormSection.sc';
import ExportFileType from 'shared/types/export-file-type';
import { useTheme } from 'styled-components';

export type ReportsSectionProp = {
  exportFileType: ExportFileType;
  children?: React.ReactNode;
  withDivider?: boolean;
  header: string;
  buttonText: string;
  onDownloadButtonClick: (type: ExportFileType) => void;
};

const ReportsSection: React.FC<ReportsSectionProp> = ({
  exportFileType,
  children,
  header,
  buttonText,
  onDownloadButtonClick,
  withDivider = false,
}) => {
  const theme = useTheme();

  return (
    <$Grid columns={1}>
      <$GridCell>
        <$GridCell>
          {' '}
          <Heading header={header} as="h2" size="m" />
        </$GridCell>

        {children && (
          <$GridCell>
            <$Grid
              css={`
                font-size: ${theme.fontSize.body.l};
              `}
            >
              {children}
            </$Grid>
          </$GridCell>
        )}
        <$GridCell>
          <$Grid columns={3}>
            <$GridCell>
              <Button
                theme="coat"
                iconLeft={<IconDownload />}
                css={`
                  margin-top: ${theme.spacing.l};
                `}
                onClick={() => onDownloadButtonClick(exportFileType)}
              >
                {buttonText} {String(exportFileType).toUpperCase()}
              </Button>
            </$GridCell>
          </$Grid>
        </$GridCell>
        {withDivider && (
          <$GridCell>
            <$Hr
              css={`
                margin-top: ${theme.spacing.l};
              `}
            />
          </$GridCell>
        )}
      </$GridCell>
    </$Grid>
  );
};

export default ReportsSection;
