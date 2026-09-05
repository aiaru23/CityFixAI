// Map.jsx (обновленный)
import React, { useState, useEffect } from 'react'
import styles from './Map.module.css'
import { FaTools } from "react-icons/fa";
import { BsTools } from "react-icons/bs";
import { LuMonitorCheck, LuUser } from "react-icons/lu";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import LocateUser from '../components/LocateUser';
import Header from '../components/Header';
import { useIssues } from '../hooks/useIssues';
import ProblemModal from '../components/ProblemModal';

export const redIcon = new L.Icon({
  iconUrl: './redIcon.svg',
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const yellowIcon = new L.Icon({
  iconUrl: './yellowIcon.svg',
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const greenIcon = new L.Icon({
  iconUrl: './greenIcon.svg',
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const statusIcon = (status) => {
  if (status === 'resolved') return greenIcon;
  if (status === 'rejected' || status === 'in_progress') return yellowIcon;
  return redIcon;
}

const Map = () => {
  const { issues, loading } = useIssues()
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showLegend, setShowLegend] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setShowLegend(false)
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleLegend = () => {
    setShowLegend(!showLegend)
  }

  return (
    <>
      <section className={styles.home}>
        <Header />

        <div className={styles.homeBody}>
          <div className={styles.mapContainer}>
            <MapContainer
              center={[48.0, 68.0]}
              zoom={5}
              className={styles.map}
            >
              <TileLayer
                attribution='© OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LocateUser />

              {!loading && issues.map(problem => {
                if (problem.status === "pending") {
                  return null
                }
                return (
                  <Marker
                    key={problem.id}
                    position={problem.coordinates}
                    icon={statusIcon(problem.status)}
                    eventHandlers={{
                      click: () => setSelectedMarker(problem),
                    }}
                  >
                    <Popup>
                      <div className={styles.popupContent}>
                        <strong>{problem.problem}</strong>
                        <p>{problem.location}</p>
                        <small>Опасность: {problem.danger}/10</small>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>

            {isMobile && (
              <button className={styles.legendToggle} onClick={toggleLegend}>
                <span>📊</span> Легенда
              </button>
            )}
          </div>

          <div className={`${styles.markerStatus} ${isMobile ? styles.mobileLegend : ''} ${isMobile && showLegend ? styles.legendOpen : ''} ${isMobile && !showLegend ? styles.legendClosed : ''}`}>
            <div className={styles.legendHeader}>
              <h3>Маркера</h3>
              {isMobile && (
                <button className={styles.closeLegend} onClick={toggleLegend}>
                  ✕
                </button>
              )}
            </div>
            <div className={styles.status}>
              <div className={styles.you}>
                <div><LuUser /></div>
                <p>Вы</p>
              </div>
              <div className={styles.verified}>
                <div><BsTools /></div>
                <p>Ожидает / ИИ одобрил</p>
              </div>
              <div className={styles.funded}>
                <div><FaTools /></div>
                <p>В процессе / Отклонено</p>
              </div>
              <div className={styles.resolved}>
                <div><LuMonitorCheck /></div>
                <p>Решено</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {selectedMarker && (
        <ProblemModal problemModal={selectedMarker} setProblemModal={setSelectedMarker} />
      )}
    </>
  )
}

export default Map