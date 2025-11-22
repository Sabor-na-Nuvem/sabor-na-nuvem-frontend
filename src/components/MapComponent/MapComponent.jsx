import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styles from './MapComponent.module.css';
import 'leaflet/dist/leaflet.css';

// Configuração do Ícone Vermelho
const redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  const isMounted = useRef(false);

  useEffect(() => {
    map.invalidateSize();

    if (isMounted.current) {
      map.flyTo([center.lat, center.lng], zoom, { animate: true, duration: 1.5 });
    } else {
      isMounted.current = true;
    }
  }, [center, zoom, map]);

  return null;
};

// Validação do MapController
MapController.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
  zoom: PropTypes.number.isRequired,
};

const DraggableMarker = ({ position, content, onDragEnd, interactive, onClick }) => {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null && onDragEnd) {
          const newPos = marker.getLatLng();
          onDragEnd({ lat: newPos.lat, lng: newPos.lng });
        }
      },
      click() {
        if (onClick) onClick();
      },
    }),
    [onDragEnd, onClick]
  );

  return (
    <Marker
      draggable={interactive}
      eventHandlers={eventHandlers}
      position={position}
      icon={redIcon}
      ref={markerRef}
    >
      <Popup className={styles.customPopup}>{content}</Popup>
    </Marker>
  );
};

// Validação do DraggableMarker
DraggableMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  content: PropTypes.node.isRequired,
  onDragEnd: PropTypes.func,
  interactive: PropTypes.bool,
  onClick: PropTypes.func,
};

const MapComponent = ({
  height = '300px',
  markers = [],
  center = { lat: -15.7934, lng: -47.8823 },
  zoom = 13,
  onMarkerClick,
  onMarkerDragEnd,
  interactive = false,
}) => {
  const validCenter = {
    lat: Number(center.lat) || -15.7934,
    lng: Number(center.lng) || -47.8823,
  };

  return (
    <div className={styles.mapContainer} style={{ height }}>
      <MapContainer
        center={[validCenter.lat, validCenter.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className={styles.leafletMap}
        zoomAnimation={false}
        fadeAnimation={true}
        markerZoomAnimation={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={validCenter} zoom={zoom} />

        {markers.map((marker, index) => (
          <DraggableMarker
            key={marker.id || index}
            position={[marker.lat, marker.lng]}
            interactive={interactive}
            onDragEnd={(newCoords) => onMarkerDragEnd && onMarkerDragEnd(marker.id, newCoords)}
            onClick={() => onMarkerClick && onMarkerClick(marker)} // Agora o clique é repassado corretamente
            content={
              <>
                <strong>{marker.nome || 'Local Selecionado'}</strong>
                <br />
                {marker.endereco}
                {interactive && (
                  <div style={{ marginTop: 5, fontSize: '0.8em', color: '#666' }}>
                    (Arraste para ajustar)
                  </div>
                )}
              </>
            }
          />
        ))}
      </MapContainer>
    </div>
  );
};

MapComponent.propTypes = {
  height: PropTypes.string,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      nome: PropTypes.string,
      endereco: PropTypes.string,
    })
  ),
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  zoom: PropTypes.number,
  onMarkerClick: PropTypes.func,
  onMarkerDragEnd: PropTypes.func,
  interactive: PropTypes.bool,
};

export default MapComponent;
