// src/components/PrivateRoute.tsx
import { useAuth } from "@/context/AuthProvider";
import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Affichez un spinner global ou placeholder
    return <div>Chargement…</div>;
  }
  return user ? children : <Navigate to="/signin" replace />;
}
