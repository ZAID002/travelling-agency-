'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Hide floating WhatsApp button inside admin dashboard pages
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const phoneNumber = '923082122760';
  const message = encodeURIComponent('Assalam-o-Alaikum Fly To Way! I would like information regarding Hajj & Umrah packages.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.tooltip}>
        <span className={styles.statusDot}></span>
        <span>Need help? Chat with us!</span>
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
        aria-label="Chat with Fly To Way on WhatsApp"
        title="Chat with Fly To Way on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
