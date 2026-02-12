import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
  Chip,
  Stack,
  Switch,
  CircularProgress,
  Paper,
  Tooltip,
  InputAdornment,
  Avatar
} from "@mui/material";
import { 
  Close, 
  Save, 
  WhatsApp, 
  Phone, 
  Message, 
  Image, 
  VideoFile, 
  Audiotrack,
  Upload,
  Delete,
  PlayArrow,
  Visibility,
  Send,
  Settings,
  Chat,
  Campaign,
  SmartToy,
  Folder,
  CheckCircle,
  Error
} from "@mui/icons-material";
import { API_BASE_URL } from "../config";

// Paleta de colores consistente
const COLOR_PALETTE = {
  primary: "#25D366", // WhatsApp verde
  secondary: "#667eea",
  accent: "#EAB126",
  dark: "#040404",
  success: "#4caf50",
  warning: "#FF9800",
  info: "#2196F3",
  error: "#f5576c",
  whatsappGreen: "#25D366",
  whatsappDarkGreen: "#128C7E"
};

export default function WhatsAppForm({ open, onClose, whatsAppData, cliente, onSave }) {
  const [whatsApp, setWhatsApp] = useState({
    clienteId: "",
    whatsappNumber: "",
    estado: "activo",
    
    // Archivos multimedia
    imagenUrl: "",
    imagenNombre: "",
    videoUrl: "",
    videoNombre: "",
    audioUrl: "",
    audioNombre: "",
    
    // Textos
    mensajeBienvenida: "",
    mensajePromocional: "",
    
    // Permisos
    permitirImagenes: true,
    permitirVideos: true,
    permitirAudios: true,
    permitirTextos: true,
    
    // Bot
    botActivo: false,
    respuestaAutomatica: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Inicializar formulario
  useEffect(() => {
    if (open) {
      console.log("🔧 WhatsAppForm INICIANDO...");
      console.log("📦 Props recibidas:", { 
        open, 
        whatsAppData, 
        cliente,
        clienteId: cliente?.id,
        clienteNombre: cliente?.nombre,
        tieneCliente: !!cliente
      });
      
      // DEBUG: Mostrar todo el objeto cliente
      console.log("🔍 Cliente completo:", cliente);
      
      // CRÍTICO: Verificar que tenemos un cliente
      if (!cliente || typeof cliente !== 'object') {
        console.error("❌ CRÍTICO: Cliente es null, undefined o no es objeto");
        console.error("📋 Tipo de cliente:", typeof cliente);
        console.error("📋 Valor de cliente:", cliente);
        
        setError("ERROR CRÍTICO: No se recibió información del cliente. Cierre y vuelva a intentar.");
        setLoading(false);
        
        // Mostrar alerta al usuario
        setTimeout(() => {
          alert("❌ Error: No se pudo cargar la información del cliente.\nPor favor, cierre este formulario y vuelva a intentar.");
          onClose();
        }, 100);
        
        return;
      }
      
      // Verificar que el cliente tiene ID
      if (!cliente.id) {
        console.error("❌ CRÍTICO: Cliente no tiene propiedad 'id'");
        console.error("📋 Propiedades del cliente:", Object.keys(cliente));
        
        // Intentar buscar ID en diferentes propiedades (por si acaso)
        const posibleId = cliente.id || cliente.Id || cliente.ID;
        if (posibleId) {
          console.log("⚠️  Encontrado ID alternativo:", posibleId);
          // Crear un nuevo objeto con el ID correcto
          const clienteCorregido = { ...cliente, id: posibleId };
          console.log("📋 Cliente corregido:", clienteCorregido);
        }
        
        setError("ERROR: El cliente no tiene ID válido");
        setLoading(false);
        return;
      }
      
      console.log("✅ Cliente válido confirmado:", cliente.id, cliente.nombre);
      
      if (whatsAppData) {
        console.log("📄 Cargando datos existentes de WhatsApp");
        console.log("📋 WhatsAppData recibido:", whatsAppData);
        
        // Verificar que whatsAppData tiene clienteId
        const clienteId = whatsAppData.clienteId || cliente.id;
        
        setWhatsApp({
          clienteId: clienteId,
          whatsappNumber: whatsAppData.whatsAppNumber || whatsAppData.whatsappNumber || "",
          estado: whatsAppData.estado || "activo",
          imagenUrl: whatsAppData.imagenUrl || "",
          imagenNombre: whatsAppData.imagenNombre || "",
          videoUrl: whatsAppData.videoUrl || "",
          videoNombre: whatsAppData.videoNombre || "",
          audioUrl: whatsAppData.audioUrl || "",
          audioNombre: whatsAppData.audioNombre || "",
          mensajeBienvenida: whatsAppData.mensajeBienvenida || "",
          mensajePromocional: whatsAppData.mensajePromocional || "",
          permitirImagenes: whatsAppData.permitirImagenes ?? true,
          permitirVideos: whatsAppData.permitirVideos ?? true,
          permitirAudios: whatsAppData.permitirAudios ?? true,
          permitirTextos: whatsAppData.permitirTextos ?? true,
          botActivo: whatsAppData.botActivo ?? false,
          respuestaAutomatica: whatsAppData.respuestaAutomatica || ""
        });
      } else if (cliente) {
        console.log("➕ Creando nuevo WhatsApp para cliente");
        
        setWhatsApp({
          clienteId: cliente.id,
          whatsappNumber: cliente.telefono || cliente.celular || "",
          estado: "activo",
          imagenUrl: "",
          imagenNombre: "",
          videoUrl: "",
          videoNombre: "",
          audioUrl: "",
          audioNombre: "",
          mensajeBienvenida: `¡Hola ${cliente.nombre || "cliente"}! 👋\nGracias por contactarnos. ¿En qué podemos ayudarte?`,
          mensajePromocional: `🎉 ¡Promoción especial para ti, ${cliente.nombre || "cliente"}!\nAprovecha nuestras ofertas exclusivas.`,
          permitirImagenes: true,
          permitirVideos: true,
          permitirAudios: true,
          permitirTextos: true,
          botActivo: false,
          respuestaAutomatica: ""
        });
      } else {
        console.error("❌ No hay datos para inicializar el formulario");
        setError("No hay datos para inicializar el formulario");
      }
      
      setError("");
      setSuccess("");
      setLoading(false);
      console.log("✅ WhatsAppForm inicializado correctamente");
    }
  }, [open, whatsAppData, cliente]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWhatsApp(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar mensajes cuando se modifica
    if (error || success) {
      setError("");
      setSuccess("");
    }
  };

  const handleFileUpload = (fileType, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      
      // En una app real, aquí subirías el archivo al servidor
      // y obtendrías una URL. Por ahora simulamos.
      
      setWhatsApp(prev => ({
        ...prev,
        [`${fileType}Url`]: URL.createObjectURL(file),
        [`${fileType}Nombre`]: file.name
      }));
    };
    
    reader.readAsDataURL(file);
  };

  const removeFile = (fileType) => {
    setWhatsApp(prev => ({
      ...prev,
      [`${fileType}Url`]: "",
      [`${fileType}Nombre`]: ""
    }));
  };

  const handleSubmit = async () => {
    console.log("💾 handleSubmit ejecutándose...");
    console.log("📋 Estado actual de WhatsApp:", whatsApp);
    
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // CRÍTICO: Verificar que tenemos clienteId
      if (!whatsApp.clienteId) {
        console.error("❌ ERROR: whatsApp.clienteId está vacío");
        console.error("📋 Estado completo:", whatsApp);
        
        // Intentar obtener del prop cliente
        if (cliente && cliente.id) {
          console.log("⚠️  Usando cliente.id del prop:", cliente.id);
          whatsApp.clienteId = cliente.id;
        } else {
          throw new Error("No se ha seleccionado un cliente. Cierre el formulario y vuelva a intentar.");
        }
      }
      
      // Validar número de WhatsApp
      if (!whatsApp.whatsappNumber) {
        throw new Error("El número de WhatsApp es obligatorio");
      }

      console.log("✅ Validaciones pasadas. Preparando datos...");
      
      // PREPARAR DATOS PARA EL BACKEND
      const datosParaEnviar = {
        clienteId: whatsApp.clienteId,
        whatsAppNumber: whatsApp.whatsappNumber,
        estado: whatsApp.estado || "activo",
        
        // Archivos multimedia
        imagenUrl: whatsApp.imagenUrl || "",
        imagenNombre: whatsApp.imagenNombre || "",
        videoUrl: whatsApp.videoUrl || "",
        videoNombre: whatsApp.videoNombre || "",
        audioUrl: whatsApp.audioUrl || "",
        audioNombre: whatsApp.audioNombre || "",
        
        // Textos
        mensajeBienvenida: whatsApp.mensajeBienvenida || "",
        mensajePromocional: whatsApp.mensajePromocional || "",
        
        // Permisos
        permitirImagenes: whatsApp.permitirImagenes,
        permitirVideos: whatsApp.permitirVideos,
        permitirAudios: whatsApp.permitirAudios,
        permitirTextos: whatsApp.permitirTextos,
        
        // Bot
        botActivo: whatsApp.botActivo,
        respuestaAutomatica: whatsApp.respuestaAutomatica || ""
      };

      console.log("📤 Enviando datos al backend:", datosParaEnviar);

      // Usar el endpoint UPSERT
      const url = `${API_BASE_URL}/ClienteWhatsApps/upsert`;
      
      console.log("🌐 URL:", url);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaEnviar)
      });

      const responseData = await res.json();
      console.log("📥 Respuesta del backend:", responseData);
      
      if (!res.ok) {
        throw new Error(responseData.message || 'Error al guardar');
      }

      if (!responseData.success) {
        throw new Error(responseData.message || 'Error en la operación');
      }
      
      // Mostrar mensaje de éxito
      console.log("✅ WhatsApp guardado exitosamente");
      setSuccess("✅ Configuración de WhatsApp guardada exitosamente");
      
      // Actualizar la lista después de un breve delay
      setTimeout(() => {
        if (onSave) {
          onSave();
        }
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("❌ Error al guardar WhatsApp:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const testWhatsApp = async () => {
    if (!whatsApp.id && !whatsAppData?.id) {
      setError("Primero guarda la configuración para probar el envío");
      return;
    }

    setLoading(true);
    try {
      const id = whatsApp.id || whatsAppData?.id;
      const res = await fetch(`${API_BASE_URL}/ClienteWhatsApps/${id}/enviar-mensaje`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`✅ Mensaje de prueba enviado correctamente a: ${data.numero || whatsApp.whatsappNumber}`);
        setError("");
      }
    } catch (err) {
      setError("Error al enviar prueba: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const FileUploadSection = ({ type, label, accept }) => {
    const url = whatsApp[`${type}Url`];
    const nombre = whatsApp[`${type}Nombre`];
    const Icon = type === 'imagen' ? Image : type === 'video' ? VideoFile : Audiotrack;

    return (
      <Paper sx={{ 
        p: 2, 
        border: '1px dashed', 
        borderColor: url ? COLOR_PALETTE.success : 'divider',
        borderRadius: 1.5,
        bgcolor: url ? `${COLOR_PALETTE.success}08` : 'white',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: COLOR_PALETTE.primary,
          boxShadow: '0 2px 8px rgba(37, 211, 102, 0.1)'
        }
      }}>
        <Typography variant="subtitle2" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: COLOR_PALETTE.dark,
          fontWeight: 'medium',
          fontSize: '0.85rem'
        }}>
          <Icon sx={{ color: COLOR_PALETTE.primary, fontSize: '1rem' }} /> 
          {label}
        </Typography>
        
        {url ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 1,
            p: 1,
            bgcolor: 'white',
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="body2" noWrap sx={{ 
              flexGrow: 1, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Folder sx={{ fontSize: '0.9rem', color: COLOR_PALETTE.info }} />
              {nombre}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={type === 'imagen' ? "Vista previa" : type === 'audio' ? "Reproducir" : "Ver"}>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    if (type === 'imagen') window.open(url, '_blank');
                    if (type === 'audio') new Audio(url).play();
                    if (type === 'video') window.open(url, '_blank');
                  }}
                  sx={{ color: COLOR_PALETTE.info }}
                >
                  {type === 'imagen' ? <Visibility fontSize="small" /> : 
                   type === 'audio' ? <PlayArrow fontSize="small" /> : 
                   <Visibility fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar archivo">
                <IconButton 
                  size="small" 
                  onClick={() => removeFile(type)} 
                  sx={{ color: COLOR_PALETTE.error }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ) : (
          <Button
            component="label"
            variant="outlined"
            size="small"
            startIcon={<Upload fontSize="small" />}
            fullWidth
            sx={{
              borderRadius: 1,
              fontSize: '0.8rem',
              py: 0.8,
              borderColor: 'divider',
              color: COLOR_PALETTE.dark,
              '&:hover': {
                borderColor: COLOR_PALETTE.primary,
                bgcolor: `${COLOR_PALETTE.primary}05`
              }
            }}
          >
            Subir {label}
            <input
              type="file"
              hidden
              accept={accept}
              onChange={(e) => handleFileUpload(type, e.target.files[0])}
            />
          </Button>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}>
          {type === 'imagen' ? 'Formatos: JPG, PNG, GIF (Max: 5MB)' : 
           type === 'video' ? 'Formatos: MP4, AVI, MOV (Max: 20MB)' : 
           'Formatos: MP3, WAV, OGG (Max: 10MB)'}
        </Typography>
      </Paper>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Header con diseño profesional */}
      <Paper
        sx={{
          background: `linear-gradient(90deg, ${COLOR_PALETTE.whatsappGreen}, ${COLOR_PALETTE.whatsappDarkGreen})`,
          color: 'white',
          p: 2,
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: 'white',
                color: COLOR_PALETTE.whatsappGreen,
                width: 32,
                height: 32
              }}
            >
              <WhatsApp />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {whatsAppData ? '✏️ Editar Configuración WhatsApp' : '➕ Nueva Configuración WhatsApp'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                {cliente ? `Cliente: ${cliente.nombre} ${cliente.apellido || ''}` : 'Configuración de WhatsApp Business'}
              </Typography>
            </Box>
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

      <DialogContent sx={{ p: 3, bgcolor: `${COLOR_PALETTE.dark}03`, maxHeight: '70vh', overflow: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress sx={{ color: COLOR_PALETTE.primary }} />
            <Typography sx={{ ml: 2, color: COLOR_PALETTE.dark }}>Cargando configuración...</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* Mensajes de estado */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 1,
                  fontSize: '0.85rem',
                  py: 0.5
                }}
                icon={<Error fontSize="small" />}
              >
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  borderRadius: 1,
                  fontSize: '0.85rem',
                  py: 0.5
                }}
                icon={<CheckCircle fontSize="small" />}
              >
                {success}
              </Alert>
            )}

            {/* Información del Cliente */}
            {cliente && (
              <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: 'white' }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 1, 
                  fontSize: '0.85rem', 
                  color: COLOR_PALETTE.dark, 
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  👤 Cliente Asociado
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      <strong>Nombre:</strong> {cliente.nombre} {cliente.apellido || ''}
                    </Typography>
                  </Grid>
                  {cliente.celular && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        <strong>Celular:</strong> {cliente.celular}
                      </Typography>
                    </Grid>
                  )}
                  {cliente.email && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        <strong>Email:</strong> {cliente.email}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* SECCIÓN 1: Configuración Básica */}
            <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: 'white' }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2, 
                fontSize: '0.85rem', 
                color: COLOR_PALETTE.dark, 
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Settings sx={{ fontSize: '1rem', color: COLOR_PALETTE.primary }} />
                Configuración Básica
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Número de WhatsApp *"
                    name="whatsappNumber"
                    value={whatsApp.whatsappNumber}
                    onChange={handleChange}
                    required
                    size="small"
                    placeholder="+51987654321"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone fontSize="small" sx={{ color: COLOR_PALETTE.primary }} />
                        </InputAdornment>
                      ),
                      sx: { fontSize: '0.85rem' }
                    }}
                    helperText="Incluir código de país (+51 para Perú)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.85rem' }}>Estado</InputLabel>
                    <Select
                      name="estado"
                      value={whatsApp.estado}
                      onChange={handleChange}
                      label="Estado"
                      sx={{ fontSize: '0.85rem', borderRadius: 1 }}
                    >
                      <MenuItem value="activo">
                        <Chip label="Activo" size="small" color="success" sx={{ fontSize: '0.75rem' }} />
                      </MenuItem>
                      <MenuItem value="inactivo">
                        <Chip label="Inactivo" size="small" color="error" sx={{ fontSize: '0.75rem' }} />
                      </MenuItem>
                      <MenuItem value="pendiente">
                        <Chip label="Pendiente" size="small" color="warning" sx={{ fontSize: '0.75rem' }} />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* SECCIÓN 2: Archivos Multimedia */}
            <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: 'white' }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2, 
                fontSize: '0.85rem', 
                color: COLOR_PALETTE.dark, 
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Folder sx={{ fontSize: '1rem', color: COLOR_PALETTE.primary }} />
                Archivos Multimedia
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                Sube archivos para usar en tus mensajes de WhatsApp
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FileUploadSection 
                    type="imagen" 
                    label="Imagen" 
                    accept="image/*" 
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FileUploadSection 
                    type="video" 
                    label="Video" 
                    accept="video/*" 
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FileUploadSection 
                    type="audio" 
                    label="Audio" 
                    accept="audio/*" 
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* SECCIÓN 3: Mensajes */}
            <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: 'white' }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2, 
                fontSize: '0.85rem', 
                color: COLOR_PALETTE.dark, 
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Chat sx={{ fontSize: '1rem', color: COLOR_PALETTE.primary }} />
                Mensajes Configurados
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mensaje de Bienvenida"
                    name="mensajeBienvenida"
                    value={whatsApp.mensajeBienvenida}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    size="small"
                    helperText="Se envía automáticamente cuando un cliente contacta por primera vez"
                    placeholder="Ej: ¡Hola! Bienvenido a nuestro servicio. ¿En qué podemos ayudarte?"
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
                    label="Mensaje Promocional"
                    name="mensajePromocional"
                    value={whatsApp.mensajePromocional}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    size="small"
                    helperText="Para campañas y promociones especiales"
                    placeholder="Ej: 🎉 ¡Tenemos una promoción especial para ti!"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        fontSize: '0.85rem'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* SECCIÓN 4: Configuración Avanzada */}
            <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: 'white' }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2, 
                fontSize: '0.85rem', 
                color: COLOR_PALETTE.dark, 
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Settings sx={{ fontSize: '1rem', color: COLOR_PALETTE.primary }} />
                Configuración Avanzada
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, borderRadius: 1, bgcolor: `${COLOR_PALETTE.dark}03`, border: '1px solid', borderColor: `${COLOR_PALETTE.dark}10` }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.85rem' }}>
                      📤 Tipos de Mensajes Permitidos
                    </Typography>
                    
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={whatsApp.permitirTextos}
                            onChange={handleChange}
                            name="permitirTextos"
                            size="small"
                            sx={{ 
                              color: COLOR_PALETTE.primary,
                              '&.Mui-checked': { color: COLOR_PALETTE.primary }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            Mensajes de Texto
                          </Typography>
                        }
                      />
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={whatsApp.permitirImagenes}
                            onChange={handleChange}
                            name="permitirImagenes"
                            size="small"
                            sx={{ 
                              color: COLOR_PALETTE.primary,
                              '&.Mui-checked': { color: COLOR_PALETTE.primary }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            Imágenes
                          </Typography>
                        }
                      />
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={whatsApp.permitirVideos}
                            onChange={handleChange}
                            name="permitirVideos"
                            size="small"
                            sx={{ 
                              color: COLOR_PALETTE.primary,
                              '&.Mui-checked': { color: COLOR_PALETTE.primary }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            Videos
                          </Typography>
                        }
                      />
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={whatsApp.permitirAudios}
                            onChange={handleChange}
                            name="permitirAudios"
                            size="small"
                            sx={{ 
                              color: COLOR_PALETTE.primary,
                              '&.Mui-checked': { color: COLOR_PALETTE.primary }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            Audios
                          </Typography>
                        }
                      />
                    </FormGroup>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, borderRadius: 1, bgcolor: `${COLOR_PALETTE.dark}03`, border: '1px solid', borderColor: `${COLOR_PALETTE.dark}10` }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmartToy sx={{ fontSize: '1rem' }} />
                      Respuestas Automáticas
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={whatsApp.botActivo}
                          onChange={handleChange}
                          name="botActivo"
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: COLOR_PALETTE.primary,
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: COLOR_PALETTE.primary,
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          Activar Bot Automático
                        </Typography>
                      }
                    />
                    
                    {whatsApp.botActivo && (
                      <TextField
                        fullWidth
                        label="Respuesta Automática"
                        name="respuestaAutomatica"
                        value={whatsApp.respuestaAutomatica}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        size="small"
                        sx={{ mt: 2 }}
                        helperText="Mensaje automático cuando no hay operadores disponibles"
                        placeholder="Ej: Gracias por tu mensaje. Te responderemos pronto."
                        inputProps={{ sx: { fontSize: '0.85rem' } }}
                      />
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: `1px solid ${COLOR_PALETTE.dark}10`,
        bgcolor: 'white'
      }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={testWhatsApp}
            disabled={(!whatsApp.id && !whatsAppData?.id) || saving || loading}
            startIcon={<Send />}
            sx={{ 
              borderRadius: 1,
              px: 2,
              fontSize: '0.85rem',
              borderColor: COLOR_PALETTE.primary,
              color: COLOR_PALETTE.primary,
              '&:hover': {
                borderColor: COLOR_PALETTE.whatsappDarkGreen,
                backgroundColor: `${COLOR_PALETTE.primary}08`
              }
            }}
          >
            Probar Envío
          </Button>
          
          <Stack direction="row" spacing={1}>
            <Button 
              onClick={onClose} 
              disabled={saving || loading}
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
              disabled={saving || loading || !whatsApp.whatsappNumber}
              startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Save />}
              sx={{ 
                background: `linear-gradient(90deg, ${COLOR_PALETTE.whatsappGreen}, ${COLOR_PALETTE.whatsappDarkGreen})`,
                borderRadius: 1,
                px: 3,
                fontSize: '0.85rem',
                fontWeight: 'medium',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: `${COLOR_PALETTE.dark}20`,
                  color: `${COLOR_PALETTE.dark}50`,
                  boxShadow: 'none'
                }
              }}
            >
              {saving ? 'Guardando...' : (whatsAppData ? 'Actualizar' : 'Guardar Configuración')}
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}