// components/TimelineItem.tsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faMapMarker,
  faClock,
  faYenSign,
  faEdit,
  faTrashAlt,
  faCar,
  faWalking,
  faGlobe,
  faPhone,
  faStar,
  faImages,
  faBed,
  faUtensils,
  faBus
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useState } from 'react';
import styles from '@styles/TimelineItem.module.scss';
import type { Destination } from '@type/itinerary';
import ImageViewer from './ImageViewer';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

interface TimelineItemProps {
  destination: Destination;
  index: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  destination,
  index,
  onEdit,
  onDelete,
}) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const t = useTranslations('itinerary.timelineItem');
  const router = useRouter();
  const locale = router.locale;

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
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

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineItem}>
        <div className={styles.timeColumn}>
          <div className={styles.timeMarker}>
            <span className={styles.time}>{formatTime(destination.time)}</span>
            <div className={styles.dot} />
          </div>
        </div>
        
        <div className={styles.contentColumn}>
          <div className={styles.card}>
            {/* Header */}
            <div className={styles.cardHeader}>
              <div className={styles.titleRow}>
                <div className={styles.typeAndTitle}>
                  <span className={styles.typeIcon}>{getTypeIcon(destination.type as any)}</span>
                  <h3 className={styles.title}>{destination.name}</h3>
                </div>
                <div className={styles.metadata}>
                  {destination.rating && (
                    <span className={styles.rating}>
                      <FontAwesomeIcon icon={faStar} />
                      {destination.rating.toFixed(1)}
                    </span>
                  )}
                  <div className={styles.actions}>
                    <button 
                      onClick={() => onEdit(destination.id)} 
                      className={styles.actionButton}
                      aria-label={t('header.edit.ariaLabel')}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => onDelete(destination.id)} 
                      className={styles.actionButton}
                      aria-label={t('header.delete.ariaLabel')}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={styles.cardContent}>
              <div className={styles.infoSection}>
                <div className={styles.detailsGrid}>
                  <div className={styles.detail}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{destination.location}</span>
                  </div>
                  <div className={styles.detail}>
                    <FontAwesomeIcon icon={faYenSign} />
                    <span>{Number(destination.budget).toLocaleString(locale)}</span>
                  </div>
                </div>

                {(destination.websiteUrl || destination.phoneNumber) && (
                  <div className={styles.contactsRow}>
                    {destination.websiteUrl && (
                      <a 
                        href={destination.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactLink}
                      >
                        <FontAwesomeIcon icon={faGlobe} />
                        <span>{t('websiteUrl.text')}</span>
                      </a>
                    )}
                    {destination.phoneNumber && (
                      <a 
                        href={`tel:${destination.phoneNumber}`}
                        className={styles.contactLink}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{destination.phoneNumber}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Photos Section */}
              {destination.photos && destination.photos.length > 0 && (
                <div className={styles.photoSection}>
                  <div className={styles.photoGrid}>
                    {destination.photos.slice(0, 4).map((photo, idx) => (
                      <div
                        key={photo}
                        className={styles.photoItem}
                        onClick={() => {
                          setViewerInitialIndex(idx);
                          setIsViewerOpen(true);
                        }}
                      >
                        <div className={styles.photoWrapper}>
                          <Image
                            src={photo}
                            alt=""
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        {idx === 3 && destination.photos.length > 4 && (
                          <div className={styles.morePhotos}>
                            <FontAwesomeIcon icon={faImages} />
                            <span>+{destination.photos.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {destination.description && (
                <div className={styles.descriptionSection}>
                  <p className={styles.description}>{destination.description}</p>
                </div>
              )}

              {/* Notes */}
              {destination.notes && (
                <div className={styles.notesSection}>
                  <pre className={styles.notes}>{destination.notes}</pre>
                </div>
              )}
            </div>
          </div>
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

export default TimelineItem;