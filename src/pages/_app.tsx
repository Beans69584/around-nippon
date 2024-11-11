// pages/_app.tsx
import '@styles/app.scss';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Spinner from '@components/Spinner';
import prisma from '@libs/prisma';
import styles from '@styles/withAuth.module.scss';
import { ToastProvider } from '@contexts/ToastContext';

config.autoAddCss = false;

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messages = await import(`../../locales/${router.locale}.json`);
        setMessages(messages.default);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [router.locale]);

  if (isLoading || !messages) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner />
      </div>
    );
  }

  return (
    <NextIntlClientProvider messages={messages} locale={router.locale}>
      <SessionProvider
        session={pageProps.session}
        basePath={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/auth`}
      >
        <ToastProvider>
          {/* Removed the <link> tag from here */}
          <Component {...pageProps} prisma={prisma} />
        </ToastProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}

export default App;
