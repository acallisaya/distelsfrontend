import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Box,
  Alert,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  FormGroup,
  CircularProgress,
  Paper,
  Tooltip,
  Stack
} from "@mui/material";
import { 
  Close, 
  Save, 
  Person, 
  Phone, 
  Email,
  Visibility, 
  VisibilityOff,
  LockReset,
  AccountCircle
} from "@mui/icons-material";
import { API_BASE_URL } from "../config";

// Definición de colores (igual que en ClientesListPro)
const COLOR_PALETTE = {
  primary: "#667eea",
  secondary: "#f5576c",
  accent: "#EAB126",
  dark: "#040404",
  success: "#4caf50",
  warning: "#FF9800",
  info: "#2196F3"
};

export default function ClienteForm({ open, onClose, clienteData, onSave }) {
  const [cliente, setCliente] = useState({
    nombre: "",
    usuario: "",
    contrasena: "",
    celular: "",
    email: "",
    estado: "activo",
    tipo_cliente: "VENDEDOR" // AQUÍ EL CAMBIO: por defecto VENDEDOR
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cambiarContrasena, setCambiarContrasena] = useState(false);
  const [contrasenaOriginal, setContrasenaOriginal] = useState("");

  // Obtener contraseña del servidor cuando se abre para editar
  useEffect(() => {
    const fetchPassword = async () => {
      if (open && clienteData) {
        setIsEditing(true);
        setCambiarContrasena(false);
        setLoadingPassword(true);
        
        try {
          const res = await fetch(`${API_BASE_URL}/Clientes/${clienteData.id}/contrasena`);
          if (res.ok) {
            const data = await res.json();
            setContrasenaOriginal(data.contrasena || "");
            setCliente({
              nombre: clienteData.nombre || "",
              usuario: clienteData.usuario || "",
              contrasena: data.contrasena || "",
              celular: clienteData.celular || "",
              email: clienteData.email || "",
              estado: clienteData.estado || "activo",
              tipo_cliente: clienteData.tipo_cliente || "VENDEDOR" // Mantener tipo_cliente
            });
          } else {
            setCliente({
              nombre: clienteData.nombre || "",
              usuario: clienteData.usuario || "",
              contrasena: "",
              celular: clienteData.celular || "",
              email: clienteData.email || "",
              estado: clienteData.estado || "activo",
              tipo_cliente: clienteData.tipo_cliente || "VENDEDOR" // Mantener tipo_cliente
            });
          }
        } catch (err) {
          console.error("Error obteniendo contraseña:", err);
          setCliente({
            nombre: clienteData.nombre || "",
            usuario: clienteData.usuario || "",
            contrasena: "",
            celular: clienteData.celular || "",
            email: clienteData.email || "",
            estado: clienteData.estado || "activo",
            tipo_cliente: clienteData.tipo_cliente || "VENDEDOR" // Mantener tipo_cliente
          });
        } finally {
          setLoadingPassword(false);
        }
      } else if (open && !clienteData) {
        setIsEditing(false);
        setCambiarContrasena(true);
        setContrasenaOriginal("");
        
        const randomNum = Math.floor(100 + Math.random() * 900);
        const userBase = "cliente" + randomNum;
        
        setCliente({
          nombre: "",
          usuario: userBase,
          contrasena: "Cliente123@",
          celular: "",
          email: "",
          estado: "activo",
          tipo_cliente: "VENDEDOR" // Por defecto VENDEDOR
        });
      }
      
      setError("");
      setShowPassword(false);
    };

    if (open) {
      fetchPassword();
    }
  }, [open, clienteData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCliente(prev => ({ ...prev, contrasena: password }));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async () => {
    // Validaciones actualizadas con teléfono obligatorio
    if (!cliente.nombre || !cliente.usuario || !cliente.celular) {
      setError("Nombre, usuario y teléfono son requeridos");
      return;
    }
    
    if (!isEditing && !cliente.contrasena.trim()) {
      setError("La contraseña es requerida para nuevo cliente");
      return;
    }

    if (isEditing && cambiarContrasena && !cliente.contrasena.trim()) {
      setError("Debe ingresar una nueva contraseña");
      return;
    }

    if (cliente.email && !isValidEmail(cliente.email)) {
      setError("Por favor ingrese un email válido");
      return;
    }

    // Validación de teléfono (mínimo 9 dígitos)
    if (cliente.celular && !isValidPhone(cliente.celular)) {
      setError("Por favor ingrese un número de teléfono válido (mínimo 9 dígitos)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = isEditing 
        ? `${API_BASE_URL}/Clientes/${clienteData.id}`
        : `${API_BASE_URL}/Clientes`;

      const method = isEditing ? "PUT" : "POST";

      // AQUÍ SE INCLUYE tipo_cliente EN LOS DATOS
      const datosParaEnviar = {
        nombre: cliente.nombre.trim(),
        usuario: cliente.usuario.trim(),
        celular: cliente.celular.trim(),
        email: cliente.email.trim() || null,
        estado: cliente.estado,
        tipo_cliente: cliente.tipo_cliente // AQUÍ SE ENVÍA
      };

      // Manejo de contraseña
      if (isEditing) {
        if (cambiarContrasena) {
          datosParaEnviar.contrasena = cliente.contrasena.trim();
        } else {
          datosParaEnviar.contrasena = contrasenaOriginal;
        }
      } else {
        datosParaEnviar.contrasena = cliente.contrasena;
      }

      console.log("Datos a enviar:", datosParaEnviar); // Para verificar en consola

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaEnviar)
      });

      const responseText = await res.text();
      
      if (!res.ok) {
        let errorMessage = "Error al guardar";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      onSave();
      onClose();
      
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const isValidPhone = (phone) => {
    // Eliminar espacios, guiones, paréntesis y el signo +
    const cleaned = phone.replace(/[\s+\-()]/g, '');
    // Verificar que tenga al menos 9 dígitos y solo números
    return /^\d{9,}$/.test(cleaned);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Header con el mismo estilo que ClientesListPro */}
      <Paper
        sx={{
          background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
          color: 'white',
          p: 2,
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              {isEditing ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
              {isEditing ? 'Actualiza los datos del cliente' : 'Registra un nuevo cliente en el sistema'}
              {cliente.tipo_cliente === "VENDEDOR" && " (Vendedor)"}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Paper>

      <DialogContent sx={{ p: 3, bgcolor: `${COLOR_PALETTE.dark}03` }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 1,
              fontSize: '0.85rem'
            }}
          >
            {error}
          </Alert>
        )}

        {loadingPassword && isEditing && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'white', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ color: COLOR_PALETTE.primary }} />
              <Typography variant="body2" sx={{ ml: 2, fontSize: '0.85rem' }}>
                Cargando datos del cliente...
              </Typography>
            </Box>
          </Paper>
        )}

        <Stack spacing={1}>
          {/* Sección 1: Información Básica */}
          <Paper sx={{ p:0.5, borderRadius: 1.5, bgcolor: 'white' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.85rem', color: COLOR_PALETTE.dark, fontWeight: 'medium' }}>
              <AccountCircle sx={{ fontSize: '1rem', mr: 1, color: COLOR_PALETTE.primary, verticalAlign: 'middle' }} />
              Información Básica
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  name="nombre"
                  value={cliente.nombre}
                  onChange={handleChange}
                  size="small"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      fontSize: '0.85rem'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Usuario"
                  name="usuario"
                  value={cliente.usuario}
                  onChange={handleChange}
                  size="small"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" sx={{ color: COLOR_PALETTE.primary }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: '0.85rem' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Sección 2: Contacto (CON TELÉFONO OBLIGATORIO) */}
          <Paper sx={{ p: 0.5, borderRadius: 1.5, bgcolor: 'white' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.85rem', color: COLOR_PALETTE.dark, fontWeight: 'medium' }}>
              <Phone sx={{ fontSize: '1rem', mr: 1, color: COLOR_PALETTE.primary, verticalAlign: 'middle' }} />
              Información de Contacto
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Celular"
                  name="celular"
                  value={cliente.celular}
                  onChange={handleChange}
                  size="small"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone fontSize="small" sx={{ color: COLOR_PALETTE.primary }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: '0.85rem' }
                  }}
                  placeholder="+591 76240321"
                  helperText="Ej: 591 76240321"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={cliente.email}
                  onChange={handleChange}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email fontSize="small" sx={{ color: COLOR_PALETTE.primary }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: '0.85rem' }
                  }}
                  placeholder="cliente@empresa.com"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Sección 3: Contraseña */}
          <Paper sx={{ p: 0.5, borderRadius: 1.5, bgcolor: 'white' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.85rem', color: COLOR_PALETTE.dark, fontWeight: 'medium' }}>
              <LockReset sx={{ fontSize: '1rem', mr: 1, color: COLOR_PALETTE.primary, verticalAlign: 'middle' }} />
              Seguridad
            </Typography>
            
            {/* CHECKBOX SOLO PARA EDICIÓN */}
            {isEditing && (
              <Box sx={{ mb: 3 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cambiarContrasena}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCambiarContrasena(checked);
                          if (!checked) {
                            setCliente(prev => ({ ...prev, contrasena: contrasenaOriginal }));
                          }
                        }}
                        size="small"
                        sx={{ 
                          color: COLOR_PALETTE.primary,
                          '&.Mui-checked': {
                            color: COLOR_PALETTE.primary,
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        ¿Cambiar contraseña?
                      </Typography>
                    }
                  />
                </FormGroup>
              </Box>
            )}
            
            {/* CAMPO DE CONTRASEÑA */}
            <Box>
              <TextField
                fullWidth
                label={
                  isEditing 
                    ? (cambiarContrasena ? "Nueva Contraseña *" : "Contraseña actual")
                    : "Contraseña *"
                }
                name="contrasena"
                type={showPassword ? "text" : "password"}
                value={cliente.contrasena}
                onChange={handleChange}
                size="small"
                required={!isEditing || cambiarContrasena}
                disabled={loadingPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={showPassword ? "Ocultar" : "Mostrar"}>
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          size="small"
                          disabled={loadingPassword}
                          sx={{ color: COLOR_PALETTE.dark }}
                        >
                          {showPassword ? 
                            <VisibilityOff fontSize="small" /> : 
                            <Visibility fontSize="small" />
                          }
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                  sx: { fontSize: '0.85rem' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mt: 1,
                px: 0.5
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {isEditing 
                    ? (cambiarContrasena 
                        ? "Ingrese una contraseña segura" 
                        : "Presione el ojo 👁️ para ver la contraseña")
                    : "Contraseña para acceder al sistema"
                  }
                </Typography>
                
                {(!isEditing || cambiarContrasena) && (
                  <Tooltip title="Generar contraseña segura">
                    <Button 
                      size="small" 
                      onClick={generateRandomPassword}
                      sx={{ 
                        py: 0.5, 
                        px: 1.5, 
                        fontSize: '0.75rem',
                        borderRadius: 1,
                        backgroundColor: `${COLOR_PALETTE.info}15`,
                        color: COLOR_PALETTE.info,
                        '&:hover': {
                          backgroundColor: `${COLOR_PALETTE.info}25`
                        },
                        minWidth: 'auto'
                      }}
                      startIcon={<LockReset fontSize="small" />}
                    >
                      Generar
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Nota informativa */}
          <Paper sx={{ p: 0, borderRadius: 1.5, bgcolor: '#f8f9fa' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box component="span" sx={{ color: COLOR_PALETTE.primary, mt: 0.25 }}>💡</Box>
              <Box>
                {isEditing 
                  ? (cambiarContrasena 
                      ? "Está cambiando la contraseña. La nueva contraseña se aplicará inmediatamente." 
                      : "Presione el ojo 👁️ para ver la contraseña actual. Marque la casilla para cambiarla.")
                  : <>
                      Los campos marcados con * son obligatorios.<br />
                      Este cliente se registrará como <strong>VENDEDOR</strong> por defecto.
                    </>
                }
              </Box>
            </Typography>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: `1px solid ${COLOR_PALETTE.dark}10`,
        bgcolor: 'white'
      }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button 
            onClick={onClose} 
            disabled={loading || loadingPassword}
            sx={{
              borderRadius: 1,
              px: 3,
              fontSize: '0.85rem',
              color: COLOR_PALETTE.dark,
              border: `1px solid ${COLOR_PALETTE.dark}20`,
              '&:hover': {
                backgroundColor: `${COLOR_PALETTE.dark}05`,
                borderColor: COLOR_PALETTE.dark
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || loadingPassword || (isEditing && cambiarContrasena && !cliente.contrasena)}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Save />}
            sx={{ 
              background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
              borderRadius: 1,
              px: 3,
              fontSize: '0.85rem',
              fontWeight: 'medium',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: `${COLOR_PALETTE.dark}20`,
                color: `${COLOR_PALETTE.dark}50`,
                boxShadow: 'none'
              }
            }}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Cliente' : 'Guardar Cliente')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}