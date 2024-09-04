'use client';

import {
  faBars,
  faBed,
  faCalendar,
  faCalendarAlt,
  faExchangeAlt,
  faExclamationTriangle,
  faFirstAid,
  faGem,
  faInfoCircle,
  faLanguage,
  faMapMarkerAlt,
  faPassport,
  faShoppingBag,
  faSignOutAlt,
  faSuitcase,
  faTimes,
  faToriiGate,
  faTrain,
  faUser,
  faUtensils,
  faWifi,
  faYenSign,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from '@styles/NavMenu.module.scss';
import LanguageSwitcher from '@components/LanguageSwitcher';
import { useToast } from '@contexts/ToastContext';

const NavMenu: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { data: session } = useSession();
  const router = useRouter();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [megaMenuVisible, setMegaMenuVisible] = useState(false);
  const [devBannerState, setDevBannerState] = useState<'visible' | 'dismissing' | 'dismissed'>('visible');
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('common');
  const { showToast } = useToast();
  const travelInfoLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (travelInfoLinkRef.current && travelInfoLinkRef.current.contains(event.target as Node)) {
        return;
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node) && megaMenuVisible) {
        setMegaMenuOpen(false);
        setTimeout(() => setMegaMenuVisible(false), 300);
      }
    };

    if (megaMenuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [megaMenuVisible]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  useEffect(() => {
    const checkDevBannerDismissal = () => {
      const dismissedTime = localStorage.getItem('devBannerDismissedTime');
      if (dismissedTime) {
        const currentTime = new Date().getTime();
        const dismissalDuration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
        if (currentTime - Number.parseInt(dismissedTime) < dismissalDuration) {
          setDevBannerState('dismissed');
        } else {
          localStorage.removeItem('devBannerDismissedTime');
          setDevBannerState('visible');
        }
      }
    };

    checkDevBannerDismissal();
    const interval = setInterval(checkDevBannerDismissal, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const dismissDevBanner = () => {
    setDevBannerState('dismissing');
    setTimeout(() => {
      setDevBannerState('dismissed');
      localStorage.setItem('devBannerDismissedTime', new Date().getTime().toString());
    }, 300);

    showToast(t('developmentBannerDismissed'), 'success');
  };

  const toggleMegaMenu = () => {
    if (megaMenuOpen) {
      setMegaMenuOpen(false);
      setTimeout(() => setMegaMenuVisible(false), 300);
    } else {
      if (!megaMenuVisible) {
        setMegaMenuVisible(true);
        setTimeout(() => setMegaMenuOpen(true), 50);
      } else {
        setMegaMenuOpen(true);
      }
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (megaMenuVisible) {
      timer = setTimeout(() => setMegaMenuOpen(true), 50);
    }
    return () => clearTimeout(timer);
  }, [megaMenuVisible]);

  const navigateToLogin = () => {
    router.push('/login');
  };

  const travelInfoSections = [
    {
      title: 'Planning Your Trip',
      items: [
        {
          title: t('megaMenu.japanOverview.title'),
          icon: faInfoCircle,
          link: '/travel-info/japan-overview',
          description: t('megaMenu.japanOverview.description'),
        },
        {
          title: t('megaMenu.visaAndEntry.title'),
          icon: faPassport,
          link: '/travel-info/visa-entry',
          description: t('megaMenu.visaAndEntry.description'),
        },
        {
          title: t('megaMenu.bestTimesToVisit.title'),
          icon: faCalendar,
          link: '/travel-info/best-times',
          description: t('megaMenu.bestTimesToVisit.description'),
        },
        {
          title: t('megaMenu.budgeting.title'),
          icon: faYenSign,
          link: '/travel-info/budgeting',
          description: t('megaMenu.budgeting.description'),
        },
        {
          title: t('megaMenu.packingGuide.title'),
          icon: faSuitcase,
          link: '/travel-info/packing-guide',
          description: t('megaMenu.packingGuide.description'),
        },
      ],
    },
    {
      title: 'During Your Stay',
      items: [
        {
          title: 'Transportation',
          icon: faTrain,
          link: '/travel-info/transportation',
          description: "Navigating Japan's efficient transport system",
        },
        {
          title: 'Accommodation',
          icon: faBed,
          link: '/travel-info/accommodation',
          description: 'From ryokans to capsule hotels',
        },
        {
          title: 'Food & Dining',
          icon: faUtensils,
          link: '/travel-info/food-dining',
          description: 'Culinary experiences and etiquette',
        },
        {
          title: 'Shopping Guide',
          icon: faShoppingBag,
          link: '/travel-info/shopping-guide',
          description: 'Where and what to buy',
        },
        {
          title: 'Connectivity',
          icon: faWifi,
          link: '/travel-info/connectivity',
          description: 'Staying connected in Japan',
        },
      ],
    },
    {
      title: 'Destinations & Experiences',
      items: [
        {
          title: 'Top Destinations',
          icon: faMapMarkerAlt,
          link: '/travel-info/top-destinations',
          description: 'Must-visit places in Japan',
        },
        {
          title: 'Hidden Gems',
          icon: faGem,
          link: '/travel-info/hidden-gems',
          description: 'Off-the-beaten-path locations',
        },
        {
          title: 'Culture & Customs',
          icon: faToriiGate,
          link: '/travel-info/culture-customs',
          description: 'Understanding Japanese traditions',
        },
        {
          title: 'Language Basics',
          icon: faLanguage,
          link: '/travel-info/language-basics',
          description: 'Essential Japanese phrases',
        },
        {
          title: 'Festivals & Events',
          icon: faCalendarAlt,
          link: '/travel-info/festivals-events',
          description: 'Seasonal celebrations',
        },
      ],
    },
    {
      title: 'Practical Information',
      items: [
        {
          title: 'Health & Safety',
          icon: faFirstAid,
          link: '/travel-info/health-safety',
          description: 'Staying safe and healthy',
        },
        {
          title: 'Emergency Info',
          icon: faExclamationTriangle,
          link: '/travel-info/emergency',
          description: 'Important contacts and procedures',
        },
        {
          title: 'Money Matters',
          icon: faExchangeAlt,
          link: '/travel-info/money-matters',
          description: 'Currency, ATMs, and payment methods',
        },
      ],
    },
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbar__container}>
          <Link href="/" className={styles.navbar__logo}>
            <span className={styles['navbar__logo-text']}>{t('title')}</span>
          </Link>
          <div
            className={`${styles['navbar__menu-container']} ${mobileMenuOpen ? styles.active : ''}`}
            id="navbarMenu"
          >
            <ul className={styles.navbar__menu}>
              <li>
                <Link href="/" className={styles.navbar__link}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/itinerary" className={styles.navbar__link}>
                  {t('nav.itinerary')}
                </Link>
              </li>
              <li>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <Link
                  href="javascript:void(0)"
                  className={styles.navbar__link}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMegaMenu();
                  }}
                  ref={travelInfoLinkRef}
                >
                  {t('nav.travelInfo')}
                </Link>
                {megaMenuVisible && (
                  <div
                    ref={megaMenuRef}
                    className={`${styles.navbar__megamenu} ${megaMenuOpen ? styles.open : ''}`}
                  >
                    {travelInfoSections.map((section) => (
                      <div key={uuidv4()} className={styles.navbar__megamenu_section}>
                        <h3>{section.title}</h3>
                        <ul>
                          {section.items.map((item) => (
                            <li key={uuidv4()}>
                              <Link href={item.link} className={styles.navbar__megamenu_link}>
                                <FontAwesomeIcon icon={item.icon} />
                                <span>{item.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            </ul>
            <div className={styles.navbar__auth}>
              {session ? (
                <button
                  onClick={() => signOut()}
                  className={styles['navbar__auth-button']}
                  type="button"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>{t('nav.logout')}</span>
                </button>
              ) : (
                <button
                  className={styles['navbar__auth-button']}
                  onClick={navigateToLogin}
                  type="button"
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>{t('nav.loginRegister')}</span>
                </button>
              )}
            </div>
            <div className={styles['navbar__language-switcher']}>
              <LanguageSwitcher />
            </div>
          </div>
          <button
            className={styles['navbar__mobile-toggle']}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            type="button"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </nav>
      <div
        className={`${styles['mobile-menu']} ${mobileMenuOpen ? styles.active : ''}`}
        id="mobileMenu"
      >
        <div className={styles['mobile-menu__overlay']} />
        <div className={styles['mobile-menu__content']}>
          <div className={styles['mobile-menu__header']}>
            <Link href="/" className={styles['mobile-menu__logo']}>
              {t('title')}
            </Link>
            <button
              className={styles['mobile-menu__close']}
              onClick={toggleMobileMenu}
              type="button"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <ul className={styles['mobile-menu__list']}>
            <li>
              <Link href="/" className={styles['mobile-menu__link']} onClick={toggleMobileMenu}>
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link href="/itinerary" className={styles['mobile-menu__link']} onClick={toggleMobileMenu}>
                {t('nav.itinerary')}
              </Link>
            </li>
            <li>
              <span className={styles['mobile-menu__link']}>{t('nav.travelInfo')}</span>
              <ul className={styles['mobile-menu__megamenu']}>
                {travelInfoSections.map((section) => (
                  <li key={uuidv4()} className={styles['mobile-menu__megamenu-section']}>
                    <button
                      className={styles['mobile-menu__section-toggle']}
                      onClick={() => toggleSection(section.title)}
                      type="button"
                    >
                      {section.title}
                      <FontAwesomeIcon
                        icon={expandedSections[section.title] ? faChevronUp : faChevronDown}
                      />
                    </button>
                    <ul className={`${styles['mobile-menu__submenu']} ${expandedSections[section.title] ? styles.expanded : ''}`}>
                      {section.items.map((item) => (
                        <li key={uuidv4()}>
                          <Link
                            href={item.link}
                            className={styles['mobile-menu__megamenu-link']}
                            onClick={toggleMobileMenu}
                          >
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
          <div className={styles['mobile-menu__auth']}>
            {session ? (
              <button
                onClick={() => {
                  signOut();
                  toggleMobileMenu();
                }}
                className={styles['mobile-menu__auth-button']}
                type="button"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>{t('nav.logout')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  navigateToLogin();
                  toggleMobileMenu();
                }}
                className={styles['mobile-menu__auth-button']}
                type="button"
              >
                <FontAwesomeIcon icon={faUser} />
                <span>{t('nav.loginRegister')}</span>
              </button>
            )}
          </div>
          <div className={styles['mobile-menu__language-switcher']}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      {process.env.NODE_ENV === 'development' && devBannerState !== 'dismissed' && (
        <div className={`${styles['development-banner']} ${styles[devBannerState]}`}>
          <div className={styles['development-banner__text-container']}>
            <h1>{t('developmentBanner')}</h1>
            <h2>{t('developmentBannerSubtitle')}</h2>
          </div>
          <button
            onClick={dismissDevBanner}
            type="button"
            className={styles['development-banner__close']}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
    </>
  );
};

export default NavMenu;