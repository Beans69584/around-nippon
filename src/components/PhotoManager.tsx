// components/PhotoManager.tsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCloudUpload,
    faTrash,
    faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import Image from 'next/image';
import { useState, useRef } from 'react';
import styles from '@styles/PhotoManager.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoManagerProps {
    placeId?: string;
    photos: string[];
    onPhotosChange: (photos: string[]) => void;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({ placeId, photos, onPhotosChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | File[]) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('file', file);
            });

            const response = await fetch('/api/v1/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            const data = await response.json();
            if (data.urls && data.urls.length > 0) {
                onPhotosChange([...photos, ...data.urls]);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            // You might want to add some error UI feedback here
        } finally {
            setIsLoading(false);
        }
    };

    const loadGooglePhotos = async () => {
        if (!placeId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/places/photos?placeId=${placeId}`);
            const data = await response.json();
            if (data.photos?.length) {
                onPhotosChange([...photos, ...data.photos]);
            }
        } catch (error) {
            console.error('Error fetching Google photos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.photoManager}>
            <motion.div className={styles.uploadSection}>
                <div
                    className={styles.dropZone}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files?.length) handleFiles(files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        style={{ display: 'none' }}
                    />
                    <FontAwesomeIcon icon={faCloudUpload} size="2x" />
                    <p>Drop images here or click to upload</p>
                    {placeId && (
                        <button
                            className={styles.googleButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                loadGooglePhotos();
                            }}
                            disabled={isLoading}
                        >
                            <FontAwesomeIcon icon={faGoogle} />
                            Import from Google Maps
                        </button>
                    )}
                </div>
            </motion.div>

            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Loading...
                </div>
            )}

            {photos.length > 0 && (
                <motion.div
                    className={styles.photoGrid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {photos.map((photo, index) => (
                        <motion.div
                            key={`${photo}-${index}`}
                            className={styles.photoItem}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Image
                                src={photo}
                                alt=""
                                layout="fill"
                                objectFit="cover"
                            />
                            <button
                                className={styles.removeButton}
                                onClick={() => onPhotosChange(photos.filter((_, i) => i !== index))}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default PhotoManager;