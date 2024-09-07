import {
  faArrowRight,
  faEnvelope,
  faExclamationCircle,
  faLock,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type React from 'react';
import { useEffect, useState } from 'react';
import NavMenu from '@components/NavMenu';
import styles from '@styles/Login.module.scss';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [fade, setFade] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setError('');
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          redirect: false,
          username,
          password,
        });

        if (result?.error) {
          setError(result.error);
          setShake(true);
        } else {
          router.push('/itinerary');
        }
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
          await signIn('credentials', {
            redirect: false,
            username,
            password,
          });
          router.push('/itinerary');
        } else {
          const data = await response.json();
          setError(data.message || 'Registration failed');
          setShake(true);
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setShake(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setError('');
    };

  const toggleAuthMode = () => {
    setFade(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setUsername('');
      setEmail('');
      setPassword('');
      setError('');
      setFade(false);
    }, 300);
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/itinerary' });
  };

  return (
    <div className={styles.loginPage}>
      <Head>
        <title>{isLogin ? 'Login' : 'Register'} - Around Nippon</title>
      </Head>

      <NavMenu />

      <div
        className={`${styles.loginContainer} ${shake ? styles.shake : ''}`}
        onAnimationEnd={() => setShake(false)}
      >
        <div className={styles.loginImage}>
          <div className={styles.imageOverlay} />
        </div>
        <div className={`${styles.loginForm} ${fade ? styles.fade : ''}`}>
          <h2 className={styles.formTitle}>{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
          <p className={styles.formSubtitle}>
            {isLogin ? 'Log in to continue your journey' : 'Start your adventure in Japan'}
          </p>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <div className={styles.inputGroup}>
                <FontAwesomeIcon icon={faUser} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={handleInputChange(setUsername)}
                  required
                />
              </div>
            </div>
            {!isLogin && (
              <div className={styles.formGroup}>
                <div className={styles.inputGroup}>
                  <FontAwesomeIcon icon={faEnvelope} />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    required
                  />
                </div>
              </div>
            )}
            <div className={styles.formGroup}>
              <div className={styles.inputGroup}>
                <FontAwesomeIcon icon={faLock} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  required
                />
              </div>
            </div>
            {error && (
              <div className={styles.errorMessage}>
                <FontAwesomeIcon icon={faExclamationCircle} />
                {error}
              </div>
            )}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
              {!isLoading && <FontAwesomeIcon icon={faArrowRight} className={styles.submitIcon} />}
            </button>
          </form>
          <div className={styles.divider}>
            <span>or</span>
          </div>
          <button onClick={handleGoogleSignIn} className={styles.googleButton}>
            <FontAwesomeIcon icon={faGoogle} className={styles.googleIcon} />
            Sign in with Google
          </button>
          <p className={styles.toggleAuthMode}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={toggleAuthMode}>
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;