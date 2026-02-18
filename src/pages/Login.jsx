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

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../config";

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import RestaurantIcon from "@mui/icons-material/Restaurant";

// IMPORT CORRECTO DEL LOGO (funciona en desarrollo y producción)
import logo from "../assets/distelslogo.png";

// Definición de colores para consistencia con el sistema
const COLOR_PALETTE = {
  primary: "#1E4B8B",     // Azul principal
  secondary: "#AA1B2B",   // Rojo secundario
  accent: "#EAB126",      // Amarillo acento
  dark: "#040404",        // Negro
  brown: "#602C27"        // Marrón
};

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      console.log("📥 LOGIN → Respuesta del servidor:", data);

      if (!res.ok) {
        setError(data.message || "Credenciales incorrectas.");
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError("El servidor no envió un token válido.");
        setLoading(false);
        return;
      }

      // Construir objeto de usuario con valores por defecto
      const userData = {
        token: data.token,
        usuario: data.usuario || usuario, // Usar el ingresado si viene vacío
        nombre: data.nombre || data.nombreCompleto || data.usuario || usuario,
        rol: data.rol || "usuario", // Rol por defecto
        idusuario: data.idusuario || data.idUsuario || data.id || 1, // 👈 VALOR POR DEFECTO 1
        idempleado: data.idempleado || data.idEmpleado || null,
        ...data
      };

      console.log("👤 userData construido:", userData);

      // Guardar en localStorage primero (respaldo)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Llamar al login del contexto
      login(data.token, userData);
      
      // Pequeño delay para asegurar que se guardó
      setTimeout(() => {
        navigate("/Start", { replace: true });
      }, 100);

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
          animation: "fadeIn 1.2s ease",
          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to: { opacity: 1 }
          }
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
              boxShadow: `0 12px 32px ${COLOR_PALETTE.dark}40`,
              animation: "slideUp 0.8s ease",
              "@keyframes slideUp": {
                from: { transform: "translateY(30px)", opacity: 0 },
                to: { transform: "translateY(0)", opacity: 1 }
              },
              border: `1px solid ${COLOR_PALETTE.primary}20`,
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

            {/* LOGO CON FONDO CIRCULAR */}
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
                boxShadow: `0 6px 16px ${COLOR_PALETTE.primary}40`,
                border: `3px solid ${COLOR_PALETTE.accent}`
              }}>
                <img 
                  src={logo} 
                  alt="Distels Logo" 
                  style={{ 
                    width: '80%', 
                    height: '80%', 
                    objectFit: 'contain' 
                  }} 
                />
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
                mb: 1,
                fontSize: { xs: "1.8rem", sm: "2rem" }
              }}
            >
              Bienvenido
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                color: COLOR_PALETTE.dark,
                opacity: 0.7,
                fontSize: "0.95rem"
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
                  fontSize: "0.9rem",
                  backgroundColor: `${COLOR_PALETTE.secondary}15`,
                  border: `1px solid ${COLOR_PALETTE.secondary}30`,
                  color: COLOR_PALETTE.secondary,
                  '& .MuiAlert-icon': {
                    color: COLOR_PALETTE.secondary
                  }
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: COLOR_PALETTE.primary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLOR_PALETTE.primary,
                      borderWidth: 2
                    }
                  }
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
                        sx={{ color: COLOR_PALETTE.dark }}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: COLOR_PALETTE.primary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLOR_PALETTE.primary,
                      borderWidth: 2
                    }
                  }
                }}
              />

              {/* BOTÓN DE INGRESO */}
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
                  color: "white",
                  textTransform: "none",
                  boxShadow: `0 4px 12px ${COLOR_PALETTE.primary}40`,
                  "&:hover": {
                    background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}DD, ${COLOR_PALETTE.secondary}DD)`,
                    boxShadow: `0 6px 16px ${COLOR_PALETTE.primary}60`,
                    transform: "translateY(-2px)"
                  },
                  "&:disabled": {
                    background: `${COLOR_PALETTE.dark}30`,
                    color: `${COLOR_PALETTE.dark}50`
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

            {/* FOOTER DEL LOGIN */}
            <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${COLOR_PALETTE.dark}10` }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: COLOR_PALETTE.dark,
                  opacity: 0.6,
                  fontSize: "0.8rem"
                }}
              >
                © {new Date().getFullYear()} Sistema Distels v1.0
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: "block",
                  mt: 0.5,
                  color: COLOR_PALETTE.primary,
                  fontSize: "0.8rem"
                }}
              >
                Para uso exclusivo del personal autorizado
              </Typography>
            </Box>

          </Paper>
        </Fade>
      </Box>
    </>
  );
};

export default Login;