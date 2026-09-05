import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function LocateUser() {
  const map = useMap();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude || 43.238949;
        const lng = position.coords.longitude || 76.889709;

        const latlng = [lat, lng];

        map.setView(latlng, 16);

        L.marker(latlng)
          .addTo(map)
          .bindPopup("Ты здесь")
          .openPopup();
      },
      (error) => {
        console.log("Ошибка геолокации:", error);
      }
    );
  }, [map]);

  return null;
}

export default LocateUser;