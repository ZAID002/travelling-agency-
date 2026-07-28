'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plane, BookOpen, MapPin, Phone, UserCheck, ShieldAlert, FileText, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Helper to determine if link is active
  const isActive = (path) => pathname === path;

  // We check if we are in admin pages to render a different navigation or simple back button
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`${styles.container} container`}>
        <Link href="/" className={styles.logoLink} onClick={() => setIsOpen(false)}>
          <div className={styles.logo} style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Fly To Way Logo" className={`${styles.logoImg} ${scrolled ? styles.logoImgScrolled : ''}`} />
          </div>
        </Link>

        {/* Mobile Hamburger toggle button */}
        <button 
          className={styles.menuToggle} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`${styles.nav} ${isOpen ? styles.navActive : ''}`}>
          {isAdminPage ? (
            <>
              <Link 
                href="/admin/dashboard" 
                className={`${styles.link} ${isActive('/admin/dashboard') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/e-tickets" 
                className={`${styles.link} ${isActive('/admin/e-tickets') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                E-Tickets
              </Link>
              <Link 
                href="/admin/hotel-vouchers" 
                className={`${styles.link} ${isActive('/admin/hotel-vouchers') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Hotels
              </Link>
              <Link 
                href="/admin/maheen-hotel" 
                className={`${styles.link} ${isActive('/admin/maheen-hotel') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Umrah Vouchers
              </Link>
              <Link 
                href="/admin/invoices" 
                className={`${styles.link} ${isActive('/admin/invoices') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Invoices
              </Link>
              <button 
                onClick={async () => {
                  setIsOpen(false);
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                className={styles.logoutBtn}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/" 
                className={`${styles.link} ${isActive('/') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/hajj-umrah" 
                className={`${styles.link} ${isActive('/hajj-umrah') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <BookOpen size={16} /> Guides
              </Link>
              <Link 
                href="/places" 
                className={`${styles.link} ${isActive('/places') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <MapPin size={16} /> Holy Places
              </Link>
              <Link 
                href="/check-booking" 
                className={`${styles.link} ${isActive('/check-booking') ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <FileText size={16} /> Check Booking
              </Link>
              <Link 
                href="/#contact" 
                className={styles.link}
                onClick={() => setIsOpen(false)}
              >
                <Phone size={16} /> Contact
              </Link>
              <Link 
                href="/login" 
                className={styles.loginBtn}
                onClick={() => setIsOpen(false)}
              >
                <UserCheck size={16} /> Admin Portal
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
