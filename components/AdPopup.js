'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import styles from './AdPopup.module.css';

export default function AdPopup() {
  const pathname = usePathname();
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  // Don't show popup on admin pages
  const isAdminPage = pathname && pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminPage) return;

    // Check if already shown this session
    const alreadyShown = sessionStorage.getItem('ftw_ad_shown');
    if (alreadyShown) return;

    // Fetch active ads from DB
    fetch('/api/advertisements')
      .then((res) => res.json())
      .then((data) => {
        // Only show popup if admin has uploaded at least one active ad
        if (Array.isArray(data) && data.length > 0) {
          setAds(data);
          setTimeout(() => setVisible(true), 600);
        }
        // If no ads — do nothing, popup stays hidden
      })
      .catch(() => {
        // On error — do nothing, popup stays hidden
      });
  }, [isAdminPage]);

  const handleClose = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem('ftw_ad_shown', '1');
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
  }, [ads.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
  }, [ads.length]);

  // Close on Escape key
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [visible, handleClose]);

  if (!visible || ads.length === 0 || isAdminPage) return null;

  const currentAd = ads[currentIndex];

  return (
    <div className={styles.overlay} onClick={handleClose} role="dialog" aria-modal="true" aria-label="Advertisement">
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.liveDot} />
            <span className={styles.headerTitle}>Special Offer — Fly To Way</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close advertisement"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Image Area */}
        <div className={styles.imageArea}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentAd._id}
            src={currentAd.imageUrl}
            alt={currentAd.title || 'FlytoWay Special Offer'}
            className={styles.adImage}
          />

          {/* Prev/Next arrows (only if multiple ads) */}
          {ads.length > 1 && (
            <>
              <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={handlePrev} aria-label="Previous ad">
                ‹
              </button>
              <button className={`${styles.navBtn} ${styles.navNext}`} onClick={handleNext} aria-label="Next ad">
                ›
              </button>
            </>
          )}

          {/* Dot indicators */}
          {ads.length > 1 && (
            <div className={styles.carouselControls}>
              {ads.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === currentIndex ? styles.activeDot : ''}`}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to ad ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {currentAd.title && (
            <div className={styles.adTitle}>{currentAd.title}</div>
          )}
          <div className={styles.footerText}>
            Click anywhere outside to close &nbsp;·&nbsp; {ads.length > 1 ? `${currentIndex + 1} of ${ads.length}` : 'FlytoWay Travel & Tours'}
          </div>
        </div>

      </div>
    </div>
  );
}
