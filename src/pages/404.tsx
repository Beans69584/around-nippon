import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import NavMenu from '@components/NavMenu';
import styles from '@styles/NotFound.module.scss';

const Custom404 = () => {
  const t = useTranslations('common.404');

  return (
    <>
      <Head>
        <title>Lost in Translation - Around Nippon</title>
        <meta name="description" content="Page not found - Around Nippon" />
      </Head>

      <NavMenu />

      <div className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <h1 className={styles.notFoundTitle}>迷子になりました</h1>
          <p className={styles.notFoundSubtitle}>{t('subtitle')}</p>
          <p className={styles.notFoundMessage}>{t('message')}</p>
          <Link href="/" className={styles.notFoundLink}>
            {t('cta')}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Custom404;
