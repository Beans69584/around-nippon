// components/ImageViewer.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faTimes,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import styles from '@styles/ImageViewer.module.scss';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsLoading(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsLoading(true);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // TODO: handle CORS issues by making server request to download image instead
      // fetch with no-cors mode to avoid CORS issues
      const currentImageUrlEncoded = encodeURIComponent(images[currentIndex]);
      const response = await fetch(`/api/v1/images/download?url=${currentImageUrlEncoded}`, {
        headers: {
          'Accept': 'image/*',
        }
      });
      if (!response.ok) {
        console.error('Failed to download image:', response.statusText);
        return;
      }
      // get content type
      const fileName = response.headers.get('X-Image-Name') || 'image';
      const contentType = response.headers.get('content-type');
      console.log('Content type:', contentType);
      // get blob data
      const blob = await response.blob();
      // create object URL and download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // set filename and extension
      a.download = `${fileName}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const content = (
    <div className={styles.viewerPortal}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.overlay}
        onClick={onClose}
      >
        <motion.div
          className={styles.content}
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className={styles.header}>
            <span className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </span>
            <div className={styles.actions}>
              <button 
                onClick={handleDownload} 
                className={styles.actionButton}
                aria-label="Download image"
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
              <button 
                onClick={onClose} 
                className={styles.actionButton}
                aria-label="Close viewer"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          <div className={styles.imageContainer}>
            {isLoading && <div className={styles.loader} />}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={styles.imageWrapper}
              >
                <Image
                  src={images[currentIndex]}
                  alt=""
                  layout="fill"
                  objectFit="contain"
                  quality={100}
                  onLoadingComplete={() => setIsLoading(false)}
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {currentIndex > 0 && (
              <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                aria-label="Previous image"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}
            
            {currentIndex < images.length - 1 && (
              <button
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
          </div>

          <div className={styles.thumbnails}>
            {images.map((image, index) => (
              <button
                key={image}
                className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt=""
                  layout="fill"
                  objectFit="cover"
                />
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
};

export default ImageViewer;