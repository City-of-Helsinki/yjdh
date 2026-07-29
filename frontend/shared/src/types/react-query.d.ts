import React from 'react';

declare module 'react-query' {
  interface QueryClientProviderProps {
    children?: React.ReactNode;
  }
}
