// Aside.jsx (обновленный)
import React, { useState, useEffect } from 'react'
import styles from './Aside.module.css'
import { GoHome } from "react-icons/go";
import { TbMap2, TbUser } from "react-icons/tb";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { RiListCheck3 } from "react-icons/ri";
import { Link, useLocation } from 'react-router-dom';
import { RxHamburgerMenu, RxCross1 } from "react-icons/rx";

const Aside = () => {
    const local = useLocation()
    const [isMobile, setIsMobile] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768)
            if (window.innerWidth > 768) {
                setIsOpen(false)
            }
        }
        
        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    const links = [
        {
            id: 1,
            path: '/',
            label: 'Главная',
            icon: <GoHome />
        },
        {
            id: 2,
            path: '/map',
            label: 'Карта',
            icon: <TbMap2 />
        },
        {
            id: 3,
            path: '/profile',
            label: 'Профиль',
            icon: <TbUser />
        },
        {
            id: 4,
            path: '/create',
            label: 'Создать',
            icon: <FaPlus />
        }
    ]

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const closeMenu = () => {
        setIsOpen(false)
    }

    return (
        <>
            {isMobile && (
                <button className={styles.hamburger} onClick={toggleMenu}>
                    <RxHamburgerMenu />
                </button>
            )}
            
            <aside className={`${styles.aside} ${isMobile ? styles.mobileAside : ''} ${isMobile && isOpen ? styles.mobileOpen : ''} ${isMobile && !isOpen ? styles.mobileClosed : ''}`}>
                {isMobile && (
                    <button className={styles.closeBtn} onClick={closeMenu}>
                        <RxCross1 />
                    </button>
                )}
                
                <div className={styles.logo}>
                    <img src="./heroLogo.svg" alt="Logo" className={styles.logoImg}/>
                </div>
                
                <div className={styles.links}>
                    {links.map(link => (
                        <Link 
                            to={link.path} 
                            key={link.id} 
                            className={`${styles.link} ${local.pathname === link.path ? styles.Linkactive : ''}`}
                            onClick={closeMenu}
                        >
                            <div className={styles.linkIcon}>
                                {link.icon}
                            </div>
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>
            </aside>
            
            {isMobile && isOpen && (
                <div className={styles.overlay} onClick={closeMenu}></div>
            )}
        </>
    )
}

export default Aside