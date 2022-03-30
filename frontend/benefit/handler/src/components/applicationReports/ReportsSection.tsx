import { Button, IconDownload } from 'hds-react';
import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
  $Hr,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

export type ReportsSectionProp = {
  children?: React.ReactNode;
  withDivider?: boolean;
  header: string;
  buttonText: string;
  onDownloadButtonClick: () => void;
};

const ReportsSection: React.FC<ReportsSectionProp> = ({
  children,
  header,
  buttonText,
  onDownloadButtonClick,
  withDivider = false,
}) => {
  const theme = useTheme();

  return (
    <$Grid>
      <$GridCell $colSpan={11}>
        <$GridCell>
          {' '}
          <Heading header={header} as="h2" size="m" />
        </$GridCell>

        {children && (
          <$GridCell $colSpan={11}>
            <$Grid
              css={`
                font-size: ${theme.fontSize.body.l};
              `}
            >
              {children}
            </$Grid>
          </$GridCell>
        )}

        <$GridCell $colSpan={5}>
          <Button
            theme="coat"
            iconLeft={<IconDownload />}
            css={`
              margin-top: ${theme.spacing.l};
            `}
            onClick={onDownloadButtonClick}
          >
            {buttonText}
          </Button>
        </$GridCell>

        {withDivider && (
          <$GridCell $colStart={1} $colSpan={11}>
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

ReportsSection.defaultProps = {
  children: null,
  withDivider: false,
};

export default ReportsSection;
