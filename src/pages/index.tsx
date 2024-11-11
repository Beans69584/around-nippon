// Home.tsx
import { faBookOpen, faMapMarkedAlt, faRoute } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '@components/Footer';
import NavMenu from '@components/NavMenu';
import styles from '@styles/Home.module.scss';

const Home: NextPage = () => {
  const { data: session } = useSession();
  const t = useTranslations('home');

  return (
    <div>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavMenu />

      <main>
        {/* Hero Section */}
        <header className={styles.hero}>
          <div className={styles.hero__content}>
            <h1 className={styles.hero__title}>
              {t('hero.title')}
            </h1>
            <p className={styles.hero__subtitle}>
              {t('hero.subtitle')}
            </p>
            {session ? (
              <Link href="/itinerary" className={styles.hero__cta}>
                {t('hero.cta.authorised')}
              </Link>
            ) : (
              <Link href="/login" className={styles.hero__cta}>
                {t('hero.cta.unauthorised')}
              </Link>
            )}
          </div>
        </header>

        {/* Features Section */}
        <section className={styles.features}>
          <div className="container">
            <div className={styles.features__grid}>
              <div className={styles.features__item}>
                <FontAwesomeIcon icon={faMapMarkedAlt} className={styles.featureIcon} />
                <h3>{t('features.map.title')}</h3>
                <p>{t('features.map.description')}</p>
              </div>
              <div className={styles.features__item}>
                <FontAwesomeIcon icon={faRoute} className={styles.featureIcon} />
                <h3>{t('features.itinerary.title')}</h3>
                <p>{t('features.itinerary.description')}</p>
              </div>
              <div className={styles.features__item}>
                <FontAwesomeIcon icon={faBookOpen} className={styles.featureIcon} />
                <h3>{t('features.travelInsights.title')}</h3>
                <p>{t('features.travelInsights.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className={styles.about}>
          <div className="container">
            <h2>{t('about.title')}</h2>
            <p>
              {t('about.description')}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
