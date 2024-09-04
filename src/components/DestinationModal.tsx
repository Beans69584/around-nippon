import {
  faCalendarAlt,
  faClock,
  faPlus,
  faSearch,
  faTimes,
  faYenSign,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import styles from '@styles/DestinationModal.module.scss';
import type { Destination } from '@type/itinerary';

const destinationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  location: Yup.string().required('Location is required'),
  date: Yup.date().required('Date is required'),
  time: Yup.string().required('Time is required'),
  type: Yup.string().oneOf(
    ['attraction', 'restaurant', 'accommodation', 'transport'],
    'Invalid type'
  ),
  budget: Yup.number().min(0, 'Budget must be positive').required('Budget is required'),
  description: Yup.string(),
});

interface DestinationModalProps {
  onClose: () => void;
  onSubmit: (destination: Destination) => void;
  initialData?: Destination | null;
}

const DestinationModal: React.FC<DestinationModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [destination, setDestination] = useState<Destination>({
    id: 0,
    name: '',
    location: '',
    date: '',
    time: '',
    type: 'attraction',
    budget: 0,
    description: '',
    lat: 0,
    lng: 0,
    travelMode: 'DRIVING',
    notes: '',
  });

  const [step, setStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDestination(initialData);
      setIsEditMode(true);
      setStep(1); // Start at the first editable step
    }
  }, [initialData]);

  useEffect(() => {
    if (window?.google?.maps && autocompleteInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'jp' },
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          handlePlaceSelection(place);
        }
      });
    }
  }, []);

  const handlePlaceSelection = (place: google.maps.places.PlaceResult) => {
    let notes = 'Automatically generated information:\n\n';

    if (place.opening_hours) {
      notes += 'Opening hours:\n';
      for (const day of place?.opening_hours?.weekday_text ?? []) {
        notes += `${day}\n`;
      }
      notes += '\n';
    }

    if (place.formatted_phone_number) {
      notes += `Phone: ${place.formatted_phone_number}\n`;
    }

    if (place.website) {
      notes += `Website: ${place.website}\n`;
    }

    if (place.rating) {
      notes += `Rating: ${place.rating} (${place.user_ratings_total} reviews)\n`;
    }

    notes +=
      '\nDisclaimer: This information is automatically generated from Google Maps data and may not be up to date or accurate. Please verify details before visiting.\n';

    setDestination((prev) => ({
      ...prev,
      name: place.name || '',
      location: place.formatted_address || '',
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0,
      notes: notes,
    }));

    setStep(2);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDestination((prev) => ({
      ...prev,
      [name]: name === 'budget' ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    destinationSchema
      .validate(destination)
      .then(() => {
        onSubmit(destination);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const renderStep = () => {
    if (isEditMode) {
      return (
        <div className={styles.step}>
          <h3>Edit Destination Details</h3>
          <input
            className={styles.formInput}
            type="text"
            name="name"
            placeholder="Destination name"
            value={destination.name}
            onChange={handleChange}
          />
          <input
            className={styles.formInput}
            type="text"
            name="location"
            placeholder="Location"
            value={destination.location}
            onChange={handleChange}
          />
          <div className={styles.dateTimeInputs}>
            <div className={styles.inputWrapper}>
              <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
              <input
                className={styles.input}
                type="date"
                name="date"
                value={destination.date}
                onChange={handleChange}
              />
            </div>
            <div className={styles.inputWrapper}>
              <FontAwesomeIcon icon={faClock} className={styles.icon} />
              <input
                className={styles.input}
                type="time"
                name="time"
                value={destination.time}
                onChange={handleChange}
              />
            </div>
          </div>
          <select
            className={styles.formInput}
            name="type"
            value={destination.type}
            onChange={handleChange}
          >
            <option value="attraction">Attraction</option>
            <option value="restaurant">Restaurant</option>
            <option value="accommodation">Accommodation</option>
            <option value="transport">Transport</option>
          </select>
          <div className={styles.budgetInput}>
            <FontAwesomeIcon icon={faYenSign} className={styles.icon} />
            <input
              className={`${styles.formInput} ${styles.input}`}
              type="number"
              name="budget"
              placeholder="Budget"
              value={destination.budget}
              onChange={handleChange}
            />
          </div>
          <textarea
            className={styles.textarea}
            name="description"
            placeholder="Description"
            value={destination.description}
            onChange={handleChange}
          />
          <button type="button" className={styles.button} onClick={handleSubmit}>
            Update Destination
          </button>
        </div>
      );
    }
    switch (step) {
      case 0:
        return (
          <div className={styles.step}>
            <h3>Let&apos;s start by finding your destination</h3>
            <div className={styles.searchBar}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                ref={autocompleteInputRef}
                className={styles.searchInput}
                type="text"
                placeholder="Search for a place..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="button" className={styles.manualButton} onClick={() => setStep(1)}>
              <FontAwesomeIcon icon={faPlus} /> Add manually
            </button>
          </div>
        );
      case 1:
        return (
          <div className={styles.step}>
            <h3>Tell us about your destination</h3>
            <input
              className={styles.formInput}
              type="text"
              name="name"
              placeholder="Destination name"
              value={destination.name}
              onChange={handleChange}
            />
            <input
              className={styles.formInput}
              type="text"
              name="location"
              placeholder="Location"
              value={destination.location}
              onChange={handleChange}
            />
            <button type="button" className={styles.button} onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className={styles.step}>
            <h3>When are you planning to visit?</h3>
            <div className={styles.dateTimeInputs}>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
                <input
                  className={styles.input}
                  type="date"
                  name="date"
                  value={destination.date}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faClock} className={styles.icon} />
                <input
                  className={styles.input}
                  type="time"
                  name="time"
                  value={destination.time}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button type="button" className={styles.button} onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        );
      case 3:
        return (
          <div className={styles.step}>
            <h3>Add some details</h3>
            <select
              className={styles.formInput}
              name="type"
              value={destination.type}
              onChange={handleChange}
            >
              <option value="attraction">Attraction</option>
              <option value="restaurant">Restaurant</option>
              <option value="accommodation">Accommodation</option>
              <option value="transport">Transport</option>
            </select>
            <div className={styles.budgetInput}>
              <FontAwesomeIcon icon={faYenSign} className={styles.icon} />
              <input
                className={`${styles.formInput} ${styles.input}`}
                type="number"
                name="budget"
                placeholder="Budget"
                value={destination.budget}
                onChange={handleChange}
              />
            </div>
            <textarea
              className={styles.textarea}
              name="description"
              placeholder="Description"
              value={destination.description}
              onChange={handleChange}
            />
            <button type="button" className={styles.button} onClick={() => setStep(4)}>
              Review
            </button>
          </div>
        );
      case 4:
        return (
          <div className={styles.step}>
            <h3>Review your destination</h3>
            <div className={styles.reviewDetails}>
              <p>
                <strong>Name:</strong> {destination.name}
              </p>
              <p>
                <strong>Location:</strong> {destination.location}
              </p>
              <p>
                <strong>Date:</strong> {destination.date}
              </p>
              <p>
                <strong>Time:</strong> {destination.time}
              </p>
              <p>
                <strong>Type:</strong> {destination.type}
              </p>
              <p>
                <strong>Budget:</strong> ¥{destination.budget}
              </p>
              <p>
                <strong>Description:</strong> {destination.description}
              </p>
            </div>
            <button type="button" className={styles.button} onClick={handleSubmit}>
              {initialData ? 'Update' : 'Add'} Destination
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <button type="button" className={styles.closeButton} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className={styles.modalTitle}>{initialData ? 'Edit' : 'Add'} Destination</h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DestinationModal;
