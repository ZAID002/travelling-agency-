import { BookOpen, Compass, ShieldAlert, Award, FileText, CheckSquare } from 'lucide-react';
import styles from '../guides.module.css';

export const metadata = {
  title: 'Hajj & Umrah Guides | Fly To Way',
  description: 'Complete guides and step-by-step instructions for performing Hajj and Umrah pilgrimages in Makkah and Madinah.',
};

export default function HajjUmrahPage() {
  return (
    <div>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Hajj & Umrah Step-by-Step Guides</h1>
          <p className={styles.heroSubtitle}>
            A comprehensive, verified procedure manual prepared by Fly To Way to support you on your spiritual journey.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <div className={`${styles.layout} container`}>
        {/* Left main content - The Guides */}
        <div className={styles.content}>
          
          {/* Umrah Guide Section */}
          <article className={styles.guideSection}>
            <h2 className={styles.sectionTitle}>
              <Compass size={24} color="#0d9488" />
              The Step-by-Step Guide to Umrah
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Umrah is a highly recommended spiritual pilgrimage (Sunnah) that can be performed at any time of the year. It consists of four basic pillars.
            </p>

            <div className={styles.timeline}>
              <div className={styles.timelineStep}>
                <div className={styles.stepDot}></div>
                <div className={styles.stepHeader}>
                  <h3 className={styles.stepTitle}>1. Entering the State of Ihram</h3>
                  <span className={styles.stepNum}>Pillar 1</span>
                </div>
                <div className={styles.stepBody}>
                  <p>
                    Before crossing the boundary limits (Miqat), perform ghusl (cleanliness bath), wear the clean white sheets of Ihram, perform two rakaah of nafl prayer, and declare your intention (Niyyah) for Umrah. Recite the Talbiyah frequently.
                  </p>
                  <div className={styles.stepTip}>
                    <strong>Pilgrim Tip:</strong> Keep repeating the Talbiyah out loud (for men) or silently (for women) until you reach the Holy Kaaba: <em>"Labbayk Allahumma Labbayk..."</em>
                  </div>
                </div>
              </div>

              <div className={styles.timelineStep}>
                <div className={styles.stepDot}></div>
                <div className={styles.stepHeader}>
                  <h3 className={styles.stepTitle}>2. Performing Tawaf of the Kaaba</h3>
                  <span className={styles.stepNum}>Pillar 2</span>
                </div>
                <div className={styles.stepBody}>
                  <p>
                    Enter Masjid al-Haram, locate the corner of the Black Stone (Hajar al-Aswad), and perform seven rounds of circumambulation (Tawaf) counter-clockwise. Perform two Rakaah of prayer at the Station of Ibrahim (Maqam Ibrahim) and drink Zamzam water.
                  </p>
                  <div className={styles.stepTip}>
                    <strong>Pilgrim Tip:</strong> For men, it is sunnah to leave the right shoulder bare during all seven rounds of Tawaf (Idtiba).
                  </div>
                </div>
              </div>

              <div className={styles.timelineStep}>
                <div className={styles.stepDot}></div>
                <div className={styles.stepHeader}>
                  <h3 className={styles.stepTitle}>3. Performing Sa'ee between Safa and Marwah</h3>
                  <span className={styles.stepNum}>Pillar 3</span>
                </div>
                <div className={styles.stepBody}>
                  <p>
                    Proceed to the hills of Safa and Marwah inside the Haram extension. Begin at Safa, face the Kaaba, make supplication, and walk to Marwah. Repeat this back-and-forth for a total of 7 legs (ending at Marwah).
                  </p>
                  <div className={styles.stepTip}>
                    <strong>Pilgrim Tip:</strong> Each single trip between hills counts as one leg (Safa to Marwah is 1, Marwah to Safa is 2, etc.).
                  </div>
                </div>
              </div>

              <div className={styles.timelineStep}>
                <div className={styles.stepDot}></div>
                <div className={styles.stepHeader}>
                  <h3 className={styles.stepTitle}>4. Shaving or Trimming Hair (Halq or Taqsir)</h3>
                  <span className={styles.stepNum}>Pillar 4</span>
                </div>
                <div className={styles.stepBody}>
                  <p>
                    After completing Sa'ee, men must either shave their heads completely (Halq) or trim their hair uniformly (Taqsir). Women trim a small amount (equal to a finger-joint) from the ends of their hair.
                  </p>
                  <div className={styles.stepTip}>
                    <strong>Pilgrim Tip:</strong> Shaving the head completely is highly recommended for men as it carries greater spiritual rewards. Once completed, your Ihram state ends and normal restrictions are lifted.
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Hajj Guide Section */}
          <article className={styles.guideSection}>
            <h2 className={styles.sectionTitle}>
              <Award size={24} color="#d97706" />
              The Step-by-Step Guide to Hajj
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Hajj is the fifth pillar of Islam, mandatory once in a lifetime for those who are physically and financially able. It occurs from the 8th to the 12th of Dhul-Hijjah.
            </p>

            <div className={styles.timeline}>
              <div className={styles.timelineStep}>
                <div className={styles.stepDot}></div>
                <div className={styles.stepHeader}>
                  <h3 className={styles.stepTitle}>Day 1 (8th Dhul-Hijjah) - Heading to Mina</h3>
                  <span className={styles.stepNum}>Mina</span>
                </div>
                <div className={styles.stepBody}>
                  <p>
                    Pilgrims assume Ihram from Makkah and travel to the tent city of Mina. Spend the day and night in prayer, reciting the five daily prayers starting with Dhuhr and ending with Fajr on the 9th day.
                  </p>
                </div>
              </div>

              <div className={styles.timelineStep}>
                <div className={styles.stepDot}></div>
                <div className={styles.stepHeader}>
                  <h3 className={styles.stepTitle}>Day 2 (9th Dhul-Hijjah) - Wuquf at Arafat & Muzdalifah</h3>
                  <span className={styles.stepNum}>Arafat</span>
                </div>
                <div className={styles.stepBody}>
                  <p>
                    After sunrise, leave Mina for Mount Arafat. Stand in supplication (Wuquf) from noon until sunset; this is the central pillar of Hajj. After sunset, travel silently to Muzdalifah, perform Maghrib and Isha prayers combined, and sleep on the open ground. Collect pebbles for stoning.
                  </p>
                </div>
              </div>

              <div className={styles.timelineStep}>
                <div className={styles.stepDot}></div>
                <div className={styles.stepHeader}>
                  <h3 className={styles.stepTitle}>Day 3 (10th Dhul-Hijjah) - Stoning, Sacrifice & Tawaf</h3>
                  <span className={styles.stepNum}>Eid Day</span>
                </div>
                <div className={styles.stepBody}>
                  <p>
                    Return to Mina. Throw seven pebbles at the Jamrat al-Aqaba (largest pillar). After stoning, perform the animal sacrifice (Qurbani), shave or trim hair (exit Ihram), and travel to Makkah to perform Tawaf al-Ifadah and Sa'ee. Return to Mina.
                  </p>
                </div>
              </div>

              <div className={styles.timelineStep}>
                <div className={styles.stepDot}></div>
                <div className={styles.stepHeader}>
                  <h3 className={styles.stepTitle}>Day 4 & 5 (11th & 12th Dhul-Hijjah) - Jamrat & Departure</h3>
                  <span className={styles.stepNum}>Jamrat</span>
                </div>
                <div className={styles.stepBody}>
                  <p>
                    Stone all three Jamrat pillars (Small, Medium, Large) with seven pebbles each after mid-day on both days. Before leaving Makkah to return home, perform the Farewell Tawaf (Tawaf al-Wadaa) at the Holy Kaaba.
                  </p>
                </div>
              </div>
            </div>
          </article>

        </div>

        {/* Right sidebar - Travel rules, restrictions, checklists */}
        <aside className={styles.sidebar}>
          
          {/* Prohibited acts during Ihram */}
          <div className={styles.widget}>
            <h4 className={styles.widgetTitle}>
              <ShieldAlert size={18} color="#ef4444" />
              Ihram Restrictions
            </h4>
            <ul className={styles.rulesList}>
              <li>
                <span className={styles.ruleIcon}>✕</span>
                <span>Do not cut, shave, or pluck hair or nails.</span>
              </li>
              <li>
                <span className={styles.ruleIcon}>✕</span>
                <span>Do not apply perfume, scented soaps, or oils to the body or garments.</span>
              </li>
              <li>
                <span className={styles.ruleIcon}>✕</span>
                <span>Men must not wear stitched clothing or cover their heads.</span>
              </li>
              <li>
                <span className={styles.ruleIcon}>✕</span>
                <span>Women must not cover their faces (Niqab) or hands (gloves).</span>
              </li>
              <li>
                <span className={styles.ruleIcon}>✕</span>
                <span>Do not engage in hunting, cutting plants, or arguments.</span>
              </li>
            </ul>
          </div>

          {/* Packing checklist */}
          <div className={styles.widget}>
            <h4 className={styles.widgetTitle}>
              <CheckSquare size={18} color="#0d9488" />
              Essential Travel Checklist
            </h4>
            <ul className={styles.rulesList}>
              <li>
                <span style={{ color: '#0d9488', fontWeight: 'bold' }}>✓</span>
                <span>Passport with Hajj/Umrah Visa copy</span>
              </li>
              <li>
                <span style={{ color: '#0d9488', fontWeight: 'bold' }}>✓</span>
                <span>Vaccination card / Meningitis certificate</span>
              </li>
              <li>
                <span style={{ color: '#0d9488', fontWeight: 'bold' }}>✓</span>
                <span>Two sets of stitched Ihram sheets</span>
              </li>
              <li>
                <span style={{ color: '#0d9488', fontWeight: 'bold' }}>✓</span>
                <span>Unscented toiletries (soap, sunscreen, toothpaste)</span>
              </li>
              <li>
                <span style={{ color: '#0d9488', fontWeight: 'bold' }}>✓</span>
                <span>Comfortable, flat, non-stitched sandals/slippers</span>
              </li>
              <li>
                <span style={{ color: '#0d9488', fontWeight: 'bold' }}>✓</span>
                <span>Travel prayer mat and pocket supplication books</span>
              </li>
            </ul>
          </div>

        </aside>
      </div>
    </div>
  );
}
