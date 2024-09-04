import { useTranslations } from 'next-intl';
import styles from '@styles/Footer.module.scss';

const Footer = () => {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  const copyright = t('copyright', {
    year: currentYear,
    love: `<span class="${styles.footer__love}">${t('love')}</span>`,
  });

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footer__copyright}>
          <p dangerouslySetInnerHTML={{ __html: copyright }} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
