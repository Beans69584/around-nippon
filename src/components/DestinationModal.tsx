import {
  faCalendar,
  faClock,
  faImage,
  faLocationDot,
  faMoneyBill,
  faRoute,
  faTimes,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import styles from '@styles/DestinationModal.module.scss';
import type { Destination } from '@type/itinerary';
import Image from 'next/image';
import { processImageUpload } from '@utils/imageUpload';
import PhotoManager from '@components/PhotoManager';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

interface DestinationModalProps {
  onClose: () => void;
  onSubmit: (destination: Destination) => void;
  initialData?: Destination | null;
}

const DestinationModal: React.FC<DestinationModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [step, setStep] = useState(1);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('itinerary.destinationModal');


  const destinationSchema = Yup.object().shape({
    name: Yup.string().required(t('nameRequired')),
    location: Yup.string().required(t('locationRequired')),
    date: Yup.date().required(t('dateRequired')),
    time: Yup.string().required(t('timeRequired')),
    type: Yup.string().oneOf(
      ['attraction', 'restaurant', 'accommodation', 'transport'],
      t('typeRequired')
    ),
    budget: Yup.number().min(0, t('budgetPositive')).required(t('budgetRequired')),
    description: Yup.string(),
    lat: Yup.number().required(t('locationCoordinatesRequired')),
    lng: Yup.number().required(t('locationCoordinatesRequired')),
  });

  const [destination, setDestination] = useState<Partial<Destination>>({
    name: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'attraction',
    budget: 0,
    description: '',
    notes: '',
    lat: 0,
    lng: 0,
    travelMode: 'DRIVING',
    photos: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDestination(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (mapRef.current && !mapInstance) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 35.6762, lng: 139.6503 }, // Tokyo coordinates
        zoom: 12,
        styles: [], // Add your custom map styles here
      });
      setMapInstance(map);

      // Create Autocomplete instead of SearchBox
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current as HTMLInputElement,
        {
          componentRestrictions: { country: 'jp' },
          fields: ['address_components', 'geometry', 'name', 'formatted_address', 'place_id', 'rating', 'website', 'formatted_phone_number'],
          types: ['establishment', 'geocode'],
        }
      );

      // Set the bounds to Japan
      const japanBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(20.5279, 122.9347), // SW corner of Japan
        new google.maps.LatLng(45.5227, 153.9865)  // NE corner of Japan
      );
      autocomplete.setBounds(japanBounds);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          handlePlaceSelect(place);
        }
      });

      map.addListener('bounds_changed', () => {
        autocomplete.setBounds(map.getBounds() as google.maps.LatLngBounds);
      });
    }
  }, [mapRef.current]);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;

    const location = place.geometry.location;
    mapInstance?.setCenter(location);
    mapInstance?.setZoom(15);

    if (marker) {
      marker.setMap(null);
    }

    const newMarker = new google.maps.Marker({
      map: mapInstance,
      position: location,
      animation: google.maps.Animation.DROP,
    });

    setMarker(newMarker);
    setDestination(prev => ({
      ...prev,
      name: place.name || '',
      location: place.formatted_address || '',
      lat: location.lat(),
      lng: location.lng(),
      placeId: place.place_id,
      rating: place.rating || null,
      websiteUrl: place.website || '',
      phoneNumber: place.formatted_phone_number || '',
    }));

    // Auto-proceed to next step
    setStep(2);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          return await processImageUpload(file);
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setDestination(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...uploadedUrls],
      }));
    } catch (error) {
      console.error('Error uploading photos:', error);
      // You might want to add some error handling UI here
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setDestination(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index),
    }));
  };

  const validateStep = async () => {
    try {
      await destinationSchema.validate(destination, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors: { [key: string]: string } = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
      }
      setErrors(validationErrors);
      return false;
    }
  };
  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateStep();
    if (isValid) {
      onSubmit(destination as Destination);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h3>{t('locationDetails')}</h3>
            <div className={styles.searchSection}>
              <div className={styles.searchBox}>
                <FontAwesomeIcon icon={faLocationDot} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.mapContainer} ref={mapRef} />
            </div>
            {errors.location && <span className={styles.error}>{errors.location}</span>}
            {destination.location && (
              <button className={styles.nextButton} onClick={handleNext}>
                {t('continueButton', { name: destination.name || '' })}
              </button>
            )}
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h3>{t('basicDetails')}</h3>
            <div className={styles.formGroup}>
              <label>{t('typeOfPlaceLabel')}</label>
              <div className={styles.typeSelector}>
                {['attraction', 'restaurant', 'accommodation', 'transport'].map((type) => (
                  <button
                    key={type}
                    className={`${styles.typeButton} ${destination.type === type ? styles.active : ''}`}
                    onClick={() => setDestination(prev => ({ ...prev, type }))}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>{t('dateAndTimeLabel')}</label>
              <div className={styles.dateTimeContainer}>
                <div className={styles.inputWithIcon}>
                  <FontAwesomeIcon icon={faCalendar} />
                  <input
                    type="date"
                    value={destination.date}
                    onChange={(e) => setDestination(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className={styles.inputWithIcon}>
                  <FontAwesomeIcon icon={faClock} />
                  <input
                    type="time"
                    value={destination.time}
                    onChange={(e) => setDestination(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <button className={styles.nextButton} onClick={handleNext}>
              {t('continueButtonNoName')}
            </button>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <h3>{t('additionalDetails')}</h3>
            <div className={styles.formGroup}>
              <label>{t('budgetLabel')}</label>
              <div className={styles.inputWithIcon}>
                <FontAwesomeIcon icon={faMoneyBill} />
                <input
                  type="number"
                  value={destination.budget}
                  onChange={(e) => setDestination(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  placeholder={t('budgetPlaceholder')}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>{t('descriptionLabel')}</label>
              <textarea
                value={destination.description}
                onChange={(e) => setDestination(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('descriptionPlaceholder')}
              />
            </div>


            <div className={styles.formGroup}>
              <label>{t('photosLabel')}</label>
              <PhotoManager
                placeId={destination.placeId}
                photos={destination.photos || []}
                onPhotosChange={(photos: string[]) => setDestination(prev => ({ ...prev, photos }))}
              />
            </div>
            <button className={styles.nextButton} onClick={handleNext}>
              {t('continueButtonNoName')}
            </button>
          </div >
        );

      case 4:
        return (
          <div className={styles.stepContent}>
            <h3>{t('travelDetails')}</h3>
            <div className={styles.formGroup}>
              <label>{t('travelModeLabel')}</label>
              <div className={styles.travelModeSelector}>
                {['DRIVING', 'WALKING', 'TRANSIT', 'NONE'].map((mode) => (
                  <button
                    key={mode}
                    className={`${styles.modeButton} ${destination.travelMode === mode ? styles.active : ''}`}
                    onClick={() => setDestination(prev => ({ ...prev, travelMode: mode }))}
                  >
                    <FontAwesomeIcon icon={faRoute} />
                    {mode.charAt(0) + mode.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>{t('notesLabel')}</label>
              <textarea
                value={destination.notes}
                onChange={(e) => setDestination(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('notesPlaceholder')}
              />
            </div>
            <button className={styles.submitButton} onClick={handleSubmit}>
              {t('submitButton')}
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
        <button className={styles.closeButton} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className={styles.progressBar}>
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`${styles.progressStep} ${step >= stepNumber ? styles.active : ''}`}
              onClick={() => stepNumber < step && setStep(stepNumber)}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DestinationModal;