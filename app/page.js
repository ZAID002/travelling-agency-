'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plane, Hotel, Compass, Shield, Send, CheckCircle, 
  MapPin, Clock, FileText, ArrowRight, MessageSquare
} from 'lucide-react';
import styles from './page.module.css';
import AnimatedSection from '@/components/AnimatedSection';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    packageType: 'Umrah Package',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          packageType: 'Umrah Package',
          message: ''
        });
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to send message. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.glowBlob1}></div>
        <div className={styles.glowBlob2}></div>
        <div className={`${styles.heroContent} container`}>
          <div className={`${styles.heroLogo} ${styles.animateFadeIn}`}>
            <img src="/logo.png" alt="Fly To Way Logo" className={styles.largeLogo} style={{ objectFit: 'contain' }} />
          </div>
          <div className={`${styles.badge} ${styles.animateFadeInUp}`}>Hajj & Umrah Tour Management</div>
          <h1 className={`${styles.title} ${styles.animateFadeInUp} ${styles.delay100}`}>
            Plan Your Sacred Journey with <span className={styles.titleHighlight}>Absolute Comfort</span>
          </h1>
          <p className={`${styles.subtitle} ${styles.animateFadeInUp} ${styles.delay200}`}>
            Fly To Way provides full pilgrimage coordination, secure airline electronic ticket generation, hotel booking vouchers, and verified itineraries.
          </p>
          <div className={`${styles.heroActions} ${styles.animateFadeInUp} ${styles.delay300}`}>
            <Link href="#contact" className="btn btn-secondary btn-lg">
              Book Pilgrim Package <ArrowRight size={16} className={styles.arrowIconAnim} />
            </Link>
            <Link href="/check-booking" className="btn btn-outline btn-lg">
              <FileText size={16} /> Check Booking
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={`${styles.section} container`}>
        <AnimatedSection className={styles.revealScale} threshold={0.15}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Travel Platform Capabilities</h2>
            <p className={styles.sectionSubtitle}>Integrated document generators and pilgrimage guides for modern travel administrators and clients.</p>
          </div>
        </AnimatedSection>

        <div className={styles.servicesGrid}>
          <AnimatedSection className={`${styles.serviceCard} reveal-scale delay-100`} threshold={0.1}>
            <div className={styles.iconWrapper}>
              <Plane size={24} className={styles.planeIconAnim} />
            </div>
            <h3 className={styles.cardTitle}>E-Ticket Generator</h3>
            <p className={styles.cardDesc}>
              Quickly create, format, and download high-resolution flight vouchers with multi-passenger, scan-passport, and return routing configurations.
            </p>
          </AnimatedSection>

          <AnimatedSection className={`${styles.serviceCard} reveal-scale delay-200`} threshold={0.1}>
            <div className={styles.iconWrapper}>
              <Hotel size={24} className={styles.hotelIconAnim} />
            </div>
            <h3 className={styles.cardTitle}>Hotel Booking Vouchers</h3>
            <p className={styles.cardDesc}>
              Generate sequential hotel confirmation slips specifically optimized for pilgrimage stays (Makkah & Madinah) including star rating and Haram views.
            </p>
          </AnimatedSection>

          <AnimatedSection className={`${styles.serviceCard} reveal-scale delay-300`} threshold={0.1}>
            <div className={styles.iconWrapper}>
              <Compass size={24} className={styles.compassIconAnim} />
            </div>
            <h3 className={styles.cardTitle}>Pilgrimage Guides</h3>
            <p className={styles.cardDesc}>
              Structured, step-by-step instructions for performing Hajj & Umrah correctly. Access maps, checklists, and guides for all holy places.
            </p>
          </AnimatedSection>

          <AnimatedSection className={`${styles.serviceCard} reveal-scale delay-400`} threshold={0.1}>
            <div className={styles.iconWrapper}>
              <Shield size={24} className={styles.shieldIconAnim} />
            </div>
            <h3 className={styles.cardTitle}>Secure Database Logs</h3>
            <p className={styles.cardDesc}>
              Store all generated tickets and hotel confirmations securely. Instantly search history by Passenger, PNR, or Voucher number.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Guides and Ziyarat Preview Sections */}
      <section className={`${styles.section} ${styles.sectionGrey}`}>
        <div className={`${styles.splitGrid} container`}>
          {/* Hajj & Umrah Steps */}
          <AnimatedSection className={`${styles.infoBlock} reveal-left`} threshold={0.15}>
            <h3 className={styles.blockTitle}>
              <Clock className={`${styles.iconWrapper} ${styles.clockIconAnim}`} style={{ margin: 0, width: 36, height: 36 }} />
              Umrah Rituals Checklist
            </h3>
            <p className={styles.sectionSubtitle}>A summary of the essential steps during the pilgrimage.</p>
            
            <ul className={styles.blockList}>
              <li className={styles.blockItem}>
                <div className={styles.bullet}>1</div>
                <div className={styles.itemText}>
                  <h5>Ihram</h5>
                  <p>Entering the state of purity and reciting the Talbiyah at the designated Miqat.</p>
                </div>
              </li>
              <li className={styles.blockItem}>
                <div className={styles.bullet}>2</div>
                <div className={styles.itemText}>
                  <h5>Tawaf</h5>
                  <p>Circumambulating the Holy Kaaba seven times counter-clockwise, beginning at the Black Stone.</p>
                </div>
              </li>
              <li className={styles.blockItem}>
                <div className={styles.bullet}>3</div>
                <div className={styles.itemText}>
                  <h5>Sa'ee</h5>
                  <p>Walking seven times between the historic hills of Safa and Marwah near the Kaaba.</p>
                </div>
              </li>
              <li className={styles.blockItem}>
                <div className={styles.bullet}>4</div>
                <div className={styles.itemText}>
                  <h5>Halq or Taqsir</h5>
                  <p>Shaving (men only) or trimming hair to symbolize completion of the sacred pilgrimage.</p>
                </div>
              </li>
            </ul>
            <Link href="/hajj-umrah" className="btn btn-outline" style={{ marginTop: 10 }}>
              Read Full Guides <ArrowRight size={16} />
            </Link>
          </AnimatedSection>

          {/* Holy Places Ziyarat Preview */}
          <AnimatedSection className={`${styles.infoBlock} reveal-right`} threshold={0.15}>
            <h3 className={styles.blockTitle}>
              <MapPin className={`${styles.iconWrapper} ${styles.mapIconAnim}`} style={{ margin: 0, width: 36, height: 36 }} />
              Ziyarat Holy Sites
            </h3>
            <p className={styles.sectionSubtitle}>Key sites to visit during your stay in Makkah and Madinah.</p>

            <ul className={styles.blockList}>
              <li className={styles.blockItem}>
                <div className={styles.bullet}>M</div>
                <div className={styles.itemText}>
                  <h5>Masjid al-Haram & Masjid an-Nabawi</h5>
                  <p>The two holiest mosques in Islam located in Makkah and Madinah respectively.</p>
                </div>
              </li>
              <li className={styles.blockItem}>
                <div className={styles.bullet}>A</div>
                <div className={styles.itemText}>
                  <h5>Mount Arafat & Mina</h5>
                  <p>The central pillars of the Hajj pilgrimage where pilgrims gather for prayer and stoning rituals.</p>
                </div>
              </li>
              <li className={styles.blockItem}>
                <div className={styles.bullet}>Q</div>
                <div className={styles.itemText}>
                  <h5>Masjid Quba</h5>
                  <p>The first mosque built in Islamic history, located on the outskirts of Madinah.</p>
                </div>
              </li>
              <li className={styles.blockItem}>
                <div className={styles.bullet}>U</div>
                <div className={styles.itemText}>
                  <h5>Mount Uhud</h5>
                  <p>The historical battlefield in Madinah honoring the martyrs of early Islam.</p>
                </div>
              </li>
            </ul>
            <Link href="/places" className="btn btn-outline" style={{ marginTop: 10 }}>
              Explore Ziyarat Sites <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Booking Inquiry Form */}
      <section id="contact" className={`${styles.section} container`}>
        <AnimatedSection className={styles.revealScale} threshold={0.15}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Submit Booking Inquiry</h2>
            <p className={styles.sectionSubtitle}>Have questions about Hajj packages, custom flights, or hotel reservations? Let us coordinate it for you.</p>
          </div>
        </AnimatedSection>

        <div className={styles.contactContainer}>
          <AnimatedSection className={`${styles.contactInfo} reveal-left`} threshold={0.15}>
            <div>
              <h3 className={styles.cardTitle} style={{ color: '#ffffff', fontSize: 24, marginBottom: 20 }}>Get in Touch</h3>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 30 }}>
                Our customer coordination desk is open 24/7. Fill out the form and we will contact you within 24 hours.
              </p>
              
              <div className={styles.infoDetails}>
                <div className={styles.infoLink}>
                  <MapPin size={20} color="#0d9488" />
                  <div>
                    <h5 style={{ fontWeight: 600, fontSize: 14 }}>Address</h5>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>210 D, Military Accounts, Lahore</p>
                  </div>
                </div>
                <div className={styles.infoLink}>
                  <Clock size={20} color="#0d9488" />
                  <div>
                    <h5 style={{ fontWeight: 600, fontSize: 14 }}>Support Hours</h5>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>24 Hours a Day / 7 Days a Week</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 30, borderTop: '1px solid #1e293b', paddingTop: 20 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Fly To Way Agency Services Portfolio</span>
            </div>
          </AnimatedSection>

          <AnimatedSection className={`${styles.contactFormCard} reveal-right`} threshold={0.15}>
            {success && (
              <div className={styles.successMsg}>
                <CheckCircle size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Your inquiry has been successfully sent! We will call or email you soon.
              </div>
            )}
            
            {error && (
              <div className={styles.errorMsg}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="e.g. +92 300 1234567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="packageType">Interested Package</label>
                  <select
                    id="packageType"
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleChange}
                  >
                    <option value="Umrah Package">Umrah Package (Makkah & Madinah)</option>
                    <option value="Hajj Package">Hajj Pilgrimage Package</option>
                    <option value="Flight Booking Only">Flight Booking Only</option>
                    <option value="Hotel Booking Only">Hotel Reservation Only</option>
                    <option value="General Inquiry">General Inquiry / Custom Services</option>
                  </select>
                </div>

                <div className={styles.formGroupFull}>
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Please details your request (dates, passenger count, hotel preference, etc.)"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary submitBtn"
              >
                {loading ? 'Sending Inquiry...' : (
                  <>
                    <Send size={16} /> Send Inquiry
                  </>
                )}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
