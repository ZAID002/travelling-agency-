import Link from 'next/link';
import { Plane, Mail, Phone, MapPin, Globe } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        <div className={styles.grid}>
          <div className={styles.about}>
            <div className={styles.logo}>
              <Plane className={styles.logoIcon} />
              <span className={styles.logoText}>Fly To Way</span>
            </div>
            <p className={styles.description}>
              Connecting pilgrims and travelers with seamless Hajj, Umrah, and international travel solutions. Experience stress-free booking and customized travel documents.
            </p>
          </div>

          <div className={styles.links}>
            <h4 className={styles.title}>Quick Links</h4>
            <ul className={styles.list}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/hajj-umrah">Hajj & Umrah Guides</Link></li>
              <li><Link href="/places">Holy Places</Link></li>
              <li><Link href="/login">Admin Portal</Link></li>
            </ul>
          </div>

          <div className={styles.contact}>
            <h4 className={styles.title}>Contact Agency</h4>
            <ul className={styles.contactList}>
              <li>
                <Phone size={16} className={styles.contactIcon} />
                <span>+92 300 1234567</span>
              </li>
              <li>
                <Mail size={16} className={styles.contactIcon} />
                <span>info@flytoway.com</span>
              </li>
              <li>
                <MapPin size={16} className={styles.contactIcon} />
                <span>210 D, Military Accounts Society, College Road, Lahore, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Fly To Way Travels. All rights reserved.</p>
          <div className={styles.subtext}>
            <span>Designed for ultimate pilgrimage coordination</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
