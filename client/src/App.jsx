import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import HomeLayout from './layouts/HomeLayout'
import Auth from './components/Auth'
import ProtectedRoute from './components/ProtectedRouter'
import Home from './pages/Home'
import Map from './pages/Map'
import Profile from './pages/Profile'
import Create from './pages/Create'
import Logout from './components/Logout'

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import NotFound from './pages/NotFound'
import { IssuesProvider } from './context/IssuesContext'

const wallets = [new PhantomWalletAdapter()];

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><HomeLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'map',
        element: <Map />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'create',
        element: <Create />
      }
    ]
  },
  {
    path: '/login',
    element: <Auth />,
  },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    path: '*',
    element: <NotFound />
  }
])

function App() {

  return (
    <>
      <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <RouterProvider router={router} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  )
}

export default App