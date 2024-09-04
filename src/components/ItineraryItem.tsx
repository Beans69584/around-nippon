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
} from '@fortawesome/free-solid-svg-icons';
import styles from '@styles/ItineraryItem.module.scss';
import type { Destination } from '@type/itinerary';

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
  const [notesExpanded, setNotesExpanded] = useState<boolean>(false);
  const [notesHeight, setNotesHeight] = useState<number>(0);
  const notesRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (notesRef.current) {
      setNotesHeight(notesRef.current.scrollHeight);
    }
  }, [destination.notes]);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const toggleNotes = (): void => {
    setNotesExpanded(!notesExpanded);
  };

  return (
    <div className={styles.itineraryItem}>
      <div className={styles.itemHeader}>
        <div className={styles.itemHeaderLeft}>
          <span className={styles.itemIndex}>{sequenceNumber}</span>
          <h3 className={styles.itemName}>{destination.name}</h3>
        </div>
        <div className={styles.itemActions}>
          <button onClick={() => onEdit(destination.id)} className={styles.actionButton}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button onClick={() => onDelete(destination.id)} className={styles.actionButton}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>
      </div>
      <div className={styles.itemContent}>
        <div className={styles.itemDetails}>
          <span className={styles.itemInfo}>
            <FontAwesomeIcon icon={faMapMarkerAlt} /> {destination.location}
          </span>
          <span className={styles.itemInfo}>
            <FontAwesomeIcon icon={faClock} /> {formatDate(destination.date)} {destination.time}
          </span>
          <span className={styles.itemInfo}>
            <FontAwesomeIcon icon={faYenSign} /> {Number(destination.budget).toLocaleString()}
          </span>
        </div>
        <div className={styles.itemType}>
          <span className={styles.typeTag}>{destination.type}</span>
          {destination.notes && (
            <button 
              className={`${styles.notesIndicator} ${notesExpanded ? styles.expanded : ''}`} 
              onClick={toggleNotes}
            >
              <FontAwesomeIcon icon={faStickyNote} />
            </button>
          )}
        </div>
      </div>
      {destination.notes && (
        <div 
          className={styles.itemNotes} 
          style={{ maxHeight: notesExpanded ? `${notesHeight}px` : '0' }}
        >
          <pre ref={notesRef}>{destination.notes}</pre>
        </div>
      )}
      {index > 0 && (
        <div className={styles.travelModeControls}>
          <button
            className={`${styles.travelModeButton} ${destination.travelMode === 'DRIVING' ? styles.active : ''}`}
            onClick={() => onTravelModeChange(destination.id, 'DRIVING')}
          >
            <FontAwesomeIcon icon={faCar} />
          </button>
          <button
            className={`${styles.travelModeButton} ${destination.travelMode === 'WALKING' ? styles.active : ''}`}
            onClick={() => onTravelModeChange(destination.id, 'WALKING')}
          >
            <FontAwesomeIcon icon={faWalking} />
          </button>
          <button
            className={`${styles.travelModeButton} ${destination.travelMode === 'NONE' ? styles.active : ''}`}
            onClick={() => onTravelModeChange(destination.id, 'NONE')}
          >
            <FontAwesomeIcon icon={faUnlink} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ItineraryItem;