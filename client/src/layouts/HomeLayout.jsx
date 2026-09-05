import React from 'react'
import { Outlet } from 'react-router-dom'
import styles from './HomeLayout.module.css'
import Aside from '../components/Aside'

const HomeLayout = () => {
    return (
        <div className={styles.basicLayout}>
            <Aside />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    )
}

export default HomeLayout