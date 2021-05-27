
import { useState } from 'react'

type ExtendedComponentProps = {
  menuOpen: boolean;
  logoLang: string;
  toggleMenu: () => void;
  closeMenu: () => void;
  handleNavigationItemClick: (pathname: string) => (event?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined) => void;
}

const useComponent = (locale: string, onNavigationItemClick?: (pathname: string) => void): ExtendedComponentProps => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = (): void => setMenuOpen(!menuOpen);
  const closeMenu = (): void => setMenuOpen(false);

  const handleNavigationItemClick = (pathname: string) => (
    event?: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if(event) {
      event.preventDefault();
    }
    if(onNavigationItemClick) {
      onNavigationItemClick(pathname);
    }
  };
  

  const logoLang = locale === 'sv' ? 'sv' : 'fi';

  return { menuOpen, logoLang, toggleMenu, closeMenu, handleNavigationItemClick }
}

export { useComponent }