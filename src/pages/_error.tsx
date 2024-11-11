// pages/_error.tsx
import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { NextPage, NextPageContext } from 'next';
import styles from '../styles/ErrorPage.module.scss';
import Link from 'next/link';

interface CustomErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

const CustomErrorComponent: NextPage<CustomErrorProps> = ({ statusCode, hasGetInitialPropsRun, err }) => {
  // If getInitialProps didn't run and there's an error, capture it
  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err);
  }

  // Custom error page UI
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorPageContainer}>
        <h1 className={styles.errorPageTitle}>Oops! Something went wrong.</h1>
        <p className={styles.errorPageMessage}>
          We&apos;re sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
        </p>
        <Link href="/" className={styles.errorPageButton}>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  const { res, err, asPath } = contextData;

  // Get initial props from Next.js's default error component
  const errorInitialProps = await import('next/error').then((mod) =>
    mod.default.getInitialProps(contextData)
  );

  // Mark that getInitialProps has run
  (errorInitialProps as any).hasGetInitialPropsRun = true;

  // If the error is a 404, no need to report it to Sentry
  if (res?.statusCode === 404) {
    return errorInitialProps;
  }

  // If there's an error, capture it
  if (err) {
    Sentry.captureException(err);
    await Sentry.flush(2000); // Wait up to 2 seconds for Sentry to send the error
    return errorInitialProps;
  }

  // If no error object is present, capture a generic error
  const error = new Error(`_error.tsx getInitialProps missing data at path: ${asPath}`);
  Sentry.captureException(error);
  await Sentry.flush(2000);

  return errorInitialProps;
};

export default CustomErrorComponent;
