// src/components/ItineraryItem.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faClock,
  faYenSign,
  faEdit,
  faTrashAlt,
  faCar,
  faWalking,
  faUnlink,
  faStickyNote,
  faGlobe,
  faPhone,
  faStar,
  faImages,
  faBed,
  faUtensils,
  faBus,
  faMapMarker
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import styles from '@styles/ItineraryItem.module.scss';
import type { Destination } from '@type/itinerary';
import ImageViewer from '@components/ImageViewer';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

interface ItineraryItemProps {
  destination: Destination;
  index: number;
  sequenceNumber: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onTravelModeChange: (id: number, mode: 'DRIVING' | 'WALKING' | 'NONE') => void;
}

const ItineraryItem: React.FC<ItineraryItemProps> = ({
  destination,
  index,
  sequenceNumber,
  onEdit,
  onDelete,
  onTravelModeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const t = useTranslations('itinerary.itineraryItem');
  const router = useRouter();
  const locale = router.locale;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: 'attraction' | 'restaurant' | 'accommodation' | 'transport'): JSX.Element | string => {
    const icons = {
      attraction: faMapMarkerAlt,
      restaurant: faUtensils,
      accommodation: faBed,
      transport: faBus,
    };

    return icons[type] ? <FontAwesomeIcon icon={icons[type]} /> : <FontAwesomeIcon icon={faMapMarker} />;
  };

  const renderPhotos = () => {
    if (!destination.photos || destination.photos.length === 0) return null;

    return (
      <div className={styles.photoGallery}>
        <div
          className={styles.mainPhoto}
          onClick={() => {
            setViewerInitialIndex(activePhotoIndex);
            setIsViewerOpen(true);
          }}
          style={{ cursor: 'zoom-in' }}
        >
          <Image
            src={destination.photos[activePhotoIndex]}
            alt={destination.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        {destination.photos.length > 1 && (
          <div className={styles.thumbnails}>
            {destination.photos.map((photo, index) => (
              <button
                key={photo}
                className={`${styles.thumbnail} ${index === activePhotoIndex ? styles.active : ''}`}
                onClick={() => setActivePhotoIndex(index)}
              >
                <Image
                  src={photo}
                  alt=""
                  layout="fill"
                  objectFit="cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.itineraryItem} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.mainContent}>
        <div className={styles.sequence}>
          <span className={styles.sequenceNumber}>{sequenceNumber}</span>
          {index > 0 && (
            <div className={styles.travelMode}>
              <button
                className={`${styles.travelModeButton} ${destination.travelMode === 'DRIVING' ? styles.active : ''}`}
                onClick={() => onTravelModeChange(destination.id, 'DRIVING')}
                title={t('drivingButton.text')}
              >
                <FontAwesomeIcon icon={faCar} />
              </button>
              <button
                className={`${styles.travelModeButton} ${destination.travelMode === 'WALKING' ? styles.active : ''}`}
                onClick={() => onTravelModeChange(destination.id, 'WALKING')}
                title={t('walkingButton.text')}
              >
                <FontAwesomeIcon icon={faWalking} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <span className={styles.typeIcon}>{getTypeIcon(destination.type as any)}</span>
              <h3 className={styles.title}>{destination.name}</h3>
              {destination.rating && (
                <span className={styles.rating}>
                  <FontAwesomeIcon icon={faStar} />
                  {destination.rating.toFixed(1)}
                </span>
              )}
            </div>
            <div className={styles.actions}>
              <button onClick={() => onEdit(destination.id)} className={styles.actionButton}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button onClick={() => onDelete(destination.id)} className={styles.actionButton}>
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
              >
                <FontAwesomeIcon icon={faStickyNote} />
              </button>
            </div>
          </div>

          <div className={styles.basicInfo}>
            <div className={styles.infoItem}>
              <FontAwesomeIcon icon={faClock} />
              <span>{formatTime(destination.time)}</span>
            </div>
            <div className={styles.infoItem}>
              <FontAwesomeIcon icon={faYenSign} />
              <span>{Number(destination.budget).toLocaleString(locale)}</span>
            </div>
            <div className={styles.infoItem}>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{destination.location}</span>
            </div>
          </div>

          {isExpanded && (
            <div className={styles.expandedContent} ref={contentRef}>
              {renderPhotos()}

              {destination.description && (
                <div className={styles.description}>
                  <p>{destination.description}</p>
                </div>
              )}

              <div className={styles.additionalInfo}>
                {destination.websiteUrl && (
                  <a href={destination.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <FontAwesomeIcon icon={faGlobe} /> {t('websiteUrl.text')}
                  </a>
                )}
                {destination.phoneNumber && (
                  <a href={`tel:${destination.phoneNumber}`} className={styles.link}>
                    <FontAwesomeIcon icon={faPhone} /> {destination.phoneNumber}
                  </a>
                )}
              </div>

              {destination.notes && (
                <div className={styles.notes}>
                  <h4>Notes</h4>
                  <pre>{destination.notes}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isViewerOpen && (
        <ImageViewer
          images={destination.photos}
          initialIndex={viewerInitialIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default ItineraryItem;