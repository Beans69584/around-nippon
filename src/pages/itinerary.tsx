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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadGoogleMapsAPI();
  }, []);

  const loadGoogleMapsAPI = async () => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    try {
      await loader.load();
      setGoogleMapsLoaded(true);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

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
            date: dest.date.split('T')[0],
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
    if (destinations.length === 0) return;

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
  }, [destinations, session]);

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
          id: Date.now(),
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
    .filter((dest) => !currentDate || dest.date === currentDate) // This line is updated
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

  const uniqueDates = Array.from(new Set(destinations.map((dest) => dest.date))).sort();

  const filterTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'attraction', label: 'Attraction' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'transport', label: 'Transport' },
  ];

  const sortByOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'name', label: 'Sort by Name' },
    { value: 'budget', label: 'Sort by Budget' },
  ];


  const dateOptions = [
    { value: "__all__", label: "All Dates" },
    ...uniqueDates.map(date => ({
      value: date,
      label: new Date(date).toLocaleDateString()
    }))
  ];

  return (
    <div className={styles.itineraryPage}>
      <Head>
        <title>My Itinerary - Around Nippon</title>
        <meta name="description" content="Plan your Japanese adventure" />
      </Head>

      <NavMenu />

      <main className={styles.itineraryContent}>
        <div className={styles.mainContent}>
          <div className={styles.controls}>
            <div className={styles.searchBar}>
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.filterSort}>
              <Selector
                options={filterTypeOptions}
                placeholder="Select Type"
                onValueChange={(value) => setFilterType(value as string)}
              />

              <Selector
                options={sortByOptions}
                placeholder="Select Sort"
                onValueChange={(value) => setSortBy(value as 'date' | 'name' | 'budget')}
              />
            </div>
            <div className={styles.viewControls}>
              <button
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                type="button"
              >
                <FontAwesomeIcon icon={faList} /> List
              </button>
              <button
                className={`${styles.viewButton} ${viewMode === 'map' ? styles.active : ''}`}
                onClick={() => setViewMode('map')}
                type="button"
              >
                <FontAwesomeIcon icon={faMap} /> Map
              </button>
            </div>
          </div>

          <div className={styles.dateNavigation}>
            <FontAwesomeIcon icon={faCalendarAlt} />

            <Selector
              options={dateOptions}
              placeholder="Select Date"
              value={currentDate}
              onValueChange={(value) => handleDateChange(value)}
            />
          </div>

          <div className={styles.contentArea}>
            {viewMode === 'list' && (
              <div className={styles.itineraryArea}>
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
                                    onEdit={() => {
                                      setEditingDestination(dest);
                                      setIsModalOpen(true);
                                    }}
                                    onDelete={() => handleDeleteDestination(dest.id)}
                                    onTravelModeChange={(id: number, mode: 'DRIVING' | 'WALKING' | 'NONE') =>
                                      handleTravelModeChange(id, mode)
                                    }
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {filteredDestinations.length === 0 && (
                          <div className={styles.emptyState}>
                            <FontAwesomeIcon icon={faRoute} className={styles.icon} />
                            <p className={styles.mainMessage}>No destinations found</p>
                            <p className={styles.subMessage}>
                              Try adjusting your search or filter settings
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
            {viewMode === 'map' && googleMapsLoaded && (
              <div className={styles.mapContainer}>
                <ItineraryMap
                  key={destinations.map((d) => `${d.id}-${d.travelMode}`).join(',')}
                  destinations={filteredDestinations}
                />
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.btnPrimary}
              type="button"
            >
              <FontAwesomeIcon icon={faPlus} /> Add Destination
            </button>
            <button
              onClick={() => exportPDF(destinations, exchangeRate)}
              className={styles.btnSecondary}
              type="button"
            >
              <FontAwesomeIcon icon={faFileExport} /> Export PDF
            </button>
          </div>
        </div>
      </main>

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
