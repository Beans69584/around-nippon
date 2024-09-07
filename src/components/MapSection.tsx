import React, { useState } from 'react';
import JapanMap from '@components/JapanMap';
import styles from '@styles/JapanOverview.module.scss';

const MapSection: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const regions = [
    { name: 'Hokkaido', description: 'Known for its unspoiled nature and winter sports.', image: '/images/hokkaido.jpg' },
    { name: 'Tohoku', description: 'Rich in folklore and traditional culture.', image: '/images/tohoku.jpg' },
    { name: 'Kanto', description: 'Home to Tokyo, blending ultramodern and traditional.', image: '/images/kanto.jpg' },
    { name: 'Chubu', description: 'Features Mt. Fuji and the Japanese Alps.', image: '/images/chubu.jpg' },
    { name: 'Kansai', description: 'Historical heart of Japan with ancient capitals.', image: '/images/kansai.jpg' },
    { name: 'Chugoku', description: 'Home to Hiroshima and beautiful landscapes.', image: '/images/chugoku.jpg' },
    { name: 'Shikoku', description: 'Famous for its 88-temple pilgrimage route.', image: '/images/shikoku.jpg' },
    { name: 'Kyushu', description: 'Known for hot springs and active volcanoes.', image: '/images/kyushu.jpg' },
    { name: 'Okinawa', description: 'Tropical paradise with unique Ryukyuan culture.', image: '/images/okinawa.jpg' },
  ];

  return (
    <section className={styles.mapSection}>
      <h2 className={styles.sectionTitle}>Explore Japan&apos;s Regions</h2>
      <div className={styles.mapWrapper}>
        <div className={styles.mapContainer}>
          <JapanMap setActiveRegion={setActiveRegion} />
        </div>
        <div className={styles.regionList}>
          {regions.map((region) => (
            <div
              key={region.name}
              className={`${styles.regionItem} ${activeRegion === region.name ? styles.active : ''}`}
              onMouseEnter={() => setActiveRegion(region.name)}
              onMouseLeave={() => setActiveRegion(null)}
            >
              <h3>{region.name}</h3>
            </div>
          ))}
        </div>
      </div>
      {activeRegion && (
        <div className={styles.regionDetail}>
          <div className={styles.regionImage}>
            <img src={regions.find(r => r.name === activeRegion)?.image} alt={activeRegion} />
          </div>
          <div className={styles.regionInfo}>
            <h3>{activeRegion}</h3>
            <p>{regions.find(r => r.name === activeRegion)?.description}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default MapSection;