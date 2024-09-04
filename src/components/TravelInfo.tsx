import Link from 'next/link';
import type React from 'react';
import styles from '@styles/TravelInfo.module.scss';

const TravelInfo: React.FC = () => {
  return (
    <div className={styles.travelInfoContainer}>
      <h1 className={styles.title}>Travel Info</h1>
      <div className={styles.infoGrid}>
        <InfoCard title="Japan Overview" icon="info-circle" link="/travel-info/japan-overview" />
        <InfoCard title="Visa & Entry" icon="passport" link="/travel-info/visa-entry" />
        <InfoCard title="When to Visit" icon="calendar" link="/travel-info/when-to-visit" />
        <InfoCard title="Budgeting" icon="yen-sign" link="/travel-info/budgeting" />
        <InfoCard title="Packing List" icon="suitcase" link="/travel-info/packing-list" />
        <InfoCard title="Transportation" icon="train" link="/travel-info/transportation" />
        <InfoCard title="Accommodation" icon="bed" link="/travel-info/accommodation" />
        <InfoCard title="Dining" icon="utensils" link="/travel-info/dining" />
        <InfoCard
          title="Popular Destinations"
          icon="map-marker-alt"
          link="/travel-info/popular-destinations"
        />
        <InfoCard title="Hidden Gems" icon="gem" link="/travel-info/hidden-gems" />
        <InfoCard title="Shopping Guide" icon="shopping-bag" link="/travel-info/shopping-guide" />
        <InfoCard title="Culture & Customs" icon="torii-gate" link="/travel-info/culture-customs" />
        <InfoCard title="Language Help" icon="language" link="/travel-info/language-help" />
        <InfoCard
          title="Festivals & Events"
          icon="calendar-alt"
          link="/travel-info/festivals-events"
        />
        <InfoCard title="Health & Safety" icon="first-aid" link="/travel-info/health-safety" />
        <InfoCard title="Connectivity" icon="wifi" link="/travel-info/connectivity" />
        <InfoCard
          title="Emergency Information"
          icon="exclamation-triangle"
          link="/travel-info/emergency"
        />
        <InfoCard
          title="Currency Converter"
          icon="exchange-alt"
          link="/travel-info/currency-converter"
        />
        <InfoCard title="Weather" icon="cloud-sun" link="/travel-info/weather" />
        <InfoCard title="Translator" icon="language" link="/travel-info/translator" />
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ title: string; icon: string; link: string }> = ({
  title,
  icon,
  link,
}) => {
  return (
    <Link href={link}>
      <div className={styles.infoCard}>
        <i className={`fas fa-${icon} ${styles.icon}`} />
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
    </Link>
  );
};

export default TravelInfo;
