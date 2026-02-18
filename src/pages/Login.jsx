// Login.js - Sistema Administrativo
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  CssBaseline,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../config";

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Logo - Usar un ícono en lugar de imagen para evitar errores
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

const COLOR_PALETTE = {
  primary: "#1E4B8B",
  secondary: "#AA1B2B",
  accent: "#EAB126",
  dark: "#040404",
  brown: "#602C27"
};

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate(); // Hook para navegación

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!usuario || !password) {
      setError("Por favor ingrese usuario y contraseña.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        usuario: usuario.trim(),
        password: password.trim()
      };

      console.log("📤 LOGIN → Enviando payload:", payload);
      
      const res = await fetch(`${API_BASE_URL}/Usuarios/Login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Credenciales incorrectas.");
        setLoading(false);
        return;
      }

     // Después de obtener el token exitosamente (data.token existe)
if (data.token) {
  // PASO 1: Guardar MANUALMENTE en localStorage (INMEDIATO)
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({
    usuario: usuario,
    nombre: data.nombre || usuario,
    rol: data.rol || "usuario"
  }));

  // PASO 2: Actualizar contexto (si es necesario)
  if (login) {
    login(data.token, userData);
  }

  // PASO 3: Pequeño retraso y REDIRECCIÓN FORZADA
  setTimeout(() => {
    console.log("🔄 Redirigiendo a /start");
    window.location.href = '/start'; // ← ESTO FUNCIONA SIEMPRE
  }, 150);
}

      const userData = {
        token: data.token,
        usuario: data.usuario || usuario,
        nombre: data.nombre || data.usuario || usuario,
        rol: data.rol || "",
        idusuario: data.idusuario || data.idUsuario || data.id,
        idempleado: data.idempleado || data.idEmpleado,
        ...data
      };

      // Guardar en el contexto de autenticación
      login(userData.token, userData);
      
      // Usar navigate en lugar de window.location
      navigate('/start', { replace: true });
      
    } catch (err) {
      console.error("ERROR DE LOGIN:", err);
      setError("No se pudo conectar con el servidor. Inténtalo más tarde.");
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(135deg, ${COLOR_PALETTE.primary} 0%, ${COLOR_PALETTE.secondary} 50%, ${COLOR_PALETTE.accent} 100%)`,
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={14}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              width: "90%",
              maxWidth: 420,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "white",
              position: "relative",
              overflow: "hidden",
              '&::before': {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`
              }
            }}
          >
            {/* LOGO CON ÍCONO EN LUGAR DE IMAGEN */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center",
              mb: 2
            }}>
              <Box sx={{
                borderRadius: "50%",
                width: 100,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${COLOR_PALETTE.primary}20, ${COLOR_PALETTE.secondary}20)`,
                border: `3px solid ${COLOR_PALETTE.accent}`
              }}>
                <RestaurantMenuIcon sx={{ fontSize: 50, color: COLOR_PALETTE.primary }} />
              </Box>
            </Box>

            {/* TITULO */}
            <Typography 
              variant="h4"
              sx={{
                fontWeight: "bold",
                background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1
              }}
            >
              Bienvenido
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                color: COLOR_PALETTE.dark,
                opacity: 0.7
              }}
            >
              Sistema de Gestión
            </Typography>

            {/* MENSAJE DE ERROR */}
            {error && (
              <Alert 
                severity="error" 
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: `${COLOR_PALETTE.secondary}15`,
                  border: `1px solid ${COLOR_PALETTE.secondary}30`
                }}
              >
                {error}
              </Alert>
            )}

            {/* FORMULARIO */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: COLOR_PALETTE.primary }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: COLOR_PALETTE.primary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)} 
                        disabled={loading}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.4,
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
                  textTransform: "none",
                  "&:hover": {
                    background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}DD, ${COLOR_PALETTE.secondary}DD)`,
                    transform: "translateY(-2px)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Ingresar al Sistema"
                )}
              </Button>
            </Box>

            <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${COLOR_PALETTE.dark}10` }}>
              <Typography variant="caption" sx={{ color: COLOR_PALETTE.dark, opacity: 0.6 }}>
                © {new Date().getFullYear()} Sistema Distels v1.0
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </>
  );
};

export default Login;