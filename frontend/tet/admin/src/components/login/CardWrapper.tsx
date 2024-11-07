import { Button, Card, CardCustomTheme } from 'hds-react';
import React from 'react';

const CardWrapper: React.FC<{
  border: boolean;
  heading: string;
  text: string;
  theme: CardCustomTheme;
  buttonText: string;
  onClick: () => void;
  dataTestId: string;
}> = ({ border, heading, text, theme, buttonText, onClick, dataTestId }) => (
  <Card border={border} heading={heading} text={text} theme={theme}>
    <Button role="link" onClick={onClick} data-testid={dataTestId}>
      {buttonText}
    </Button>
  </Card>
);

export default CardWrapper;
