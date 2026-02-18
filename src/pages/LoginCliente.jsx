// pages/LoginCliente.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress,
  Fade,
  alpha,
  Grow,
  Collapse
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Login,
  Business,
  Shield,
  Fingerprint,
  ErrorOutline,
  Info
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';

export default function LoginCliente() {
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
    // Limpiar cualquier sesión anterior al cargar la página de login
    localStorage.removeItem('clienteSession');
    localStorage.removeItem('clienteToken');
    localStorage.removeItem('clienteData');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (debugInfo) setDebugInfo(null);
  };

  const validateForm = () => {
    if (!formData.usuario.trim()) {
      setError('Ingresa tu usuario');
      return false;
    }
    if (!formData.contrasena) {
      setError('Ingresa tu contraseña');
      return false;
    }
    if (formData.contrasena.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setDebugInfo(null);

    try {
      console.log('🔑 Intentando login con:', { 
        usuario: formData.usuario,
        contrasena: '****' 
      });
      
      console.log('🌐 API URL:', `${API_BASE_URL}/Clientes/login-cliente`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Preparar los datos exactamente como los espera el servidor
      const loginData = {
        usuario: formData.usuario.trim(),
        contrasena: formData.contrasena
      };

      console.log('📤 Enviando datos:', loginData);

      const res = await fetch(`${API_BASE_URL}/Clientes/login-cliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true' // <--- AÑADE ESTA LÍNEA
        },
        body: JSON.stringify(loginData),
        signal: controller.signal,
        credentials: 'include' // Importante para cookies/sesiones
      });
      
      clearTimeout(timeoutId);

      console.log('📥 Respuesta recibida:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      });

      // Intentar obtener el cuerpo de la respuesta
      let data;
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
        console.log('📦 Datos de respuesta:', data);
      } else {
        const text = await res.text();
        console.log('📄 Respuesta no JSON:', text);
        throw new Error(`Respuesta inválida del servidor: ${text.substring(0, 100)}`);
      }

      if (!res.ok) {
        // Si es 401, mostrar mensaje más específico
        if (res.status === 401) {
          throw new Error(data.message || 'Usuario o contraseña incorrectos');
        } else {
          throw new Error(data.message || `Error del servidor: ${res.status}`);
        }
      }
      
      // Verificar que la respuesta tenga el formato esperado
      if (!data.success) {
        throw new Error(data.message || 'Error en la autenticación');
      }

      if (!data.cliente || !data.cliente.id) {
        throw new Error('Respuesta inválida: datos de cliente incompletos');
      }
      
      console.log('✅ Login exitoso:', data);

      // Guardar información de sesión
      const sessionData = {
        id: data.cliente.id,
        nombre: data.cliente.nombre,
        usuario: data.cliente.usuario,
        celular: data.cliente.celular,
        email: data.cliente.email,
        token: data.token,
        loggedIn: true,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('clienteSession', JSON.stringify(sessionData));
      
      if (data.token) {
        localStorage.setItem('clienteToken', data.token);
      }
      
      if (data.cliente) {
        localStorage.setItem('clienteData', JSON.stringify(data.cliente));
      }
      
      // Mostrar mensaje de éxito breve
      setDebugInfo({
        type: 'success',
        message: '¡Login exitoso! Redirigiendo...'
      });

      // Redirección después de un breve delay
      setTimeout(() => {
        navigate(`/cliente/dashboard/${data.cliente.id}`);
      }, 1000);
      
    } catch (err) {
      console.error('❌ Error en login:', err);
      
      let errorMessage = '';
      
      if (err.name === 'AbortError') {
        errorMessage = '⏱️ Tiempo de espera agotado. Verifica tu conexión.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = '🔌 No se pudo conectar al servidor. Verifica que el backend esté funcionando.';
      } else {
        errorMessage = err.message || 'Error en el inicio de sesión';
      }
      
      setError(errorMessage);
      
      // Guardar información de depuración
      setDebugInfo({
        type: 'error',
        message: err.message,
        stack: err.stack,
        url: `${API_BASE_URL}/Clientes/login-cliente`
      });
      
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  // Función para probar credenciales de ejemplo (solo para desarrollo)
  const fillTestCredentials = () => {
    setFormData({
      usuario: 'test',
      contrasena: '123456'
    });
  };

  return (
    <Container maxWidth="xs" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      background: 'radial-gradient(circle at 50% 50%, #667eea 0%, #764ba2 70%, #5a3d8a 100%)'
    }}>
      <Grow in={animate} timeout={500}>
        <Paper elevation={16} sx={{ 
          p: 4, 
          borderRadius: 3,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 10px 40px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
          `,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Encabezado */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ 
              width: 70, 
              height: 70, 
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
              border: '3px solid white'
            }}>
              <Business sx={{ fontSize: 36 }} />
            </Avatar>
            
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.75rem'
            }}>
              Acceso Cliente
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ 
              fontSize: '0.95rem',
              opacity: 0.8
            }}>
              Ingresa tus credenciales
            </Typography>
          </Box>

          {/* Mensaje de error */}
          <Collapse in={!!error}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                py: 1,
                fontSize: '0.85rem',
                backgroundColor: alpha('#f44336', 0.08),
                border: '1px solid',
                borderColor: alpha('#f44336', 0.2)
              }}
              icon={<ErrorOutline fontSize="small" />}
            >
              {error}
            </Alert>
          </Collapse>

          {/* Información de depuración (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <Collapse in={!!debugInfo}>
              <Alert 
                severity={debugInfo.type || 'info'}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  py: 1,
                  fontSize: '0.8rem',
                  fontFamily: 'monospace'
                }}
                icon={<Info fontSize="small" />}
              >
                <strong>Debug:</strong> {debugInfo.message}
                {debugInfo.url && (
                  <Box component="div" sx={{ mt: 0.5, opacity: 0.8 }}>
                    URL: {debugInfo.url}
                  </Box>
                )}
              </Alert>
            </Collapse>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Campo Usuario */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                onFocus={() => setFocusedField('usuario')}
                onBlur={() => setFocusedField(null)}
                onKeyPress={handleKeyPress}
                required
                disabled={loading}
                size="small"
                autoComplete="username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person 
                        sx={{ 
                          color: focusedField === 'usuario' ? '#667eea' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    backgroundColor: alpha('#f8f9ff', 0.8),
                    transition: 'all 0.25s ease',
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }
                  }
                }}
              />
            </Box>
            
            {/* Campo Contraseña */}
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Contraseña"
                name="contrasena"
                type={showPassword ? "text" : "password"}
                value={formData.contrasena}
                onChange={handleChange}
                onFocus={() => setFocusedField('contrasena')}
                onBlur={() => setFocusedField(null)}
                onKeyPress={handleKeyPress}
                required
                disabled={loading}
                size="small"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock 
                        sx={{ 
                          color: focusedField === 'contrasena' ? '#667eea' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ 
                          mr: 0.5,
                          color: 'action.active',
                          '&:hover': {
                            backgroundColor: alpha('#667eea', 0.08),
                            color: '#667eea'
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    backgroundColor: alpha('#f8f9ff', 0.8),
                    transition: 'all 0.25s ease',
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    }
                  }
                }}
              />
            </Box>
            
            {/* Botón principal */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="medium"
              disabled={loading}
              startIcon={loading ? 
                <CircularProgress size={20} color="inherit" /> : 
                <Login sx={{ fontSize: 20 }} />
              }
              sx={{
                py: 1.2,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 2.5,
                textTransform: 'none',
                letterSpacing: '0.3px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                },
                '&:disabled': {
                  background: alpha('#667eea', 0.4),
                  transform: 'none'
                }
              }}
            >
              {loading ? 'VERIFICANDO...' : 'INGRESAR'}
            </Button>

            {/* Botón de prueba (solo desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                fullWidth
                size="small"
                onClick={fillTestCredentials}
                sx={{ mt: 2, fontSize: '0.8rem' }}
              >
                Usar credenciales de prueba
              </Button>
            )}
          </form>

          {/* Footer */}
          <Fade in={animate} timeout={800}>
            <Box sx={{ 
              mt: 4, 
              pt: 3, 
              borderTop: `1px solid ${alpha('#000', 0.06)}`,
              textAlign: 'center'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 1,
                color: 'text.secondary'
              }}>
                <Shield sx={{ 
                  fontSize: 16, 
                  mr: 1,
                  color: '#667eea',
                  opacity: 0.8
                }} />
                <Typography variant="caption" sx={{ 
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                  fontSize: '0.8rem'
                }}>
                  Conexión segura
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ 
                opacity: 0.6,
                display: 'block',
                fontSize: '0.75rem'
              }}>
                © {new Date().getFullYear()} Sistema Cliente
              </Typography>
            </Box>
          </Fade>
        </Paper>
      </Grow>
    </Container>
  );
}