import React from 'react';

export type OptionType<T extends string | number = string | number> = {
  label: string;
  value: T;
};

export type NavigationItem = {
  label: React.ReactNode;
  url: string;
  icon?: React.ReactNode;
};

export type Headers = {
  [name: string]: string;
};

export type ThemeOption = 'dark' | 'light';

export type NavigationVariant = 'default' | 'inline';

declare global {
  interface Window {
    // Matomo
    _paq: [string, ...unknown[]][];
  }
}
