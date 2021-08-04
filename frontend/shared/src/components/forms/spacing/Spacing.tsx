import * as React from 'react';

import { $Content, SpacingProps } from './Spacing.sc';

const Spacing: React.FC<SpacingProps> = ({ size }) => <$Content size={size} />;

export default Spacing;
