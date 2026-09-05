// Header.jsx (обновленный)
import React, { useState, useEffect } from 'react'
import { FaSearch } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import styles from './Header.module.css'

const Header = () => {
    const [isMobile, setIsMobile] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768)
            if (window.innerWidth > 768) {
                setSearchOpen(false)
            }
        }
        
        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        // Здесь можно добавить логику поиска
    }

    const toggleSearch = () => {
        setSearchOpen(!searchOpen)
    }

    return (
        <>
            <div className={styles.homeHeader}>
                <h2>CityFix AI</h2>

                <div className={styles.headerCenter}>
                    {(!isMobile || (isMobile && !searchOpen)) && (
                        <label className={styles.search}>
                            <FaSearch />
                            <input 
                                type="text" 
                                placeholder='Поиск' 
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </label>
                    )}
                    
                    {isMobile && !searchOpen && (
                        <button className={styles.mobileSearchBtn} onClick={toggleSearch}>
                            <FaSearch />
                        </button>
                    )}
                </div>
            </div>

            {/* Мобильный поиск в отдельном оверлее */}
            {isMobile && searchOpen && (
                <div className={styles.mobileSearchOverlay}>
                    <div className={styles.mobileSearchContainer}>
                        <div className={styles.mobileSearchHeader}>
                            <button 
                                className={styles.mobileSearchClose}
                                onClick={toggleSearch}
                            >
                                <RxCross1 />
                            </button>
                            <div className={styles.mobileSearchInputWrapper}>
                                <FaSearch />
                                <input 
                                    type="text" 
                                    placeholder='Поиск...' 
                                    className={styles.mobileSearchInput}
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className={styles.mobileSearchResults}>
                            {searchQuery && (
                                <div className={styles.searchResultsPlaceholder}>
                                    <p>Результаты поиска для: "{searchQuery}"</p>
                                    {/* Здесь можно добавить реальные результаты поиска */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Header