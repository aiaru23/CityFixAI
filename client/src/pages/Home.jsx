// Home.jsx (обновленный)
import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import ProblemModal from '../components/ProblemModal.jsx'
import styles from './Home.module.css'
import { useIssues } from '../hooks/useIssues'
import { useProgram } from '../solana.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { BsTools } from "react-icons/bs";
import { FaTools } from "react-icons/fa";
import { LuMonitorCheck } from "react-icons/lu";
import { PublicKey, SystemProgram } from '@solana/web3.js'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';

const DangerBarModal = ({ danger }) => {
  const color = 'linear-gradient(88deg,rgba(99, 55, 239, 1) 0%, rgba(37, 47, 64, 1) 64%)'
  return (
    <div className={styles.dangerBarModal}>
      <div
        className={styles.dangerFillModal}
        style={{ width: `${danger * 10}%`, background: color }}
      />
    </div>
  )
}

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

const statusConfig = {
  resolved: { label: "Решено", mod: styles.statusResolved },
  pending: { label: "Ожидает ИИ", mod: styles.statusPending },
  in_progress: { label: "В процессе", mod: styles.statusInProgress },
  aiverified: { label: "ИИ одобрил", mod: styles.statusAiVerified },
  rejected: { label: "Отклонено", mod: styles.statusRejected },
}

const MiniMap = ({ coordinates }) => {
  const [lat, lng] = coordinates
  const mapUrl = `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=14&size=100,80&l=map&pt=${lng},${lat},pm2rdm`
  return (
    <img
      src={mapUrl}
      alt="map"
      className={styles.miniMap}
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

const DangerBar = ({ danger }) => {
  const color = danger >= 8 ? '#ef4444' : danger >= 5 ? '#f97316' : '#22c55e'
  return (
    <div className={styles.dangerBar}>
      <div
        className={styles.dangerFill}
        style={{ width: `${danger * 10}%`, background: color }}
      />
    </div>
  )
}

const ProblemCard = ({ problem, onFund, onClick }) => {
  const status = statusConfig[problem.status] ?? statusConfig.pending
  const [funding, setFunding] = useState(false)

  const handleFund = async (e) => {
    e.stopPropagation()
    setFunding(true)
    try {
      await onFund(problem)
    } finally {
      setFunding(false)
    }
  }

  const btnLabel = () => {
    if (funding) return '⏳ Отправка...'
    if (problem.status === 'aiverified') return `Профинансировать ${problem.cost} USDC`
    if (problem.status === 'pending') return 'Ожидает оценки ИИ...'
    if (problem.status === 'resolved') return '✅ Решено'
    if (problem.status === 'rejected') return '❌ Отклонено'
    if (problem.status === 'in_progress') return '🔧 В процессе ремонта'
    return `Профинансировать ${problem.cost} USDC`
  }

  if (problem.status === 'pending') {
    return null
  }

  return (
    <div className={styles.card} onClick={onClick}>
      {problem.img
        ? <img src={problem.img} alt={problem.problem} className={styles.cardImg} />
        : <div className={styles.cardImgPlaceholder}>📷</div>
      }

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{problem.problem}</h3>

        <div className={styles.cardInfo}>
          <div className={styles.infoLeft}>
            <div className={styles.infoRow}>
              <svg className={styles.locationIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className={styles.infoText}>{problem.location}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={`${styles.statusDot} ${status.mod}`} />
              <span className={styles.infoText}>{status.label}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.aiLabel}>AI<sup>✦</sup></span>
              <span className={styles.infoText}>
                Опасность: {problem.danger > 0 ? `${problem.danger}/10` : 'анализ...'}
              </span>
            </div>

            {problem.danger > 0 && <DangerBar danger={problem.danger} />}
          </div>

          <MiniMap coordinates={problem.coordinates} />
        </div>

        <button
          className={styles.fundBtn}
          disabled={problem.status !== 'aiverified' || funding}
          onClick={handleFund}
        >
          {btnLabel()}
        </button>
      </div>
    </div>
  )
}

// Компонент для отображения актуальных проблем в фильтре
const ActualProblems = ({ issues }) => {
  const actualIssues = issues
    .filter(issue => issue.status === 'aiverified' || issue.status === 'in_progress')
    .slice(0, 5)

  if (actualIssues.length === 0) {
    return (
      <div className={styles.noActualProblems}>
        <p>Нет актуальных проблем</p>
      </div>
    )
  }

  return (
    <div className={styles.actualProblems}>
      <h3 className={styles.actualTitle}>🔥 Актуальные проблемы</h3>
      <div className={styles.actualList}>
        {actualIssues.map(issue => (
          <div key={issue.id} className={styles.actualItem}>
            <div className={styles.actualImage}>
              {issue.img ? (
                <img src={issue.img} alt={issue.problem} />
              ) : (
                <div className={styles.actualImagePlaceholder}>📷</div>
              )}
            </div>
            <div className={styles.actualContent}>
              <h4 className={styles.actualProblemTitle}>{issue.problem}</h4>
              <div className={styles.actualDetails}>
                <span className={styles.actualDanger}>⚠️ {issue.danger}/10</span>
                <span className={styles.actualCost}>💰 {issue.cost} USDC</span>
              </div>
              <div className={styles.actualLocation}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{issue.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Home = () => {
  const [selectedMarker, setSelectedMarker] = useState(null)
  const { issues, loading, refetch } = useIssues()
  const { program } = useProgram()
  const { publicKey, connected } = useWallet()

  const handleFund = async (problem) => {
    if (!program || !publicKey) {
      alert('Подключите Phantom кошелёк!')
      return
    }

    try {
      const issuePubkey = new PublicKey(problem.id)

      const tx = await program.methods
        .fundIssue()
        .accounts({
          issue: issuePubkey,
          sponsor: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log('💰 Funded TX:', tx)
      alert(`✅ Успешно профинансировано!\nСумма: ${problem.cost} USDC\nTX: ${tx.slice(0, 20)}...`)
      refetch()

    } catch (err) {
      console.error(err)
      alert(`Ошибка финансирования: ${err.message}`)
    }
  }

  return (
    <>
      <div className={styles.homeContainer}>
        <Header />
        <div className={styles.homePost}>
          <div className={styles.problemLists}>
            {loading && (
              <div className={styles.loadingMsg}>⏳ Загрузка с блокчейна...</div>
            )}
            {!loading && issues.length === 0 && (
              <div className={styles.emptyMsg}>Проблем пока нет. Будьте первым!</div>
            )}
            {issues.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onFund={handleFund}
                onClick={() => setSelectedMarker(problem)}
              />
            ))}
          </div>
          
          <div className={styles.problemFilter}>
            <ActualProblems issues={issues} />
          </div>
        </div>
      </div>

      {selectedMarker && (
        <ProblemModal problemModal={selectedMarker} setProblemModal={setSelectedMarker} />
      )}
    </>
  )
}

export default Home