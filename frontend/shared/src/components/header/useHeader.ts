import { useState } from 'react';
import { HeaderProps } from 'shared/components/header/Header';

type ExtendedComponentProps = {
  menuOpen: boolean;
  logoLang: string;
  toggleMenu: () => void;
  closeMenu: () => void;
  handleLogin: (
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined
  ) => void;
  handleLogout: (
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined
  ) => void;
};

const useHeader = (
  locale: HeaderProps['locale'],
  login: HeaderProps['login']
): ExtendedComponentProps => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (): void => setMenuOpen(!menuOpen);
  const closeMenu = (): void => setMenuOpen(false);

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
    handleLogin,
    handleLogout,
  };
};

export { useHeader };
