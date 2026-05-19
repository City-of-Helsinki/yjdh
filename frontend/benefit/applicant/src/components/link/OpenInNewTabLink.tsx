import { LinkProps } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $OpenInNewTabLink } from './OpenInNewTabLink.sc';

const getTextFromChildren = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children
      .map((child) => getTextFromChildren(child as React.ReactNode))
      .join('');
  }
  if (React.isValidElement(children)) {
    return getTextFromChildren(
      (children as React.ReactElement<{ children?: React.ReactNode }>).props
        .children
    );
  }
  return '';
};

const OpenInNewTabLink: React.FC<LinkProps> = ({
  children,
  openInNewTab,
  openInNewTabLabel,
  'aria-label': ariaLabelProp,
  ...rest
}) => {
  const { t } = useTranslation();
  const isOpenInNewTab = openInNewTab ?? false;
  const label = openInNewTabLabel ?? t('common:openInNewTabLabel');
  const baseText = getTextFromChildren(children);
  const ariaLabel =
    (ariaLabelProp as string) ||
    (isOpenInNewTab ? `${baseText} ${label}` : baseText);

  return (
    <$OpenInNewTabLink
      {...rest}
      openInNewTab={isOpenInNewTab}
      aria-label={ariaLabel}
    >
      {children}
    </$OpenInNewTabLink>
  );
};

export default OpenInNewTabLink;
