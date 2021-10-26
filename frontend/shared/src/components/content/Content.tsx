import React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';

import { $Content } from './Content.sc';

type ContentProps = { children: React.ReactNode };

const Content: React.FC<ContentProps> = ({ children }) => (
  <$Content id={MAIN_CONTENT_ID}>{children}</$Content>
);

export default Content;
