import React from 'react';
import { Navigate } from 'react-router-dom';

export const ClienteAuthGuard = ({ children }) => {
  const session = localStorage.getItem('clienteSession');
  
  if (!session) {
    return <Navigate to="/login/cliente" replace />;
  }
  
  try {
    const sessionData = JSON.parse(session);
    
    // Verificar si la sesión expiró (24 horas)
    const sessionAge = Date.now() - sessionData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (sessionAge > maxAge) {
      localStorage.removeItem('clienteSession');
      return <Navigate to="/login/cliente" replace />;
    }
    
    return children;
  } catch  {
    localStorage.removeItem('clienteSession');
    return <Navigate to="/login/cliente" replace />;
  }
};