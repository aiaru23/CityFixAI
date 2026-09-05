import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import styles from './Profile.module.css'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useIssues } from '../hooks/useIssues'
import { useProgram } from '../solana.js'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FaTools } from "react-icons/fa"
import { BsTools } from "react-icons/bs"
import { LuMonitorCheck } from "react-icons/lu"
import ProblemModal from '../components/ProblemModal.jsx'

const DangerBar = ({ danger }) => {
  const color = 'linear-gradient(88deg,rgba(99, 55, 239, 1) 0%, rgba(37, 47, 64, 1) 64%)'
  return (
    <div className={styles.dangerBar}>
      <div
        className={styles.dangerFill}
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

const markerModel = (status) => {
  if (status === 'resolved') return (<div className={styles.resolvedPin}><LuMonitorCheck /></div>);
  if (status === 'rejected' || status === 'in_progress') return (<div className={styles.rejected}><FaTools /></div>);
  return (<div className={styles.aiverified}><BsTools /></div>);
}

const btnLabel = (problem) => {
  if (problem.status === 'aiverified') return `Профинансировать ${problem.cost} USDC`
  if (problem.status === 'pending') return 'Ожидает оценки ИИ...'
  if (problem.status === 'resolved') return '✅ Решено'
  if (problem.status === 'rejected') return '❌ Отклонено'
  if (problem.status === 'in_progress') return '🔧 В процессе ремонта'
  return `Профинансировать ${problem.cost} USDC`
}

const statusConfig = {
  resolved: { label: "Решено", color: "#22c55e" },
  aiverified: { label: "ИИ одобрил", color: "#8b5cf6" },
  pending: { label: "Ожидает ИИ", color: "#f97316" },
  in_progress: { label: "В процессе", color: "#3b82f6" },
  rejected: { label: "Отклонено", color: "#ef4444" },
}

const MyProblemCard = ({ problem, onFund, onClick }) => {
  const [funding, setFunding] = useState(false)
  const st = statusConfig[problem.status] ?? statusConfig.pending

  const handleFund = async (e) => {
    e.stopPropagation()
    setFunding(true)
    try { await onFund(problem) }
    finally { setFunding(false) }
  }

  return (
    <div className={styles.card} onClick={onClick}>
      {problem.img
        ? <img src={problem.img} alt="" className={styles.cardImg} />
        : <div className={styles.cardImgPlaceholder}>📷</div>
      }
      <div className={styles.cardBody}>
        <h4 className={styles.cardTitle}>{problem.problem}</h4>

        <span className={styles.badge} style={{ background: st.color }}>
          {st.label}
        </span>

        {problem.danger > 0 && (
          <p className={styles.cardText}>⚠️ Опасность: {problem.danger}/10</p>
        )}
        {problem.cost > 0 && (
          <p className={styles.cardText}>💰 Стоимость: ${problem.cost}</p>
        )}
        <p className={styles.cardLocation}>📍 {problem.location}</p>

        {problem.status === 'aiverified' && (
          <button
            className={styles.fundBtn}
            disabled={funding}
            onClick={handleFund}
          >
            {funding ? '⏳ Отправка...' : `Профинансировать ${problem.cost} USDC`}
          </button>
        )}
      </div>
    </div>
  )
}

const Profile = () => {
  const { publicKey, connected } = useWallet()
  const { issues, loading, refetch } = useIssues()
  const { program } = useProgram()
  const [selectedMarker, setSelectedMarker] = useState(null)

  // Фильтруем только проблемы текущего пользователя
  const myIssues = issues
    .filter(
      (issue) => issue.creator === publicKey?.toString()
    )
    .filter((issue) => issue.status !== "pending")

  const handleFund = async (problem) => {
    if (!program || !publicKey) return
    try {
      const tx = await program.methods
        .fundIssue()
        .accounts({
          issue: new PublicKey(problem.id),
          sponsor: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      alert(`✅ Профинансировано! TX: ${tx.slice(0, 20)}...`)
      refetch()
    } catch (err) {
      alert(`Ошибка: ${err.message}`)
    }
  }

  if (!connected || !publicKey) {
    return (
      <div>
        <Header />
        <div className={styles.notConnected}>
          <p>Подключите Phantom кошелёк для просмотра профиля</p>
          <WalletMultiButton />
        </div>
      </div>
    )
  }

  // Статистика
  const total = myIssues.length
  const resolved = myIssues.filter(i => i.status === 'resolved').length
  const pending = myIssues.filter(i => i.status === 'pending').length
  const funded = myIssues.filter(i => i.status === 'in_progress').length

  return (
    <>
      <div>
        <Header />
        <div className={styles.profilePage}>

          {/* Шапка профиля */}
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {publicKey.toString().slice(0, 2).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.walletAddr}>
                {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
              </h2>
              <p className={styles.walletFull}>{publicKey.toString()}</p>
            </div>
            <Link to="/logout" className={styles.logoutBtn}>Выйти</Link>
          </div>

          {/* Статистика */}
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{total}</span>
              <span className={styles.statLabel}>Всего</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{resolved}</span>
              <span className={styles.statLabel}>Решено</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{funded}</span>
              <span className={styles.statLabel}>В процессе</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{pending}</span>
              <span className={styles.statLabel}>Ожидает</span>
            </div>
          </div>

          {/* Список проблем */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Мои проблемы</h3>

            {loading && <p className={styles.msg}>⏳ Загрузка...</p>}

            {!loading && myIssues.length === 0 && (
              <p className={styles.msg}>Вы ещё не создавали проблем</p>
            )}

            <div className={styles.cardGrid}>
              {myIssues.map(problem => (
                <MyProblemCard
                  key={problem.id}
                  problem={problem}
                  onFund={handleFund}
                  onClick={() => setSelectedMarker(problem)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
      {selectedMarker && (
        <ProblemModal problemModal={selectedMarker} setProblemModal={setSelectedMarker} />
      )}
    </>
  )
}

export default Profile