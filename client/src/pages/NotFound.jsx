// NotFound.jsx (обновленный)
import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './NotFound.module.css'

const NotFound = () => {
  const navigate = useNavigate()

  const goBack = () => {
    navigate(-1)
  }

  const goHome = () => {
    navigate('/')
  }

  return (
    <div className={styles.notFoundPage}>
      <div className={styles.leftDecoration}>
        <img src="./notFound_one.svg" alt="Decoration left" className={styles.leftImage} />
      </div>
      
      <div className={styles.mainSection}>
        <div className={styles.content}>
          <h3>404</h3>
          <h4>Упс! Страница не найдена</h4>
          <p>Запрошенный путь не найден в нашей сети</p>
          <div className={styles.buttons}>
            <button onClick={goBack} className={styles.backBtn}>
              ← Вернуться назад
            </button>
            <button onClick={goHome} className={styles.homeBtn}>
              На главную
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.rightDecoration}>
        <img src="./notFound_two.svg" alt="Decoration right" className={styles.rightImage} />
      </div>
    </div>
  )
}

export default NotFound