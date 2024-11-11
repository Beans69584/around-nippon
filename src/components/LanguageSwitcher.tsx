'use client';

import { faCheck, faGlobe, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import styles from '@styles/LanguageSwitcher.module.scss';
import { useToast } from '@contexts/ToastContext';

const languages = [
  { code: 'en', name: 'English', message: 'Switching to English' },
  { code: 'es', name: 'Español', message: 'Cambiando a Español' },
  { code: 'fr', name: 'Français', message: 'Passage à Français' },
  { code: 'de', name: 'Deutsch', message: 'Wechseln zu Deutsch' },
  { code: 'it', name: 'Italiano', message: 'Passando a Italiano' },
  { code: 'pl', name: 'Polski', message: 'Przełączanie na Polski' },
  { code: 'ja', name: '日本語', message: '日本語に切り替えています' },
  { code: 'ko', name: '한국어', message: '한국어로 전환 중입니다' },
  { code: 'zh-Hans', name: '简体中文', message: '正在切换到简体中文' },
  { code: 'zh-Hant', name: '繁體中文', message: '正在切換到繁體中文' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const changeLanguage = async (lng: string) => {
    if (lng === locale) return;

    const newLanguage = languages.find((lang) => lang.code === lng);
    if (!newLanguage) return;

    try {
      await router.push(router.pathname, router.asPath, { locale: lng });
      if (isMobile) setMobileMenuOpen(false);
      if (window.location.pathname.includes('/itinerary')) {
        window.location.reload();
      }
      showToast(newLanguage.message, 'success', 1500);
    } catch (error) {
      console.error('Failed to change language:', error);
      showToast('Failed to switch language', 'error');
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  if (isMobile) {
    return (
      <>
        <button onClick={toggleMobileMenu} className={styles.mobileTrigger}>
          <span>{currentLanguage.name}</span>
          <FontAwesomeIcon icon={faGlobe} className={styles.icon} />
        </button>
        {mobileMenuOpen && (
          <div className={styles.mobileDropdown}>
            <div className={styles.mobileDropdownHeader}>
              <h3>Select Language</h3>
              <button onClick={toggleMobileMenu} className={styles.closeButton}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <ul className={styles.mobileMenuList}>
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    className={styles.mobileMenuItem}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    {lang.name}
                    {locale === lang.code && (
                      <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.trigger}>
        <span>{currentLanguage.name}</span>
        <FontAwesomeIcon icon={faGlobe} className={styles.icon} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal> 
        <DropdownMenu.Content className={styles.dropdownContent} sideOffset={5}>
          {languages.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              className={styles.menuItem}
              onSelect={() => {
                changeLanguage(lang.code);
                return false;
              }}
            >
              {lang.name}
              {locale === lang.code && (
                <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}