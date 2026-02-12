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
  Grow
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Login,
  Business,
  Shield,
  Fingerprint
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';

export default function LoginCliente() {
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE_URL}/Clientes/login-cliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: formData.usuario,
          contrasena: formData.contrasena
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }
      
      // Guardar información
      if (data.token) {
        localStorage.setItem('clienteToken', data.token);
      }
      
      const sessionData = {
        id: data.cliente?.id,
        nombre: data.cliente?.nombre,
        usuario: data.cliente?.usuario,
        celular: data.cliente?.celular,
        token: data.token,
        loggedIn: true,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('clienteSession', JSON.stringify(sessionData));
      
      if (data.cliente) {
        localStorage.setItem('clienteData', JSON.stringify(data.cliente));
      }
      
      // Redirección suave
      setTimeout(() => {
        navigate(`/cliente/dashboard/${data.cliente.id}`);
      }, 300);
      
    } catch (err) {
      const errorMessage = err.name === 'AbortError' 
        ? 'Error de conexión'
        : err.message || 'Error en el inicio de sesión';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
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
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
            backgroundSize: '200% 100%',
            animation: 'shine 3s linear infinite'
          },
          '@keyframes shine': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
          }
        }}>
          {/* Encabezado compacto */}
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
              backgroundClip: 'text',
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
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  py: 0.5,
                  fontSize: '0.85rem',
                  backgroundColor: alpha('#f44336', 0.08),
                  border: '1px solid',
                  borderColor: alpha('#f44336', 0.2),
                  '& .MuiAlert-icon': {
                    padding: '8px 0'
                  }
                }}
                icon={<Fingerprint fontSize="small" />}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Formulario compacto */}
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
                    },
                    '&:hover': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: alpha('#667eea', 0.5)
                      }
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.9rem',
                    '&.Mui-focused': {
                      color: '#667eea'
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
                    },
                    '&:hover': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: alpha('#667eea', 0.5)
                      }
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.9rem',
                    '&.Mui-focused': {
                      color: '#667eea'
                    }
                  }
                }}
              />
            </Box>
            
            {/* Botón compacto */}
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 3px 10px rgba(102, 126, 234, 0.3)',
                },
                '&:disabled': {
                  background: alpha('#667eea', 0.4),
                  transform: 'none',
                  boxShadow: 'none'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  transition: 'left 0.6s ease'
                },
                '&:hover::after': {
                  left: '100%'
                }
              }}
            >
              {loading ? 'VERIFICANDO...' : 'INGRESAR'}
            </Button>
          </form>

          {/* Footer minimalista */}
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