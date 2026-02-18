// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";
import { API_BASE_URL } from "../config";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarToken = async () => {
      // 1. Obtener token
      const token = localStorage.getItem('token');
      console.log('🔐 ProtectedRoute - Token:', token ? '✅ Existe' : '❌ No existe');
      
      // 2. Si no hay token, no está autenticado
      if (!token) {
        console.log('❌ No hay token, redirigiendo a login');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // 3. Verificar token con el backend
        console.log('📡 Verificando token con API...');
        const response = await fetch(`${API_BASE_URL}/Usuarios/verificar`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });

        console.log('📡 Respuesta status:', response.status);

        if (response.ok) {
          console.log('✅ Token válido, acceso permitido');
          setIsAuthenticated(true);
        } else {
          // Token inválido, limpiar localStorage
          console.log('❌ Token inválido, limpiando sesión');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Error verificando token:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verificarToken();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        bgcolor: '#f5f5f5'
      }}>
        <CircularProgress sx={{ color: '#667eea' }} />
        <Typography sx={{ mt: 2, color: '#667eea' }}>
          Verificando autenticación...
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
          {localStorage.getItem('token') ? 'Token presente' : 'Esperando token...'}
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  return children;
};

export default ProtectedRoute;