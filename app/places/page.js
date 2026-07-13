import { MapPin, Globe, Compass } from 'lucide-react';
import styles from '../guides.module.css';

export const metadata = {
  title: 'Ziyarat Holy Places | Fly To Way',
  description: 'Guides and coordinates for visiting holy places (Ziyarat) in Makkah and Madinah during your Hajj or Umrah journey.',
};

export default function HolyPlacesPage() {
  const places = [
    {
      title: 'Masjid al-Haram',
      city: 'Makkah',
      location: 'Center of Makkah, Saudi Arabia',
      description: 'The largest mosque in the world, enclosing the Holy Kaaba. It is the focus of all Islamic prayer (Qibla) and the primary location for Tawaf and Sa\'ee rituals during Hajj and Umrah.',
      badge: 'Sacred site'
    },
    {
      title: 'Al-Masjid an-Nabawi',
      city: 'Madinah',
      location: 'Center of Madinah, Saudi Arabia',
      description: 'The Prophet\'s Mosque, established and built by the Prophet Muhammad. It is the second holiest mosque in Islam and contains the sacred Green Dome marking the resting place of the Prophet.',
      badge: 'Sacred site'
    },
    {
      title: 'Jabal al-Noor (Cave of Hira)',
      city: 'Makkah',
      location: '4 km from Masjid al-Haram',
      description: 'The Mountain of Light, hosting the small Cave of Hira where the Prophet Muhammad received the first divine revelations of the Holy Qur\'an from the Archangel Jibreel.',
      badge: 'Historical'
    },
    {
      title: 'Mount Arafat (Jabal ar-Rahmah)',
      city: 'Makkah',
      location: '20 km southeast of Makkah',
      description: 'The Mount of Mercy, a granite hill where the Prophet Muhammad delivered his Farewell Sermon. Spending the afternoon of the 9th Dhul-Hijjah here is the mandatory peak of Hajj.',
      badge: 'Hajj pillar'
    },
    {
      title: 'Masjid Quba',
      city: 'Madinah',
      location: '3 km south of Masjid an-Nabawi',
      description: 'The first mosque in Islamic history, whose foundation stone was laid by the Prophet Muhammad immediately upon his migration (Hijrah). Performing two rakaah of prayer here carries the reward of a complete Umrah.',
      badge: 'Historical'
    },
    {
      title: 'Mount Uhud Battle Site',
      city: 'Madinah',
      location: '5 km north of Masjid an-Nabawi',
      description: 'The site of the second major military encounter in Islamic history. Visitors pay respects at the Graves of the Martyrs, including the Prophet\'s beloved uncle, Hamza ibn Abdul-Muttalib.',
      badge: 'Historical'
    },
    {
      title: 'Mina (The Tent City)',
      city: 'Makkah',
      location: '8 km east of Makkah',
      description: 'A valley hosting hundreds of thousands of air-conditioned white Teflon tents. Hajj pilgrims reside here during the 8th, 10th, 11th, and 12th of Dhul-Hijjah and perform the Jamrat stoning.',
      badge: 'Hajj pillar'
    },
    {
      title: 'Masjid al-Qiblatayn',
      city: 'Madinah',
      location: '4 km northwest of Masjid an-Nabawi',
      description: 'The Mosque of the Two Qiblas. Historically, this is where the Prophet Muhammad received the revelation to redirect the direction of prayer (Qibla) from Jerusalem (Masjid al-Aqsa) to Makkah.',
      badge: 'Historical'
    }
  ];

  return (
    <div>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Ziyarat Holy Places & Landmarks</h1>
          <p className={styles.heroSubtitle}>
            Explore the historical, religious, and pilgrimage sites of Makkah and Madinah that you will visit on your Ziyarat journeys.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <div className={`${styles.layout} container`}>
        {/* Left Column - Places Grid */}
        <div className={styles.content}>
          <div className={styles.guideSection}>
            <h2 className={styles.sectionTitle}>
              <Compass size={24} color="#0d9488" />
              Ziyarat Guide Directory
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              We have listed the key landmarks in Makkah and Madinah. Visiting these sites offers deep spiritual connection and historical insight into early Islamic heritage.
            </p>

            <div className={styles.placeGrid}>
              {places.map((place, idx) => (
                <div key={idx} className={styles.placeCard}>
                  <div className={styles.placeImgPlaceholder}>
                    <span className={styles.placeBadge}>{place.badge}</span>
                    <Compass />
                  </div>
                  <div className={styles.placeInfo}>
                    <h3 className={styles.placeTitle}>{place.title}</h3>
                    <div className={styles.placeLocation}>
                      <MapPin size={12} color="var(--primary)" />
                      <span>{place.city} &bull; {place.location}</span>
                    </div>
                    <p className={styles.placeDesc}>{place.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Tips */}
        <aside className={styles.sidebar}>
          <div className={styles.widget}>
            <h4 className={styles.widgetTitle}>
              <Globe size={18} color="var(--primary)" />
              Ziyarat Etiquettes
            </h4>
            <ul className={styles.rulesList}>
              <li>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                <span>Maintain a state of Wudu (ablution) when visiting mosques.</span>
              </li>
              <li>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                <span>Send blessings (Salawat) upon the Prophet and his companions.</span>
              </li>
              <li>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                <span>Dress modestly, ensuring shoulders and knees are fully covered.</span>
              </li>
              <li>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                <span>Avoid pushing, crowding, or raising your voice in historical sites.</span>
              </li>
              <li>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                <span>Keep Makkah and Madinah clean by avoiding littering.</span>
              </li>
            </ul>
          </div>

          <div className={styles.widget}>
            <h4 className={styles.widgetTitle}>
              <MapPin size={18} color="var(--secondary)" />
              Transportation Info
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Ziyarat tours are typically organized by bus groups as part of your Fly To Way Umrah package. 
              Private taxi coordinators are also available in hotel lobbies for custom timelines.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
