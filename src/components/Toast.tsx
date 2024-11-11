// components/Toast.tsx
import React, { useState, useEffect } from 'react';
import styles from '@styles/Toast.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration: number;
  isLeaving: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration, isLeaving }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress > 0) {
          return prevProgress - (100 / (duration / 100));
        }
        clearInterval(timer);
        return 0;
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheck;
      case 'error':
        return faTimes;
      case 'warning':
        return faExclamationTriangle;
      case 'info':
        return faInfoCircle;
      default:
        return faInfoCircle;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]} ${isLeaving ? styles.leaving : ''}`}>
      <div className={styles.content}>
        <FontAwesomeIcon icon={getIcon()} className={styles.icon} />
        <p className={styles.message}>{message}</p>
        <button onClick={onClose} className={styles.closeButton}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default Toast;