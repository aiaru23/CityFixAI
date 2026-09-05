import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'

const Logout = () => {
    const navigate = useNavigate()
    const { disconnect } = useWallet()

    useEffect(() => {
        const doLogout = async () => {
            try {
                await disconnect() 
                localStorage.removeItem("user")
                navigate('/login')   
            } catch (err) {
                console.error("Ошибка при выходе из кошелька:", err)
            }
        }

        doLogout()
    }, [disconnect, navigate])

    return (
        <div>Выход...</div>
    )
}

export default Logout