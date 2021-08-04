import * as React from 'react';

import { $Content } from './Content.sc';

type ContentProps = { children: React.ReactNode };

const Content: React.FC<ContentProps> = ({ children }) => (
  <$Content>{children}</$Content>
);

export default Content;
