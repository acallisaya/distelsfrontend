// src/pages/ActivacionClienteFinalPage.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Snackbar
} from "@mui/material";
import {
  Send,
  CheckCircle,
  WhatsApp
} from "@mui/icons-material";
import MuiAlert from '@mui/material/Alert';
import { API_BASE_URL } from "../config";

const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ActivacionClienteFinalPage({ 
  embedded = false,
  onClose,
  colorPrimario,
  colorFondo,
  textoColor,
  fondoClaro 
}) {
  const [codigoTarjeta, setCodigoTarjeta] = useState("");
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tarjetaVerificada, setTarjetaVerificada] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // ========== FUNCIÓN PARA OBTENER HEADERS CON NGROK ==========
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true' // 👈 HEADER CLAVE PARA NGROK
    };
  };

  // Determinar colores según props
  const getContrastColor = (color) => {
    if (!color) return '#333333';
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#333333' : '#ffffff';
  };

  const primaryColor = colorPrimario || '#1976d2';
  const backgroundColor = colorFondo || (fondoClaro ? '#ffffff' : '#1a1a1a');
  const textColor = textoColor || (fondoClaro ? '#333333' : '#ffffff');
  const contrastColor = getContrastColor(primaryColor);
  const borderColor = fondoClaro ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)';
  const hoverBorderColor = fondoClaro ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)';

  const handleVerificarCodigo = async () => {
    if (!codigoTarjeta.trim() || codigoTarjeta.trim().length < 10) {
      return;
    }

    setVerificando(true);
    setError("");

    try {
      // ✅ AGREGAR HEADERS A LA PETICIÓN
      const res = await fetch(`${API_BASE_URL}/Tarjetas/codigo/${codigoTarjeta}`, {
        headers: getHeaders()
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Error respuesta:', text);
        throw new Error(`Error ${res.status}: No se pudo verificar la tarjeta`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Código inválido o ya utilizado");
      }

      setTarjetaVerificada(true);
      showSnackbar("✅ Tarjeta verificada", "success");
    } catch (err) {
      setError(err.message);
      setTarjetaVerificada(false);
    } finally {
      setVerificando(false);
    }
  };

  const enviarWhatsApp = (credenciales) => {
    // Formatear número para WhatsApp
    let numeroLimpio = celular.replace(/\D/g, '');
    
    if (numeroLimpio.startsWith('0')) {
      numeroLimpio = numeroLimpio.substring(1);
    }
    
    const numeroWhatsApp = numeroLimpio.startsWith('591') 
      ? numeroLimpio 
      : `591${numeroLimpio}`;
    
    // 📱 MENSAJE COMPLETO CON CREDENCIALES
    const mensaje = encodeURIComponent(
      `🎬 *¡ACTIVACIÓN EXITOSA!* 🎉\n\n` +
      `Hola *${nombre || 'cliente'}*, tu tarjeta *${codigoTarjeta}* ha sido activada correctamente.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔑 *TUS CREDENCIALES DE ACCESO*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📺 *Servicio:* ${credenciales.servicio || 'Streaming'}\n` +
      `👤 *Usuario:* ${credenciales.usuario}\n` +
      `🔐 *Contraseña:* ${credenciales.contrasena}\n` +
      `${credenciales.perfil ? `👥 *Perfil:* ${credenciales.perfil}\n` : ''}` +
      `${credenciales.pin ? `📌 *PIN:* ${credenciales.pin}\n` : ''}` +
      `📅 *Válido hasta:* ${credenciales.fechaVencimiento ? new Date(credenciales.fechaVencimiento).toLocaleDateString('es-ES') : 'No especificada'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📱 *¿CÓMO ACCEDER?*\n` +
      `1️⃣ Abre la aplicación o sitio web de *${credenciales.servicio || 'tu servicio'}*\n` +
      `2️⃣ Haz clic en *Iniciar Sesión*\n` +
      `3️⃣ Ingresa el usuario y contraseña de arriba\n` +
      `4️⃣ ¡Disfruta de tu contenido!\n\n` +
      `⚡ *Guarda este mensaje, tus credenciales son únicas e intransferibles.*\n` +
      `🆘 *Soporte:* Contacta a tu vendedor o distribuidor\n\n` +
      `✨ *¡Gracias por confiar en nosotros!*`
    );
    
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    window.open(url, '_blank');
  };

  const handleActivacion = async () => {
    if (!tarjetaVerificada) {
      setError("Primero verifica la tarjeta");
      return;
    }
    
    if (!celular.trim()) {
      setError("Ingresa tu número de celular");
      return;
    }
    
    // Validación para Bolivia (8 dígitos)
    let numeroLimpio = celular.replace(/\D/g, '');
    if (numeroLimpio.startsWith('0')) {
      numeroLimpio = numeroLimpio.substring(1);
    }
    if (numeroLimpio.startsWith('591')) {
      numeroLimpio = numeroLimpio.substring(3);
    }
    
    if (numeroLimpio.length !== 8) {
      setError("Número inválido (8 dígitos para Bolivia)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Enviar número COMPLETO con código de país
      const numeroCompleto = `591${numeroLimpio}`;

      const payload = {
        codigoTarjeta,
        nombreCliente: nombre.trim() || "Cliente",
        celular: numeroCompleto,
        email: "",
        metodoEnvio: "WHATSAPP",
        dispositivo: navigator.userAgent,
        navegador: navigator.appName
      };

      console.log("Enviando payload:", payload);

      // ✅ AGREGAR HEADERS A LA PETICIÓN
      const res = await fetch(`${API_BASE_URL}/Tarjetas/activar-cliente-final`, {
        method: 'POST',
        headers: getHeaders(), // 👈 AHORA USA LA FUNCIÓN CON NGROK
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Error respuesta:', text);
        throw new Error(`Error ${res.status}: No se pudo completar la activación`);
      }

      const responseData = await res.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || "Error en la activación");
      }

      // ✅ ENVIAR WHATSAPP AUTOMÁTICAMENTE CON LAS CREDENCIALES
      const credenciales = {
        usuario: responseData.usuario || codigoTarjeta,
        contrasena: responseData.contrasena || "****",
        perfil: responseData.perfil || "",
        pin: responseData.pin || "",
        servicio: responseData.servicio || "Streaming",
        fechaVencimiento: responseData.fechaVencimiento || null
      };

      // Enviar WhatsApp automáticamente
      enviarWhatsApp(credenciales);

      setSuccess(true);
      showSnackbar("✅ Activación completada - Credenciales enviadas por WhatsApp", "success");
      
    } catch (err) {
      setError(err.message || "Error al activar");
      showSnackbar(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleReset = () => {
    setCodigoTarjeta("");
    setNombre("");
    setCelular("");
    setError("");
    setSuccess(false);
    setTarjetaVerificada(false);
  };

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '320px',
        mx: 'auto',
        bgcolor: backgroundColor,
        color: textColor
      }}>
        {!success ? (
          <>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 1.5,
                  fontSize: '0.7rem',
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: fondoClaro ? '#ffebee' : '#311b92',
                  color: fondoClaro ? '#c62828' : '#ffffff'
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5,
              alignItems: 'center'
            }}>
              <TextField
                size="small"
                label="Código Tarjeta *"
                value={codigoTarjeta}
                onChange={(e) => {
                  const newValue = e.target.value.toUpperCase();
                  setCodigoTarjeta(newValue);
                  if (tarjetaVerificada) setTarjetaVerificada(false);
                }}
                onBlur={handleVerificarCodigo}
                placeholder="Ej: ABC123XYZ"
                disabled={loading}
                helperText={verificando ? "Verificando..." : ""}
                FormHelperTextProps={{ 
                  sx: { 
                    fontSize: '0.65rem', 
                    mx: 0,
                    textAlign: 'center',
                    color: textColor
                  } 
                }}
                InputProps={{
                  sx: { 
                    fontSize: '0.8rem',
                    height: '40px',
                    width: '100%',
                    color: textColor,
                    bgcolor: fondoClaro ? '#ffffff' : `${backgroundColor}20`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: borderColor,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: hoverBorderColor,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: primaryColor,
                    },
                  }
                }}
                InputLabelProps={{
                  sx: {
                    color: textColor,
                    opacity: 0.7,
                  }
                }}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': { 
                    height: '40px',
                    borderRadius: 1
                  },
                  '& .MuiInputLabel-root': { 
                    fontSize: '0.75rem'
                  }
                }}
              />

              <TextField
                size="small"
                label="Nombre (opcional)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading || !tarjetaVerificada}
                placeholder="Tu nombre"
                InputProps={{
                  sx: { 
                    fontSize: '0.8rem',
                    height: '40px',
                    width: '100%',
                    color: textColor,
                    bgcolor: fondoClaro ? '#ffffff' : `${backgroundColor}20`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: borderColor,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: hoverBorderColor,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: primaryColor,
                    },
                  }
                }}
                InputLabelProps={{
                  sx: {
                    color: textColor,
                    opacity: 0.7,
                  }
                }}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': { 
                    height: '40px',
                    borderRadius: 1
                  },
                  '& .MuiInputLabel-root': { 
                    fontSize: '0.75rem'
                  }
                }}
              />

              <TextField
                size="small"
                label="Celular *"
                value={celular}
                onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                disabled={loading || !tarjetaVerificada}
                placeholder="76240322"
                helperText="8 dígitos para WhatsApp Bolivia"
                FormHelperTextProps={{ 
                  sx: { 
                    fontSize: '0.65rem', 
                    mx: 0,
                    textAlign: 'center',
                    color: textColor
                  } 
                }}
                InputProps={{
                  sx: { 
                    fontSize: '0.8rem',
                    height: '40px',
                    width: '100%',
                    color: textColor,
                    bgcolor: fondoClaro ? '#ffffff' : `${backgroundColor}20`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: borderColor,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: hoverBorderColor,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: primaryColor,
                    },
                  }
                }}
                InputLabelProps={{
                  sx: {
                    color: textColor,
                    opacity: 0.7,
                  }
                }}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': { 
                    height: '40px',
                    borderRadius: 1
                  },
                  '& .MuiInputLabel-root': { 
                    fontSize: '0.75rem'
                  }
                }}
              />

              {tarjetaVerificada && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.7rem', 
                    mt: 0.5,
                    textAlign: 'center',
                    display: 'block',
                    color: '#4CAF50'
                  }}
                >
                  ✅ Tarjeta verificada
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={handleActivacion}
                disabled={loading || !tarjetaVerificada || !celular.trim()}
                startIcon={loading ? <CircularProgress size={14} sx={{ color: contrastColor }} /> : <Send />}
                size="small"
                sx={{
                  py: 0.75,
                  px: 3,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  mt: 0.5,
                  height: '38px',
                  width: '100%',
                  maxWidth: '200px',
                  bgcolor: primaryColor,
                  color: contrastColor,
                  '&:hover': {
                    bgcolor: `${primaryColor}DD`,
                  },
                  '&.Mui-disabled': {
                    bgcolor: fondoClaro ? '#e0e0e0' : '#555555',
                    color: fondoClaro ? '#9e9e9e' : '#888888',
                  }
                }}
              >
                {loading ? 'Activando...' : 'Activar Tarjeta'}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 2,
            width: '100%',
            color: textColor
          }}>
            <CheckCircle sx={{ 
              fontSize: 48, 
              color: '#4CAF50', 
              mb: 1
            }} />
            
            <Typography variant="h6" gutterBottom fontWeight={600} color="#4CAF50">
              ¡Activación Exitosa!
            </Typography>

            <Box sx={{ 
              bgcolor: fondoClaro ? '#f8f9fa' : '#2d2d2d', 
              p: 2, 
              borderRadius: 2, 
              mb: 2,
              mt: 1,
              border: `1px solid ${primaryColor}30`,
            }}>
              <Typography variant="body2" sx={{ 
                color: textColor, 
                textAlign: 'center',
                fontWeight: 'medium',
                mb: 0.5
              }}>
                ✅ Tarjeta activada correctamente
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#25D366', 
                display: 'block',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                📲 Credenciales enviadas por WhatsApp
              </Typography>
              <Typography variant="caption" sx={{ 
                color: textColor, 
                opacity: 0.7,
                display: 'block',
                textAlign: 'center',
                mt: 0.5
              }}>
                +591 {celular.replace(/\D/g, '').replace(/^0+/, '').replace(/^591/, '').slice(-8)}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mt: 1
            }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                size="small"
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  py: 0.75,
                  px: 3,
                  height: '38px',
                  borderRadius: 1,
                  borderColor: primaryColor,
                  color: primaryColor,
                  '&:hover': {
                    borderColor: `${primaryColor}DD`,
                    bgcolor: `${primaryColor}10`
                  }
                }}
              >
                Activar otra tarjeta
              </Button>
            </Box>
          </Box>
        )}

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <AlertComponent 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ 
              fontSize: '0.75rem', 
              py: 0.5, 
              borderRadius: 1,
              bgcolor: snackbar.severity === 'success' ? '#4CAF50' : 
                       snackbar.severity === 'error' ? '#F44336' : 
                       snackbar.severity === 'warning' ? '#FF9800' : '#2196F3'
            }}
          >
            {snackbar.message}
          </AlertComponent>
        </Snackbar>
      </Box>
    </Box>
  );
}