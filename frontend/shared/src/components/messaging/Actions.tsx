import { Button, IconLock, TextArea } from 'hds-react';
import React from 'react';
import { useTheme } from 'styled-components';

import { $Actions, $FormActions } from './Messaging.sc';

type ActionProps = {
  customItems?: React.ReactNode;
};

/**
 * 
 * <span>
          <IconLock />
          Viestit ovat salattuja
        </span>
 */

const Actions: React.FC<ActionProps> = ({ customItems }) => {
  const theme = useTheme();
  console.log(customItems);
  return (
    <$Actions>
      <TextArea
        id="MessagesForm_Message"
        css={`
          margin-bottom: ${theme.spacing.s};
        `}
      />
      <$FormActions>
        {customItems}
        <Button type="submit" theme="coat" size="small" disabled>
          Lähetä
        </Button>
      </$FormActions>
    </$Actions>
  );
};

export default Actions;
