import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Email,
  WhatsApp,
  Send,
  ContentCopy,
  Person,
  Phone,
  Refresh,
  Preview,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import { useAuth } from '../hooks/useAuth';

export default function EnvioForm({ open, onClose, cliente, onEnviar }) {
  const { user: loggedUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    medio: 'whatsapp',
    tipoEnvio: 'credenciales'
  });

  const [credencialesGeneradas, setCredencialesGeneradas] = useState({
    usuario: '',
    contrasena: '',
    contrasenaOriginal: ''
  });

  // Inicializar solo cuando se abre el diálogo y hay cliente
  useEffect(() => {
    if (open && cliente) {
      console.log('DEBUG: Componente abierto con cliente:', cliente);
      
      // Obtener las credenciales REALES del cliente
      obtenerCredencialesReales();
      
      // Determinar medio inicial basado en lo que tenga el cliente
      const medioInicial = cliente.celular ? 'whatsapp' : 
                          cliente.email ? 'email' : 'whatsapp';
      
      setFormData({
        medio: medioInicial,
        tipoEnvio: 'credenciales'
      });
    }
  }, [open, cliente]);

  const obtenerCredencialesReales = async () => {
    if (!cliente || !cliente.id) {
      console.log('DEBUG: No hay cliente para obtener credenciales');
      return;
    }

    try {
      console.log('DEBUG: Obteniendo credenciales reales para:', cliente.nombre);
      
      // Obtener el usuario directamente del cliente
      const usuario = cliente.usuario || '';
      
      // Obtener la contraseña REAL del servidor
      let contrasena = '';
      try {
        const res = await fetch(`${API_BASE_URL}/Clientes/${cliente.id}/contrasena`);
        if (res.ok) {
          const data = await res.json();
          contrasena = data.contrasena || '';
          console.log('DEBUG: Contraseña obtenida del servidor:', contrasena ? '*** (oculta)' : 'No encontrada');
        } else {
          console.log('DEBUG: No se pudo obtener la contraseña del servidor');
        }
      } catch (err) {
        console.warn('DEBUG: Error al obtener contraseña:', err);
      }
      
      // Si no hay contraseña en el servidor, usar la del cliente (si existe)
      if (!contrasena && cliente.contrasena) {
        contrasena = cliente.contrasena;
        console.log('DEBUG: Usando contraseña del objeto cliente');
      }
      
      const credenciales = {
        usuario: usuario,
        contrasena: contrasena || 'No configurada',
        contrasenaOriginal: contrasena || 'No configurada'
      };
      
      console.log('DEBUG: Credenciales reales obtenidas - Usuario:', usuario);
      setCredencialesGeneradas(credenciales);
      
      return credenciales;
    } catch (err) {
      console.error('DEBUG: Error al obtener credenciales reales:', err);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // NO permitir cambiar la contraseña aquí
    if (name === 'contrasena') {
      return; // Ignorar cambios en la contraseña
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCopy = (text) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccess('¡Copiado al portapapeles!');
        setTimeout(() => setSuccess(''), 2000);
      })
      .catch(err => {
        setError('Error al copiar: ' + err.message);
      });
  };

  const handleEnviar = async () => {
    console.log('DEBUG: handleEnviar iniciado');
    console.log('DEBUG: Cliente:', cliente);
    console.log('DEBUG: Credenciales para enviar - Usuario:', credencialesGeneradas.usuario);
    console.log('DEBUG: Medio seleccionado:', formData.medio);
    
    // Validaciones básicas
    if (!cliente) {
      setError('No hay información del cliente');
      return;
    }

    if (!credencialesGeneradas.usuario) {
      setError('El usuario no está configurado');
      return;
    }

    if (!credencialesGeneradas.contrasena || credencialesGeneradas.contrasena === 'No configurada') {
      setError('La contraseña no está configurada. Primero configure una contraseña en la edición del cliente.');
      return;
    }

    if (formData.medio === 'whatsapp' && !cliente.celular) {
      setError('El cliente no tiene número de celular registrado para enviar por WhatsApp');
      return;
    }

    if (formData.medio === 'email' && !cliente.email) {
      setError('El cliente no tiene email registrado para enviar por correo');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Registrar el envío en el sistema
      try {
        const envioData = {
          clienteId: cliente.id,
          cuentaId: loggedUser?.id || 1,
          medio: formData.medio,
          tipoEnvio: formData.tipoEnvio,
          fechaEnvio: new Date().toISOString(),
          estado: 'completado',
          credencialesEnviadas: true,
          usuarioEnviado: credencialesGeneradas.usuario
        };

        const envioResponse = await fetch(`${API_BASE_URL}/Envios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(envioData)
        });

        if (envioResponse.ok) {
          console.log('DEBUG: Envío registrado en el sistema');
        }
      } catch (envioError) {
        console.warn('DEBUG: No se pudo registrar el envío:', envioError);
      }

      // Enviar por el medio seleccionado
      console.log('DEBUG: Enviando por medio:', formData.medio);
      let envioExitoso = false;
      
      if (formData.medio === 'whatsapp') {
        envioExitoso = await enviarWhatsApp();
      } else if (formData.medio === 'email') {
        envioExitoso = await enviarEmail();
      }

      if (envioExitoso) {
        const mensajeExito = `¡Credenciales enviadas por ${formData.medio === 'whatsapp' ? 'WhatsApp' : 'Email'} correctamente!`;
        console.log('DEBUG:', mensajeExito);
        setSuccess(mensajeExito);

        setTimeout(() => {
          if (onEnviar) {
            onEnviar();
          }
          onClose();
        }, 1500);
      } else {
        // Mostrar mensaje de error
        setError('No se pudo enviar automáticamente. Copia y envía manualmente.');
      }

    } catch (err) {
      console.error('DEBUG: Error en handleEnviar:', err);
      setError(err.message || 'Error al procesar el envío. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const enviarWhatsApp = async () => {
    try {
      if (!cliente.celular) {
        console.error('DEBUG: No hay número de celular');
        return false;
      }

      console.log('DEBUG: Enviando WhatsApp a:', cliente.celular);
      
      // Limpiar número de teléfono (solo dígitos)
      const telefonoLimpio = cliente.celular.replace(/\D/g, '');
      
      if (!telefonoLimpio || telefonoLimpio.length < 8) {
        console.error('DEBUG: Número de teléfono inválido:', telefonoLimpio);
        return false;
      }
      
      // URL específica para login de cliente
      const urlLoginCliente = `${window.location.origin}/login/cliente`;
      
      const mensaje = `*¡Bienvenido ${cliente.nombre}!*%0A%0A` +
        `*Tus credenciales de acceso:*%0A` +
        `👤 *Usuario:* ${credencialesGeneradas.usuario}%0A` +
        `🔐 *Contraseña:* ${credencialesGeneradas.contrasena}%0A%0A` +
        `*Accede aquí:* ${urlLoginCliente}%0A%0A` +
        `_Este es un mensaje automático, por favor no responder._`;
      
      const url = `https://wa.me/${telefonoLimpio}?text=${mensaje}`;
      console.log('DEBUG: URL de WhatsApp:', url);
      
      // Abrir en nueva pestaña
      window.open(url, '_blank');
      
      return true;
    } catch (err) {
      console.error('DEBUG: Error al enviar WhatsApp:', err);
      return false;
    }
  };

  const enviarEmail = async () => {
    try {
      if (!cliente.email) {
        console.error('❌ No hay email');
        return false;
      }

      console.log('📧 Enviando email automáticamente a:', cliente.email);
      
      // URL específica para login de cliente
      const urlLoginCliente = `${window.location.origin}/login/cliente`;
      
      // Preparar datos para el email
      const emailData = {
        destinatario: cliente.email,
        asunto: `Tus Credenciales de Acceso - ${cliente.empresa || 'Área de Cliente'}`,
        nombreCliente: cliente.nombre,
        usuario: credencialesGeneradas.usuario,
        contrasena: credencialesGeneradas.contrasena,
        urlAcceso: urlLoginCliente,
        notaImportante: 'Estas credenciales son las configuradas en el sistema. Te recomendamos cambiar la contraseña periódicamente por seguridad.'
      };

      console.log('📤 Enviando datos al servidor:', { ...emailData, contrasena: '***' });
      
      // Llamar al endpoint automático
      const response = await fetch(`${API_BASE_URL}/Email/enviar-credenciales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();
      
      console.log('📥 Respuesta del servidor:', result);

      if (response.ok && result.success) {
        console.log('✅ Email enviado automáticamente');
        return true;
      } else {
        console.error('❌ Error del servidor:', result.message || 'Error desconocido');
        
        // Fallback: mailto: si el servidor falla
        const mailtoLink = `mailto:${cliente.email}?` +
          `subject=${encodeURIComponent(emailData.asunto)}&` +
          `body=${encodeURIComponent(
            `Hola ${cliente.nombre},\n\n` +
            `Tus credenciales de acceso:\n\n` +
            `Usuario: ${credencialesGeneradas.usuario}\n` +
            `Contraseña: ${credencialesGeneradas.contrasena}\n\n` +
            `Accede aquí: ${urlLoginCliente}\n\n` +
            `NOTA: ${emailData.notaImportante}\n\n` +
            `Este es un mensaje automático, por favor no responder.`
          )}`;
        
        window.open(mailtoLink, '_blank');
        return false;
      }

    } catch (err) {
      console.error('💥 Error al enviar email:', err);
      
      // Fallback extremo: mostrar alerta con credenciales
      alert(`Error al conectar con el servidor de email. Copia y envía manualmente:\n\n` +
        `Email: ${cliente.email}\n` +
        `Usuario: ${credencialesGeneradas.usuario}\n` +
        `Contraseña: ${credencialesGeneradas.contrasena}\n\n` +
        `URL: ${window.location.origin}/login/cliente`);
      
      return false;
    }
  };

  const getMensajePreview = () => {
    // URL específica para login de cliente
    const urlLoginCliente = `${window.location.origin}/login/cliente`;
    
    return `¡Hola ${cliente?.nombre || 'Cliente'}!

Tus credenciales de acceso:

👤 Usuario: ${credencialesGeneradas.usuario || '[No configurado]'}
🔐 Contraseña: ${credencialesGeneradas.contrasena || '[No configurada]'}

Accede aquí: ${urlLoginCliente}

NOTA: Estas son tus credenciales configuradas en el sistema.
Te recomendamos cambiar la contraseña periódicamente por seguridad.

Este es un mensaje automático, por favor no responder.`;
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Función para verificar si el botón debe estar deshabilitado
  const isEnviarDisabled = () => {
    if (loading) {
      return true;
    }
    
    if (!cliente) {
      return true;
    }
    
    if (!credencialesGeneradas.usuario) {
      return true;
    }
    
    if (!credencialesGeneradas.contrasena || credencialesGeneradas.contrasena === 'No configurada') {
      return true;
    }
    
    // Solo validar medio si hay credenciales
    if (formData.medio === 'whatsapp' && !cliente.celular) {
      return true;
    }
    
    if (formData.medio === 'email' && !cliente.email) {
      return true;
    }
    
    return false;
  };

  // Si el diálogo no está abierto o no hay cliente, no renderizar nada
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Send sx={{ mr: 1 }} />
        Enviar Credenciales de Acceso
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Person color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {cliente?.nombre || 'Cliente no disponible'}
                  {cliente?.esPremium && (
                    <Chip label="Premium" size="small" color="warning" sx={{ ml: 1 }} />
                  )}
                </Typography>
               
                <Box display="flex" gap={2} mt={0.5} flexWrap="wrap">
                  {cliente?.celular && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" component="span">
                        {cliente.celular}
                      </Typography>
                      {formData.medio === 'whatsapp' && (
                        <Chip 
                          label="WhatsApp" 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1 }}
                          component="span"
                        />
                      )}
                    </Box>
                  )}
                  {cliente?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" component="span">
                        {cliente.email}
                      </Typography>
                      {formData.medio === 'email' && (
                        <Chip 
                          label="Email" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }}
                          component="span"
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Credenciales para Enviar:
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Nota:</strong> Se enviarán las credenciales configuradas actualmente en el sistema. 
                Si necesitas cambiar la contraseña, hazlo desde la edición del cliente.
              </Typography>
            </Alert>
            
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Usuario"
                  value={credencialesGeneradas.usuario}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Tooltip title="Copiar usuario">
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(credencialesGeneradas.usuario)}
                          disabled={!credencialesGeneradas.usuario}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                  helperText="Usuario configurado en el sistema"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={credencialesGeneradas.contrasena}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <>
                        <Tooltip title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                          <IconButton
                            size="small"
                            onClick={toggleShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copiar contraseña">
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopy(credencialesGeneradas.contrasena)}
                            disabled={!credencialesGeneradas.contrasena || credencialesGeneradas.contrasena === 'No configurada'}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )
                  }}
                  helperText="Contraseña configurada en el sistema"
                />
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Si el cliente no tiene contraseña configurada, debes editarlo primero y asignarle una.
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Configurar Envío:
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Medio de Envío *</InputLabel>
              <Select 
                name="medio" 
                value={formData.medio} 
                onChange={handleChange} 
                label="Medio de Envío *"
                disabled={loading}
              >
                <MenuItem value="whatsapp">
                  <Box display="flex" alignItems="center" gap={1}>
                    <WhatsApp color={cliente?.celular ? "success" : "error"} />
                    <Typography component="span">WhatsApp</Typography>
                    {!cliente?.celular && (
                      <Chip 
                        label="Sin número" 
                        size="small" 
                        color="error" 
                        component="span"
                      />
                    )}
                  </Box>
                </MenuItem>
                <MenuItem value="email">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email color={cliente?.email ? "primary" : "error"} />
                    <Typography component="span">Email</Typography>
                    {!cliente?.email && (
                      <Chip 
                        label="Sin email" 
                        size="small" 
                        color="error" 
                        component="span"
                      />
                    )}
                  </Box>
                </MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {formData.medio === 'whatsapp' 
                  ? cliente?.celular 
                    ? `Se enviará a: ${cliente.celular}` 
                    : 'El cliente no tiene celular registrado'
                  : cliente?.email
                    ? `Se enviará a: ${cliente.email}`
                    : 'El cliente no tiene email registrado'
                }
              </Typography>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Envío</InputLabel>
              <Select 
                name="tipoEnvio" 
                value={formData.tipoEnvio} 
                onChange={handleChange} 
                label="Tipo de Envío"
                disabled={loading}
              >
                <MenuItem value="credenciales">Credenciales de Acceso</MenuItem>
                <MenuItem value="bienvenida">Mensaje de Bienvenida</MenuItem>
                <MenuItem value="recordatorio">Recordatorio de Pago</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Preview fontSize="small" />
                  Vista Previa del Mensaje:
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1, 
                  maxHeight: 200, 
                  overflowY: 'auto', 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}>
                  {getMensajePreview()}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleEnviar}
          disabled={isEnviarDisabled()}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          color="primary"
        >
          {loading ? 'Enviando...' : 'Enviar Credenciales'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}