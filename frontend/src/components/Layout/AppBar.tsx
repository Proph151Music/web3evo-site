import { useCallback, useState } from 'react';
import { Link } from 'wouter';
import NavBar from './NavBar';
import Button from '../ui/Button';
import Portal from '../ui/Portal';

export default function AppBar({ className = '' }: { className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((current) => !current);
  }, []);

  const appBarHeight = isMobileMenuOpen ? 'h-[300px]' : 'h-[100px]';

  return (
    <div className={appBarHeight + className}>
      <div className="flex justify-between items-center w-full h-[100px]">
        <Link to="/">
          <a href="/">
            <img src="/assets/navbar/header-logo.svg" alt="NFT Marketplace Logo" />
          </a>
        </Link>

        <div className="hidden md:block">
          <NavBar />
        </div>

        <div className="md:hidden">
          <Button
            className="bg-transparent p-0"
            title="Mobile menu button"
            iconPath="/assets/navbar/burger-menu.svg"
            onClick={toggleMobileMenu}
          />

          {isMobileMenuOpen && (
            <Portal container="main">
              <div className="absolute top-[100px] left-0 right-0 p-[inherit]">
                <NavBar />
              </div>
            </Portal>
          )}
        </div>
      </div>
    </div>
  );
}
