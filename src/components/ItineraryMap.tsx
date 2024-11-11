import { faExpandAlt, faCompressAlt, faRoute, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '@styles/ItineraryMap.module.scss';
import type { Destination } from '@type/itinerary';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

interface ItineraryMapProps {
  destinations: Destination[];
}

const ItineraryMap: React.FC<ItineraryMapProps> = React.memo(({ destinations }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(
    null
  );
  const [directionsRenderers, setDirectionsRenderers] = useState<google.maps.DirectionsRenderer[]>(
    []
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('itinerary.map');
  const router = useRouter();
  const locale = router.locale;

  useEffect(() => {
    initMap();
  }, []);

  useEffect(() => {
    if (map && directionsService) {
      updateMapMarkers();
      calculateAndDisplayRoutes();
    }
  }, [destinations, map, directionsService]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !google) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 35.6762, lng: 139.6503 },
      zoom: 7,
      disableDefaultUI: true,
      zoomControl: false, 
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ color: '#f7f3e3' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry.fill',
          stylers: [{ color: '#c5e8f3' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#c73e3a' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#5b7553' }],
        },
      ],
    });

    setMap(mapInstance);
    setDirectionsService(new google.maps.DirectionsService());
  }, []);

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

  const updateMapMarkers = useCallback(() => {
    if (!map) return;

    markers.forEach((marker) => marker.setMap(null));

    const sequenceNumbers = calculateSequenceNumbers(destinations);
    const newMarkers: google.maps.Marker[] = [];

    destinations.forEach((destination, index) => {
      const marker = new google.maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map: map,
        title: destination.name,
        label: {
          text: sequenceNumbers[index].toString(),
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#c73e3a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(destination),
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach((marker) => bounds.extend(marker.getPosition()!));
      map.fitBounds(bounds);
    }
  }, [map, destinations, calculateSequenceNumbers]);

  const calculateAndDisplayRoutes = useCallback(() => {
    if (!directionsService || !map || destinations.length < 2) {
      return;
    }

    directionsRenderers.forEach((renderer) => renderer.setMap(null));
    setDirectionsRenderers([]);

    const newRenderers: google.maps.DirectionsRenderer[] = [];

    for (let i = 0; i < destinations.length - 1; i++) {
      const origin = destinations[i];
      const destination = destinations[i + 1];

      if (destination.travelMode === 'NONE') {
        continue;
      }

      const renderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: destination.travelMode === 'WALKING' ? '#5b7553' : '#c73e3a',
          strokeWeight: 4,
          strokeOpacity: 0.7,
        },
      });

      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode:
            destination.travelMode === 'WALKING'
              ? google.maps.TravelMode.WALKING
              : google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            renderer.setDirections(result);
            newRenderers.push(renderer);

            // Add ETA markers
            addETAMarkers(result, map);
          } else {
            console.error(`Directions request failed for segment ${i} due to ${status}`);
          }
        }
      );
    }

    setDirectionsRenderers(newRenderers);
  }, [destinations, map, directionsService]);

  const formatDurationFromSeconds = (
    seconds: number,
    locale: string = 'en'
  ): string => {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    const units: { unit: Intl.RelativeTimeFormatUnit, value: number }[] = [
      { unit: 'day', value: days },
      { unit: 'hour', value: hours },
      ...(days > 0 ? [] : [{ unit: 'minute' as Intl.RelativeTimeFormatUnit, value: minutes }]),
    ];

    const parts = units
      .filter(part => part.value > 0)
      .map(part => {
        const formatter = new Intl.NumberFormat(locale, {
          style: 'unit',
          unit: part.unit,
          unitDisplay: 'long',
        });
        return formatter.format(part.value);
      });

    if (parts.length === 0) {
      const smallestUnit = units[units.length - 1].unit;
      const formatter = new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: smallestUnit,
        unitDisplay: 'short',
      });
      return formatter.format(0);
    }

    const listFormatter = new Intl.ListFormat(locale, {
      style: 'long',
      type: 'unit',
    });

    return listFormatter.format(parts);
  };
  const addETAMarkers = (result: google.maps.DirectionsResult, map: google.maps.Map) => {
    const route = result.routes[0];
    if (!route || !route.legs) return;

    route.legs.forEach((leg) => {
      if (!leg.steps) return;

      const path = leg.steps.reduce((points: google.maps.LatLng[], step) => {
        if (step.path) {
          points.push(...step.path);
        }
        return points;
      }, []);

      if (path.length > 0) {
        // Get the middle point of the path
        const midIndex = Math.floor(path.length / 2);
        const midPoint = path[midIndex];

        const durationSeconds = leg.duration?.value || 0;
        const duration = formatDurationFromSeconds(durationSeconds, locale);

        new google.maps.Marker({
          position: midPoint,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0,
            fillOpacity: 0,
            strokeWeight: 0,
          },
          label: {
            text: duration,
            color: '#ffffff',
            fontSize: '12px',
            className: styles.etaLabel,
          },
          zIndex: 1000, // Ensure labels appear above the route line
        });
      }
    });
  };

  const createInfoWindowContent = (destination: Destination) => {
    return `
      <div class="${styles.mapInfoWindow}">
        <h3>${destination.name}</h3>
        <p>${destination.location}</p>
        <p>Date: ${destination.date}</p>
        <p>Time: ${destination.time}</p>
        <p>Type: ${destination.type}</p>
        <p>Budget: ¥${Number(destination.budget).toLocaleString(locale)}</p>
        <p>${destination.description}</p>
      </div>
    `;
  };

  const handleShowFullRoute = useCallback(() => {
    if (!map || markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    markers.forEach((marker) => bounds.extend(marker.getPosition()!));

    // Add padding by extending the bounds
    const extendPoint = (length: number) => {
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      const latDiff = northEast.lat() - southWest.lat();
      const lngDiff = northEast.lng() - southWest.lng();

      bounds.extend(new google.maps.LatLng(
        northEast.lat() + latDiff * length,
        northEast.lng() + lngDiff * length
      ));
      bounds.extend(new google.maps.LatLng(
        southWest.lat() - latDiff * length,
        southWest.lng() - lngDiff * length
      ));
    };

    // Add 10% padding
    extendPoint(0.1);

    map.fitBounds(bounds);
  }, [map, markers]);

  const handleZoomIn = useCallback(() => {
    if (!map) return;
    map.setZoom((map.getZoom() || 0) + 1);
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (!map) return;
    map.setZoom((map.getZoom() || 0) - 1);
  }, [map]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map}></div>
      <div className={styles.mapControls}>
        <button className={`${styles.mapButton} ${styles.routeButton}`} onClick={handleShowFullRoute}>
          <FontAwesomeIcon icon={faRoute} /> {t('showFullRouteButton.text')}
        </button>
      </div>
      <div className={styles.zoomControls}>
        <button className={`${styles.mapButton} ${styles.zoomButton}`} onClick={handleZoomIn}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <button className={`${styles.mapButton} ${styles.zoomButton}`} onClick={handleZoomOut}>
          <FontAwesomeIcon icon={faMinus} />
        </button>
      </div>
    </div>
  );
});

ItineraryMap.displayName = 'ItineraryMap';

export default ItineraryMap;
