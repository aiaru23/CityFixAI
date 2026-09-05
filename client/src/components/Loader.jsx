import React from 'react'
import { OrbitProgress } from 'react-loading-indicators'
import styles from './Loader.module.css'

const Loader = () => {
    return (
        <div className={styles.loaderContainer}>
            <div className={styles.loader}>
                <OrbitProgress color={["#4045EF", "#6337EF"]} />
            </div>
        </div>
    )
}

export default Loader