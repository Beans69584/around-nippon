// src/components/JapanMap.tsx

import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import styles from '@styles/JapanMap.module.scss';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import prefectureMapping from '@/data/japan_prefecture_mapping.json';

interface JapanMapProps {
  setActiveRegion: (region: string | null) => void;
}

const GeoJSON = "/geo/japan.geojson";

const TokyoCoordinates: [number, number] = [139.6917, 35.6895];

const JapanMap: React.FC<JapanMapProps> = ({ setActiveRegion }) => {
  return (
    <div className={styles.mapContainer}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: TokyoCoordinates,
          rotate: [0, 0, 0],
        }}
        width={800}
        height={600}
        style={{
          width: "100%",
          height: "auto",
        }}
      >
        <ZoomableGroup
          zoom={1}
          minZoom={1}
          maxZoom={1}
          center={TokyoCoordinates}
        >
          <Geographies geography={GeoJSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoId: keyof typeof prefectureMapping = geo.properties.id; // Assuming 'id' is present
                const regionName = prefectureMapping[geoId as keyof typeof prefectureMapping] || "Unknown";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setActiveRegion(regionName)}
                    onMouseLeave={() => setActiveRegion(null)}
                    data-tooltip-id="region-tooltip"
                    data-tooltip-content={regionName}
                    className={styles.interactiveRegion}
                    style={{
                      default: {
                        fill: '#D6D6DA',
                        outline: 'none',
                      },
                      hover: {
                        fill: '#F53',
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: '#E42',
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {/* Tooltip for regions */}
      <Tooltip 
        id="region-tooltip" 
        place="top"
      />
    </div>
  );
};

export default JapanMap;