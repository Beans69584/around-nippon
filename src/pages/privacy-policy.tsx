import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import NavMenu from '@components/NavMenu';
import { PrismaClient } from '@prisma/client';
import DOMPurify from 'isomorphic-dompurify';
import styles from '@styles/PrivacyPolicy.module.scss';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

interface PrivacyPolicyProps {
  content: string;
  lastUpdatedISO: string;
  title: string;
  description: string;
}

const PrivacyPolicy: NextPage<PrivacyPolicyProps> = ({ content, lastUpdatedISO }) => {
  const t = useTranslations('privacy-policy');
  const router = useRouter();
  const locale = router.locale || 'en';
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  }).format(new Date(lastUpdatedISO));

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(content, {
    ADD_TAGS: ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a'],
    ADD_ATTR: ['href', 'target', 'rel'],
  });

  return (
    <div>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
      </Head>

      <NavMenu />

      <main className={styles.privacyContainer}>
        <header className={styles.header}>
          <h1>{t('header.title')}</h1>
          <div className={styles.lastUpdated}>
            {t('header.lastUpdated', { date: formattedDate })}
          </div>
        </header>

        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const prisma = new PrismaClient();
  const policy = await prisma.legalDocument.findFirst({
    where: { title: 'Privacy Policy', locale },
  });
  await prisma.$disconnect();

  if (!policy) {
    return { notFound: true };
  }

  return {
    props: {
      content: policy.content,
      lastUpdatedISO: policy.updatedAt.toISOString(),
    },
  };
}

export default PrivacyPolicy;

