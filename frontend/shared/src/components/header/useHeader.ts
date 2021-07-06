import { useState } from 'react';
import { HeaderProps } from 'shared/components/header/Header';

type ExtendedComponentProps = {
  menuOpen: boolean;
  logoLang: string;
  toggleMenu: () => void;
  closeMenu: () => void;
  handleNavigationItemClick: (
    pathname: string
  ) => (
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined
  ) => void;
  handleLogin: (
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined
  ) => void;
  handleLogout: (
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined
  ) => void;
};

const useHeader = (
  locale: HeaderProps['locale'],
  onNavigationItemClick: HeaderProps['onNavigationItemClick'],
  login: HeaderProps['login']
): ExtendedComponentProps => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (): void => setMenuOpen(!menuOpen);
  const closeMenu = (): void => setMenuOpen(false);

  const handleNavigationItemClick = (pathname: string) => (
    event?: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (event) {
      event.preventDefault();
    }
    if (onNavigationItemClick) {
      onNavigationItemClick(pathname);
    }
  };

  const handleLogin = (event?: React.MouseEvent<HTMLAnchorElement>): void => {
    if (event) {
      event.preventDefault();
    }
    if (login) {
      login.onLogin();
    }
  };

  const handleLogout = (event?: React.MouseEvent<HTMLAnchorElement>): void => {
    if (event) {
      event.preventDefault();
    }
    if (login) {
      login.onLogout();
    }
  };

  const logoLang = locale === 'sv' ? 'sv' : 'fi';

  return {
    menuOpen,
    logoLang,
    toggleMenu,
    closeMenu,
    handleNavigationItemClick,
    handleLogin,
    handleLogout,
  };
};

export { useHeader };
