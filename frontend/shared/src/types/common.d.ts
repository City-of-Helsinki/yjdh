import React from "react";

export type OptionType = {
  label: string;
  value: string;
};

export type NavigationItem = {
  label: string;
  url: string;
  icon?: React.ReactNode
};

export type Language = 'en' | 'fi' | 'sv';