import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from '@styles/Footer.module.scss';

const Footer = () => {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footer__content}>
          <nav className={styles.footer__links}>
            <Link href="/privacy-policy">{t('links.privacy')}</Link>
            <Link href="/terms">{t('links.terms')}</Link>
            <Link href="/about">{t('links.about')}</Link>
            <Link href="/contact">{t('links.contact')}</Link>
          </nav>
          
          <div className={styles.footer__copyright}>
            © {currentYear} Around Nippon
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;