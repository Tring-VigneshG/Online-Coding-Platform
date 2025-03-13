import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); 
            return <Navigate to="/signin" replace />;
        }
        return <Outlet />;
    } catch (error) {
        console.error("Invalid Token:", error);
        localStorage.removeItem("token"); 
        return <Navigate to="/signin" replace />;
    }
};

export default ProtectedRoute;
