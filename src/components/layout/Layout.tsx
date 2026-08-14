import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

/** Routes that sit on the tinted app background rather than white. */
const APP_SURFACE_ROUTES = ['/bookings', '/booking', '/help'];

export function Layout() {
  const { pathname } = useLocation();
  /* One menu, two ways in: the top-bar burger and the tab bar's Menu tab. */
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onAppSurface = APP_SURFACE_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
    document.body.dataset.surface = onAppSurface ? 'app' : 'page';
  }, [pathname]);

  return (
    <>
      <ScrollProgress />
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <MobileNav open={menuOpen} onOpen={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)} />
    </>
  );
}
