import { faBookOpen, faMapMarkedAlt, faRoute } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '@components/Footer';
import NavMenu from '@components/NavMenu';

const Home: NextPage = () => {
  const { data: session } = useSession();
  const t = useTranslations('home');
  return (
    <div>
      <Head>
        <title>Around Nippon - Discover Japan</title>
        <meta name="description" content="Explore Japan with Around Nippon" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavMenu />

      <main>
        <header className="hero">
          <div className="hero__content">
            <h1 className="hero__title">{t('hero.title')}</h1>
            <p className="hero__subtitle">{t('hero.subtitle')}</p>
            {session ? (
              <Link href="/itinerary" className="hero__cta">
                {t('hero.cta.authorised')}
              </Link>
            ) : (
              // redirect to /login
              <Link href="/login" className="hero__cta">
                {t('hero.cta.unauthorised')}
              </Link>
            )}
          </div>
        </header>

        <section className="features">
          <div className="container">
            <div className="features__grid">
              <div className="features__item">
                <FontAwesomeIcon icon={faMapMarkedAlt} className="feature-icon" />
                <h3>{t('features.map.title')}</h3>
                <p>{t('features.map.description')}</p>
              </div>
              <div className="features__item">
                <FontAwesomeIcon icon={faRoute} className="feature-icon" />
                <h3>{t('features.itinerary.title')}</h3>
                <p>{t('features.itinerary.description')}</p>
              </div>
              <div className="features__item">
                <FontAwesomeIcon icon={faBookOpen} className="feature-icon" />
                <h3>{t('features.travelInsights.title')}</h3>
                <p>{t('features.travelInsights.description')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about">
          <div className="container">
            <h2>{t('about.title')}</h2>
            <p>{t('about.description')}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
