import { FaTools } from "react-icons/fa";
import { BsTools } from "react-icons/bs";
import { LuMonitorCheck } from "react-icons/lu";
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useProgram } from '../solana.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import { useIssues } from '../hooks/useIssues';
import styles from './ProblemModal.module.css'

const DangerBar = ({ danger }) => {
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

const markerModel = (status) => {
  if (status === 'resolved') return (<div className={styles.resolvedPin}><LuMonitorCheck /></div>);
  if (status === 'rejected' || status === 'in_progress') return (<div className={styles.rejected}><FaTools /></div>);
  return (<div className={styles.aiverified}><BsTools /></div>);
}

const statusConfig = {
  resolved: { label: "Решено" },
  pending: { label: "Ожидает ИИ" },
  in_progress: { label: "В процессе" },
  aiverified: { label: "ИИ одобрил" },
  rejected: { label: "Отклонено" },
}

const btnLabel = (problem) => {
  if (problem.status === 'aiverified') return `Профинансировать ${problem.cost} USDC`
  if (problem.status === 'pending') return 'Ожидает оценки ИИ...'
  if (problem.status === 'resolved') return '✅ Решено'
  if (problem.status === 'rejected') return '❌ Отклонено'
  if (problem.status === 'in_progress') return '🔧 В процессе ремонта'
  return `Профинансировать ${problem.cost} USDC`
}

const ProblemModal = ({ problemModal, setProblemModal }) => {
  const { program } = useProgram()
  const { publicKey, connected } = useWallet()
  const { refetch } = useIssues()

  const status = statusConfig[problemModal.status] ?? statusConfig.pending
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
      setProblemModal(null)
      refetch()

    } catch (err) {
      console.error(err)
      alert(`Ошибка финансирования: ${err.message}`)
    }
  }

  return (
    <div className={styles.problemModal} onClick={() => setProblemModal(false)}>
      <div className={styles.modalBody} onClick={e => e.stopPropagation()}>
        <div className={styles.modalImg}>
          <img src={problemModal.img} alt="" />
          <div className={styles.markerModel}>
            {markerModel(problemModal.status)}
          </div>
        </div>

        <div className={styles.problemInfo}>
          <div className={styles.headerModel}>
            <div className={styles.headerText}>
              <p>{problemModal.problem}</p>
              <p>Блок AI-Анализа</p>
            </div>

            <div className={styles.mapDiv}>
              <MapContainer
                center={problemModal.coordinates}
                zoom={15}
                className={styles.mapModal}
              >
                <TileLayer
                  attribution='© OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

              </MapContainer>

              <button className={styles.dontMap}></button>
            </div>
          </div>

          <div className={styles.aiVerd}>
            <div className={styles.dengerModal}>
              <p>Опасность: </p>
              <DangerBar danger={problemModal.danger} />
            </div>
            <div className={styles.aiStatus}>
              <p><span className={styles.aiLabel}>AI<sup>✦</sup></span> Вердикт: {status.label}</p>
            </div>
            <p>Оценка ремонта: {problemModal.cost} USDC</p>
          </div>

          <div className={styles.btnAcions}>
            <button onClick={() => handleFund(problemModal)}>{btnLabel(problemModal)}</button>
            <button onClick={() => setProblemModal(false)}>Закрыть</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProblemModal;