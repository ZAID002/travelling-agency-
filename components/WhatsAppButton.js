'use client';

import { usePathname } from 'next/navigation';
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
        <svg 
          width="34" 
          height="34" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* White outer speech bubble outline with tail */}
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M12.04 2C6.5 2 2 6.5 2 12.04c0 2.19.7 4.21 1.9 5.86L2 22l4.22-1.87a10.02 10.02 0 0 0 5.82 1.83c5.54 0 10.04-4.5 10.04-10.04S17.58 2 12.04 2zm0 1.8c4.55 0 8.24 3.69 8.24 8.24 0 4.55-3.69 8.24-8.24 8.24-1.63 0-3.15-.48-4.43-1.3l-.32-.2-2.49.65.66-2.43-.21-.34a8.18 8.18 0 0 1-1.25-4.42c0-4.55 3.69-8.24 8.24-8.24z" 
            fill="#FFFFFF" 
          />
          {/* White inner phone handset */}
          <path 
            d="M15.42 13.91c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.37-1.94-1.19-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.41-.54-.42l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2.01 0 1.19.86 2.33.98 2.49.12.16 1.7 2.59 4.12 3.63.57.25 1.02.4 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" 
            fill="#FFFFFF" 
          />
        </svg>
      </a>
    </div>
  );
}
