import React, { useState, useEffect } from "react";
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

// IMPORT DEL LOGO
import logo from "../assets/distelslogo.png";

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
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar si ya hay sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/Start';
    }
  }, []);

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

      console.log("📤 Enviando login...");
      
      const res = await fetch(`${API_BASE_URL}/Usuarios/Login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache" // Evitar caché
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Respuesta:", data);

      if (!res.ok || !data.token) {
        setError(data.message || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      // DATOS MÍNIMOS para compatibilidad
      const userData = {
        token: data.token,
        usuario: usuario,
        nombre: usuario,
        rol: "admin",
        idusuario: 1
      };

      // Guardar en localStorage
      localStorage.clear(); // Limpiar datos viejos
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log("✅ Login exitoso, redirigiendo...");
      
      // IMPORTANTE: Usar window.location para móvil
      window.location.href = '/Start';

    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error de conexión. Verifica tu internet.");
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
          background: `linear-gradient(135deg, ${COLOR_PALETTE.primary} 0%, ${COLOR_PALETTE.secondary} 100%)`,
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={14}
            sx={{
              p: { xs: 3, sm: 4 },
              width: "90%",
              maxWidth: 400,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "white",
            }}
          >
            {/* LOGO */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Box sx={{
                borderRadius: "50%",
                width: 90,
                height: 90,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `3px solid ${COLOR_PALETTE.accent}`
              }}>
                <img 
                  src={logo} 
                  alt="Logo" 
                  style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
                />
              </Box>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
              Bienvenido
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                fullWidth
                disabled={loading}
                margin="normal"
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
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: COLOR_PALETTE.primary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
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
                  mt: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Ingresar"}
              </Button>
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid #ccc` }}>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                © {new Date().getFullYear()} Sistema Distels
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </>
  );
};

export default Login;