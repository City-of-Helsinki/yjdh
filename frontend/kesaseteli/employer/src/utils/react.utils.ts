import React from 'react';

export const getDisplayName = <P>(WrappedComponent: React.FC<P>): string =>
  WrappedComponent.displayName ?? WrappedComponent.name ?? 'WrappedComponent';
