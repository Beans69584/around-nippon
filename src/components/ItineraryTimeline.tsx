// ItineraryTimeline.tsx
import type React from 'react';
import { motion } from 'framer-motion';
import type { Destination } from '../types/itinerary';
import styles from '@styles/ItineraryTimeline.module.scss';

interface ItineraryTimelineProps {
  destinations: Destination[];
  onEdit: (destination: Destination) => void;
  onDelete: (id: number) => void;
}

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ destinations, onEdit, onDelete }) => {
  return (
    <div className={styles.timeline}>
      {destinations.map((destination, index) => (
        <motion.div
          key={destination.id}
          className={styles.timelineItem}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className={styles.timelineDate}>{destination.date}</div>
          <div className={styles.timelineContent}>
            <h3>{destination.name}</h3>
            <p>{destination.description}</p>
            <div className={styles.timelineActions}>
              <button onClick={() => onEdit(destination)} type="button">Edit</button>
              <button onClick={() => onDelete(destination.id)} type="button">Delete</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ItineraryTimeline;