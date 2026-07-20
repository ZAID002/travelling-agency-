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
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M18.403 5.597A9.855 9.855 0 0 0 12.003 3c-5.448 0-9.882 4.434-9.882 9.882 0 1.74.453 3.442 1.314 4.935L2 22l4.316-1.132a9.854 9.854 0 0 0 4.685 1.196h.004c5.447 0 9.882-4.434 9.882-9.882 0-2.64-1.028-5.122-2.484-6.585zm-6.4 14.808h-.003a8.214 8.214 0 0 1-4.188-1.147l-.3-.178-3.111.816.83-3.033-.195-.311a8.225 8.225 0 0 1-1.262-4.37c0-4.542 3.696-8.238 8.24-8.238 2.2 0 4.268.858 5.823 2.414a8.19 8.19 0 0 1 2.41 5.823c0 4.543-3.696 8.239-8.244 8.239zm4.52-6.175c-.248-.124-1.464-.723-1.691-.806-.227-.082-.392-.124-.557.124-.165.248-.64.806-.784.971-.144.165-.289.186-.537.062-.248-.124-1.046-.386-1.992-1.23-.736-.657-1.233-1.468-1.378-1.716-.144-.248-.015-.382.109-.505.111-.11.248-.289.372-.433.124-.145.165-.248.248-.413.082-.165.041-.31-.021-.433-.062-.124-.557-1.342-.763-1.838-.2-.483-.404-.418-.557-.426l-.475-.008c-.165 0-.433.062-.66.31-.227.248-.867.847-.867 2.067 0 1.22.888 2.397 1.012 2.562.124.165 1.748 2.67 4.234 3.743.591.255 1.053.407 1.413.521.594.189 1.134.162 1.56.098.476-.071 1.464-.599 1.67-1.177.207-.578.207-1.074.145-1.177-.062-.103-.227-.165-.475-.289z" 
            fill="#FFFFFF" 
          />
        </svg>
      </a>
    </div>
  );
}
