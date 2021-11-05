import Link, { LinkProps } from 'next/link';
import React from 'react';

type Props = LinkProps & { children: React.ReactNode };
/**
 * LinkText for NextJs link which is inside Trans-component.
 * See more: https://github.com/i18next/react-i18next/issues/1090#issuecomment-884927848
 */
const LinkText: React.FC<Props> = ({ href, children, ...rest }: Props) => (
  <Link {...rest} href={href ?? ''}>
    <a>{children}</a>
  </Link>
);

export default LinkText;
