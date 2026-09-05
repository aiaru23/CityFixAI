import { Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import Loader from "./Loader";


function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const navigate = useNavigate()

    setTimeout(() => {
        const token = localStorage.getItem("user");
        if (token) {
            setIsAuthorized(true)
        } else {
            setIsAuthorized(false)
        }
    }, 3000)

    {/*
    useEffect(() => {
        auth().catch(() => setIsAuthorized(false))
    }, [])

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN) || sessionStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/auth/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                if (localStorage.getItem(REFRESH_TOKEN)) {
                    localStorage.setItem(ACCESS_TOKEN, res.data.access)
                } else {
                    sessionStorage.setItem(ACCESS_TOKEN, res.data.access)
                }
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN) || sessionStorage.getItem(REFRESH_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };
    */}

    if (isAuthorized === null) {
        return <Loader />;
    }

    return isAuthorized ? children : navigate('/login');
}

export default ProtectedRoute;