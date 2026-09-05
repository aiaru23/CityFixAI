import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import styles from './Hero.module.css'
import 'leaflet/dist/leaflet.css'

function LocationMarker() {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      console.log(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function Hero() {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} className={styles.map}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}