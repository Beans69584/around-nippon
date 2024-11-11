// src/pages/japan-overview.tsx

import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faSun,
  faLeaf,
  faSnowflake,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import NavMenu from '@components/NavMenu';
import Footer from '@components/Footer';
import JapanMap from '@components/JapanMap';
import styles from '@styles/JapanOverview.module.scss';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const JapanOverviewPage: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  const t = useTranslations('travel_info.japan_overview');

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const regions = [
    {
      name: t('regions.hokkaido.name'),
      description: t('regions.hokkaido.description'),
      image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/hokkaido_1920w.jpg',
      attractions: t('regions.hokkaido.attractions').split(', '),
    },
    {
      name: t('regions.kanto.name'),
      description: t('regions.kanto.description'),
      image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/kanto_1920w.jpg',
      attractions: t('regions.kanto.attractions').split(', '),
    },
    {
      name: t('regions.chubu.name'),
      description: t('regions.chubu.description'),
      image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/chubu_1920w.jpg',
      attractions: t('regions.chubu.attractions').split(', '),
    },
    {
      name: t('regions.kansai.name'),
      description: t('regions.kansai.description'),
      image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/kansai_1920w.jpg',
      attractions: t('regions.kansai.attractions').split(', '),
    },
    {
      name: t('regions.chugoku.name'),
      description: t('regions.chugoku.description'),
      image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/chugoku_1920w.jpg',
      attractions: t('regions.chugoku.attractions').split(', '),
    },
    {
      name: t('regions.shikoku.name'),
      description: t('regions.shikoku.description'),
      image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/shikoku_1920w.jpg',
      attractions: t('regions.shikoku.attractions').split(', '),
    },
    {
      name: t('regions.kyushu.name'),
      description: t('regions.kyushu.description'),
      image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/kyushu_1920w.jpg',
      attractions: t('regions.kyushu.attractions').split(', '),
    },
    {
      name: t('regions.okinawa.name'),
      description: t('regions.okinawa.description'),
      image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/okinawa_1920w.jpg',
      attractions: t('regions.okinawa.attractions').split(', '),
    },
  ];

  const seasonalExperiences = {
    spring: {
      title: t('seasonalExperiences.spring.title'),
      description: t('seasonalExperiences.spring.description'),
      events: [
        {
          name: t('seasonalExperiences.spring.events.1.name'),
          date: t('seasonalExperiences.spring.events.1.date'),
          description: t('seasonalExperiences.spring.events.1.description'),
          image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/hanami_1920w.jpg',
        },
        {
          name: t('seasonalExperiences.spring.events.2.name'),
          date: t('seasonalExperiences.spring.events.2.date'),
          description: t('seasonalExperiences.spring.events.2.description'),
          image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/golden-week_1920w.jpg',
        },
      ],
    },
    summer: {
      title: t('seasonalExperiences.summer.title'),
      description: t('seasonalExperiences.summer.description'),
      events: [
        {
          name: t('seasonalExperiences.summer.events.1.name'),
          date: t('seasonalExperiences.summer.events.1.date'),
          description: t('seasonalExperiences.summer.events.1.description'),
          image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/gion-matsuri_1920w.jpg',
        },
        {
          name: t('seasonalExperiences.summer.events.2.name'),
          date: t('seasonalExperiences.summer.events.2.date'),
          description: t('seasonalExperiences.summer.events.2.description'),
          image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/obon_1920w.jpg',
        },
      ],
    },
    autumn: {
      title: t('seasonalExperiences.autumn.title'),
      description: t('seasonalExperiences.autumn.description'),
      events: [
        {
          name: t('seasonalExperiences.autumn.events.1.name'),
          date: t('seasonalExperiences.autumn.events.1.date'),
          description: t('seasonalExperiences.autumn.events.1.description'),
          image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/koyo_1920w.jpg',
        },
        {
          name: t('seasonalExperiences.autumn.events.2.name'),
          date: t('seasonalExperiences.autumn.events.2.date'),
          description: t('seasonalExperiences.autumn.events.2.description'),
          image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/takayama-festival_1920w.jpg',
        },
      ],
    },
    winter: {
      title: t('seasonalExperiences.winter.title'),
      description: t('seasonalExperiences.winter.description'),
      events: [
        {
          name: t('seasonalExperiences.winter.events.1.name'),
          date: t('seasonalExperiences.winter.events.1.date'),
          description: t('seasonalExperiences.winter.events.1.description'),
          image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/sapporo-snow-festival_1920w.jpg',
        },
        {
          name: t('seasonalExperiences.winter.events.2.name'),
          date: t('seasonalExperiences.winter.events.2.date'),
          description: t('seasonalExperiences.winter.events.2.description'),
          image: 'https://cdn.konpeki.co.uk/around-nippon/assets/travel-info/japan-overview/resized/onsen_1920w.jpg',
        },
      ],
    },
  };


  return (
    <div className={styles.container}>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavMenu />

      <main className={styles.main}>
        {/* Hero Section with Carousel */}
        <section className={styles.hero}>
          <Slider {...sliderSettings} className={styles.carousel}>
            <div className={styles.carouselSlide}>
              <Image
                src="https://cdn.konpeki.co.uk/around-nippon/assets/resized/cherry-blossoms_1920w.jpg"
                alt={t('carousel.1.image_alt')}
                layout="fill"
                objectFit="cover"
                className={styles.carouselImage}
                priority
              />
              <div className={styles.heroContent}>
                <h1 className={styles.title}>{t('carousel.1.title')}</h1>
                <p className={styles.subtitle}>{t('carousel.1.subtitle')}</p>
                <a href="#explore" className={styles.exploreButton}>
                  {t('carousel.1.cta_text')} <FontAwesomeIcon icon={faChevronRight} />
                </a>
              </div>
            </div>
            <div className={styles.carouselSlide}>
              <Image
                src="https://cdn.konpeki.co.uk/around-nippon/assets/resized/tokyo-night_1920w.jpg"
                alt={t('carousel.2.image_alt')}
                layout="fill"
                objectFit="cover"
                className={styles.carouselImage}
              />
              <div className={styles.heroContent}>
                <h1 className={styles.title}>{t('carousel.2.title')}</h1>
                <p className={styles.subtitle}>{t('carousel.2.subtitle')}</p>
                <a href="#explore" className={styles.exploreButton}>
                  {t('carousel.2.cta_text')} <FontAwesomeIcon icon={faChevronRight} />
                </a>
              </div>
            </div>
            <div className={styles.carouselSlide}>
              <Image
                src="https://cdn.konpeki.co.uk/around-nippon/assets/resized/traditional-kyoto_1920w.jpg"
                alt={t('carousel.3.image_alt')}
                layout="fill"
                objectFit="cover"
                className={styles.carouselImage}
              />
              <div className={styles.heroContent}>
                <h1 className={styles.title}>{t('carousel.3.title')}</h1>
                <p className={styles.subtitle}>{t('carousel.3.subtitle')}</p>
                <a href="#explore" className={styles.exploreButton}>
                  {t('carousel.3.cta_text')} <FontAwesomeIcon icon={faChevronRight} />
                </a>
              </div>
            </div>
          </Slider>
        </section>

        {/* Interactive Map Section */}
        <section id="explore" className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>{t('regions.title')}</h2>
          <div className={styles.mapWrapper}>
            <JapanMap setActiveRegion={setActiveRegion} />
          </div>
          {activeRegion && (
            <div className={styles.regionDetail}>
              <div className={styles.regionImage}>
                <Image
                  src={regions.find((r) => r.name === activeRegion)?.image || ''}
                  alt={activeRegion}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className={styles.regionInfo}>
                <h3>{activeRegion}</h3>
                <p>{regions.find((r) => r.name === activeRegion)?.description}</p>
                <ul>
                  {regions
                    .find((r) => r.name === activeRegion)
                    ?.attractions.map((attraction, index) => (
                      <li key={index}>{attraction}</li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Seasonal Experiences Section */}
        <section className={styles.seasonalExperiences}>
          <h2 className={styles.sectionTitle}>{t('seasonalExperiences.title')}</h2>
          <div className={styles.tabs}>
            {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
              <motion.button
                key={season}
                onClick={() => setActiveSeason(season)}
                className={`${styles.tabButton} ${activeSeason === season ? styles.activeTab : ''}`}
                whileTap={{ scale: 0.95 }}
                aria-pressed={activeSeason === season}
              >
                <FontAwesomeIcon
                  icon={
                    season === 'spring' || season === 'autumn'
                      ? faLeaf
                      : season === 'summer'
                        ? faSun
                        : faSnowflake
                  }
                />{' '}
                {seasonalExperiences[season].title}
              </motion.button>
            ))}
          </div>
          <div className={styles.experienceContent}>
            <motion.div
              key={activeSeason}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.experienceDetails}
            >
              <h3>{seasonalExperiences[activeSeason].title}</h3>
              <p>{seasonalExperiences[activeSeason].description}</p>
              <div className={styles.eventsGrid}>
                {seasonalExperiences[activeSeason].events.map((event, index) => (
                  <div key={index} className={styles.eventCard}>
                    <Image
                      src={event.image}
                      alt={event.name}
                      width={400}
                      height={250}
                      className={styles.eventImage}
                    />
                    <div className={styles.eventInfo}>
                      <h4>{event.name}</h4>
                      <span className={styles.eventDate}>{event.date}</span>
                      <p>{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Redesigned Highlights Section: "Top Attractions" */}
        <section className={styles.topAttractions} data-format="extra-gaps">
          <h2 className={styles.sectionTitle}>{t('topAttractions.title')}</h2>
          <Slider
            {...{
              dots: true,
              infinite: true,
              speed: 500,
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 4000,
              responsive: [
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 600,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ],
            }}
            className={styles.attractionsCarousel}
          >
            {regions.map((region) => (
              <motion.div
                key={region.name}
                className={styles.attractionCard}
                whileHover={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)' }}
              >
                <Image
                  src={region.image}
                  alt={region.name}
                  width={400}
                  height={250}
                  className={styles.attractionImage}
                />
                <div className={styles.attractionInfo}>
                  <h3>{region.name}</h3>
                  <p>{region.description}</p>
                  <ul>
                    {region.attractions.map((attraction, idx) => (
                      <li key={idx}>{attraction}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </Slider>
        </section>

        {/* Call to Action Section */}
        <section className={styles.callToAction}>
          <div className={styles.ctaContent}>
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.subtitle')}</p>
            <a href="/plan-your-trip" className={styles.ctaButton}>
              {t('cta.cta_text')}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div >
  );
};

export default JapanOverviewPage;
