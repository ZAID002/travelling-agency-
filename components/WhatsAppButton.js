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
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.77 0-3.502-.477-5.02-1.381l-.36-.214-3.731.978.996-3.637-.235-.374a9.927 9.927 0 0 1-1.523-5.263c0-5.485 4.463-9.948 9.948-9.948 2.658 0 5.156 1.036 7.034 2.915a9.882 9.882 0 0 1 2.913 7.033c0 5.486-4.463 9.95-9.948 9.95m.001-18.41c-6.196 0-11.238 5.042-11.238 11.238 0 2.158.614 4.257 1.776 6.074l-1.89 6.9 7.065-1.853a11.196 11.196 0 0 0 5.286 1.34h.005c6.195 0 11.237-5.042 11.237-11.239 0-3.001-1.168-5.823-3.291-7.946A11.16 11.16 0 0 0 12.052 3.447" />
        </svg>
      </a>
    </div>
  );
}
