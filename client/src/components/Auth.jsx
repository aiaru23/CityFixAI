import React, { useEffect } from 'react';
import styles from './Auth.module.css';
import { useNavigate } from 'react-router-dom';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const Auth = () => {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();

  // Если кошелек подключен, автоматически редиректим на главную
  useEffect(() => {
    if (connected) {
      console.log('Подключен кошелек:', publicKey.toString());
      localStorage.setItem("user", true)
      // Можно здесь сохранять publicKey в state или localStorage
      navigate('/');
    }
  }, [connected, publicKey, navigate]);

  return (
    <div className={styles.authBody}>
      <div className={styles.authLeft}>
        <div className={styles.heroBlock}>
          <div className={styles.gragient}></div>
          <h2 className={styles.headerText}>
            Сделаем <br />
            город лучше <br />
            вместе
          </h2>
          <img src="./logos 1.svg" alt="Logo" className={styles.logo}/> 
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.loginBody}>
          <div className={styles.formText}>
            <h2>Подключите кошелек</h2>
            <p>Используйте Phantom Wallet для входа</p>
          </div>

          <div className={styles.walletBtn}>
            {/* Кнопка Phantom Wallet */}
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth;