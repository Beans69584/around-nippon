import {
  faCalendarAlt,
  faFileExport,
  faList,
  faMap,
  faPlus,
  faRoute,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Loader } from '@googlemaps/js-api-loader';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
// itinerary.tsx
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import DestinationModal from '@components/DestinationModal';
import ItineraryItem from '@components/ItineraryItem';
import NavMenu from '@components/NavMenu';
import Spinner from '@components/Spinner';
import withAuth from '@components/withAuth';
import styles from '@styles/Itinerary.module.scss';
import spinnerStyles from '@styles/withAuth.module.scss';
import type { Destination } from '@type/itinerary';
import exportPDF from '@utils/exportPDF';
import Selector from '@components/Select';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineItem from '@components/TimelineItem';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

const ItineraryMap = dynamic(() => import('@components/ItineraryMap'), {
  ssr: false,
  loading: () => (
    <div className={spinnerStyles.spinnerContainer}>
      <Spinner />
    </div>
  ),
});

const ItineraryPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const exchangeRate = 0.0058;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'budget'>('date');
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [view, setView] = useState<'list' | 'timeline' | 'map'>('timeline');
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const t = useTranslations('itinerary.itineraryPage');
  const router = useRouter();
  const locale = router.locale;
  
  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places', 'geometry'],
        language: locale,
        region: 'JP',
      });
  
      try {
        await loader.load();
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };
    loadGoogleMapsAPI();
  }, [locale]);

  const loadItinerary = useCallback(async () => {
    if (!(session?.user as { id?: string })?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/itinerary');
      if (response.ok) {
        const data = await response.json();
        const sortedDestinations = data
          .map((dest: Destination) => ({
            ...dest,
            id: dest.id.toString(),
            date: new Date(dest.date).toISOString().split('T')[0],
          }))
          .sort(
            (a: Destination, b: Destination) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        setDestinations(sortedDestinations);
        setHasChanges(false); // Reset changes flag after loading
      } else {
        console.error('Failed to load itinerary:', await response.text());
      }
    } catch (error) {
      console.error('Failed to load itinerary:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadItinerary();
    }
  }, [status, loadItinerary]);

  const saveItinerary = useCallback(async () => {
    if (!(session?.user as { id?: string })?.id) return;
    if (destinations.length === 0 && !hasChanges) return;

    try {
      const response = await fetch('/api/v1/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: (session?.user as { id?: string }).id,
          destinations: destinations.map((dest) => ({
            ...dest,
          })),
        }),
      });

      if (response.ok) {
        setHasChanges(false); // Reset changes flag after successful save
      } else {
        console.error('Failed to save itinerary:', await response.text());
      }
    } catch (error) {
      console.error('Failed to save itinerary:', error);
    }
  }, [destinations, session, hasChanges]);

  useEffect(() => {
    if (status === 'authenticated' && !isLoading && hasChanges) {
      saveItinerary();
    }
  }, [status, isLoading, hasChanges, saveItinerary]);

  const handleAddDestination = (newDestination: Destination) => {
    setDestinations((prev) => {
      const updatedDestinations = [
        ...prev,
        {
          ...newDestination,
          travelMode: 'DRIVING' as const,
          id: Date.now(), // Will be a number
        },
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return updatedDestinations;
    });
    setIsModalOpen(false);
    setHasChanges(true);
  };

  const handleEditDestination = (editedDestination: Destination) => {
    setDestinations((prev) =>
      prev
        .map((d) =>
          d.id === editedDestination.id ? { ...editedDestination, travelMode: d.travelMode } : d
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
    setIsModalOpen(false);
    setEditingDestination(null);
    setHasChanges(true);
  };

  const handleDeleteDestination = (id: number) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
    setHasChanges(true);
  };

  const handleTravelModeChange = (id: number, mode: 'DRIVING' | 'WALKING' | 'NONE') => {
    setDestinations((prev) =>
      prev.map((dest) => {
        if (dest.id === id) {
          return { ...dest, travelMode: mode };
        }
        return dest;
      })
    );
    setHasChanges(true);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(destinations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDestinations(items);
    setHasChanges(true);
  };

  const filteredDestinations = destinations
    .filter((dest) => {
      const nameMatch = dest.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = dest.location?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || locationMatch;
    })
    .filter((dest) => filterType === 'all' || dest.type === filterType)
    .filter((dest) => selectedDates.size === 0 || selectedDates.has(dest.date))
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return Number(a.budget) - Number(b.budget);
    });

  const calculateSequenceNumbers = useCallback((destinations: Destination[]) => {
    let sequenceNumber = 1;
    return destinations.map((dest, index) => {
      if (index === 0 || dest.travelMode === 'NONE') {
        sequenceNumber = 1;
      }
      const currentSequence = sequenceNumber;
      sequenceNumber++;
      return currentSequence;
    });
  }, []);

  const handleDateChange = (date: string | null) => {
    setCurrentDate(date);
  };

  const handleDateSelection = (date: string) => {
    setSelectedDates(prev => {
      const newDates = new Set(prev);
      if (newDates.has(date)) {
        newDates.delete(date);
      } else {
        newDates.add(date);
      }
      return newDates;
    });
  };

  const uniqueDates = Array.from(new Set(destinations.map((dest) => dest.date)));

  // Fix function name consistency
  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setIsModalOpen(true);
  };

  // Fix function name consistency
  const handleDelete = (id: number) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
    setHasChanges(true);
  };

  return (
    <div className={styles.itineraryPage}>
      <Head>
        <title>My Itinerary - Around Nippon</title>
        <meta name="description" content="Plan your Japanese adventure" />
      </Head>

      <NavMenu />

      <main className={styles.itineraryLayout}>
        {/* Date Navigation Sidebar */}
        <aside className={styles.dateSidebar}>
          <div className={styles.dateNav}>
            <h2>{t('dateNav')}</h2>
            <div className={styles.dateList}>
              {uniqueDates.map((date) => (
                <button
                  key={date}
                  className={`${styles.dateButton} ${selectedDates.has(date) ? styles.active : ''}`}
                  onClick={() => handleDateSelection(date)}
                >
                  <span className={styles.dayNumber}>
                    {new Date(date).toLocaleDateString(locale, { day: 'numeric' })}
                  </span>
                  <span className={styles.monthYear}>
                    {new Date(date).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <div className={styles.viewControls}>
              <button
                className={`${styles.viewButton} ${view === 'timeline' ? styles.active : ''}`}
                onClick={() => setView('timeline')}
              >
                {t('timelineView')}
              </button>
              <button
                className={`${styles.viewButton} ${view === 'list' ? styles.active : ''}`}
                onClick={() => setView('list')}
              >
                {t('listView')}
              </button>
            </div>

            <div className={styles.searchTools}>
              <div className={styles.searchBar}>
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Filters and sorting moved to dropdown menu */}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.contentArea}
            >
              {view === 'timeline' && (
                <div className={styles.timeline}>
                  {/* New Timeline View Implementation */}
                  {filteredDestinations.map((dest, index) => (
                    <TimelineItem
                      key={dest.id}
                      destination={dest}
                      index={index}
                      onEdit={() => handleEdit(dest)}
                      onDelete={() => handleDelete(dest.id)}
                    />
                  ))}
                </div>
              )}

              {view === 'list' && (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="destinations">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={styles.itineraryList}
                      >
                        {filteredDestinations.map((dest, index) => {
                          const sequenceNumbers = calculateSequenceNumbers(filteredDestinations);
                          return (
                            <Draggable
                              key={dest.id.toString()}
                              draggableId={dest.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <ItineraryItem
                                    destination={dest}
                                    index={index}
                                    sequenceNumber={sequenceNumbers[index]}
                                    onEdit={() => handleEdit(dest)}
                                    onDelete={() => handleDelete(dest.id)}
                                    onTravelModeChange={handleTravelModeChange}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Map Sidebar */}
        <aside className={styles.mapSidebar}>
          {googleMapsLoaded && (
            <div className={styles.mapContainer}>
              <ItineraryMap
                key={destinations.map((d) => `${d.id}-${d.travelMode}`).join(',')}
                destinations={filteredDestinations}
              />
            </div>
          )}
        </aside>
      </main>

      {/* Float Action Button */}
      <button onClick={() => setIsModalOpen(true)} className={styles.fab}>
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {/* Modal remains unchanged */}
      {isModalOpen && googleMapsLoaded && (
        <DestinationModal
          onClose={() => {
            setIsModalOpen(false);
            setEditingDestination(null);
          }}
          onSubmit={editingDestination ? handleEditDestination : handleAddDestination}
          initialData={editingDestination}
        />
      )}
    </div>
  );
};

export default withAuth(ItineraryPage);
