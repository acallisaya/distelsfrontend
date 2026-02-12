import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Divider
} from "@mui/material";
import { Save, Close, CalendarToday, Visibility, VisibilityOff } from "@mui/icons-material";
import { API_BASE_URL } from "../config";

// ✅ Función para obtener usuario
const getLoggedUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error al leer usuario:", error);
  }
  return null;
};

export default function CuentaForm({ open, onClose, cuentaData, onSave, servicios, servicioId }) {
  const loggedUser = getLoggedUser();
  
  const [formData, setFormData] = useState({
    servicioId: "",
    usuario: "",
    contrasena: "",
    perfil: "",
    pin: "",
    mensaje: "", // ← AGREGAR ESTO
    estado: "activo",
    fechaInicio: "",
    fechaFin: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Inicializar formulario
  useEffect(() => {
    if (open) {
      console.log("📋 INICIANDO FORMULARIO =======================");
      console.log("📋 cuentaData:", cuentaData);
      console.log("📋 servicioId:", servicioId);
      
      if (cuentaData) {
        const formatDate = (dateString) => {
          if (!dateString) return "";
          try {
            return new Date(dateString).toISOString().split('T')[0];
          } catch {
            return "";
          }
        };

        setFormData({
          servicioId: cuentaData.servicioId || "", // ✅ SOLO servicioId
          usuario: cuentaData.usuario || "",
          contrasena: cuentaData.contrasena || "",
          perfil: cuentaData.perfil || "",
          pin: cuentaData.pin || "",
           mensaje: cuentaData.mensaje || "", // ← AGREGAR ESTO
          estado: cuentaData.estado || "activo",
          fechaInicio: formatDate(cuentaData.fechaInicio),
          fechaFin: formatDate(cuentaData.fechaFin),
        });
      } else if (servicioId) {
        setFormData(prev => ({
          ...prev,
          servicioId: servicioId,
        }));
      } else {
        setFormData({
          servicioId: "",
          usuario: "",
          contrasena: "",
          perfil: "",
          pin: "",
           mensaje: "", // ← AGREGAR ESTO
          estado: "activo",
          fechaInicio: "",
          fechaFin: "",
        });
      }
    }
  }, [open, cuentaData, servicioId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: "" }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.servicioId) newErrors.servicioId = "Seleccione un servicio";
    if (!formData.usuario.trim()) newErrors.usuario = "Usuario requerido";
    if (!formData.contrasena.trim()) newErrors.contrasena = "Contraseña requerida";
    
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      if (fin < inicio) {
        newErrors.fechaFin = "La fecha de fin no puede ser anterior a la de inicio";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ HEADERS con depuración
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    
    console.log("🔐 VERIFICANDO TOKEN =======================");
    console.log("🔐 Token en localStorage:", token ? "SÍ existe" : "NO existe");
    
    if (token) {
      console.log("🔐 Token (primeros 20 chars):", token.substring(0, 20) + "...");
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (loggedUser?.idusuario) {
      headers["X-User-Id"] = loggedUser.idusuario.toString();
    }
    
    console.log("🔐 Headers finales:", headers);
    return headers;
  };

  // ✅ ENVIAR FORMULARIO con máxima depuración
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("🚀 INICIANDO ENVÍO =======================");
    console.log("🚀 Usuario logueado:", loggedUser);
    
    if (!validate()) {
      console.error("❌ Validación fallida");
      setAlert({
        open: true,
        severity: "error",
        message: "Complete los campos requeridos"
      });
      return;
    }

    if (!loggedUser) {
      console.error("❌ No hay usuario logueado");
      setAlert({
        open: true,
        severity: "error",
        message: "Debe iniciar sesión"
      });
      return;
    }

    setSaving(true);
    try {
      // 1. Preparar datos - ✅ CORREGIDO: Solo enviar servicioId
      const cuentaToSave = {
        ...(cuentaData?.id && { id: cuentaData.id }),
        servicioId: parseInt(formData.servicioId),
        usuario: formData.usuario.trim(),
        contrasena: formData.contrasena,
        perfil: formData.perfil || null,
        pin: formData.pin || null,
        mensaje: formData.mensaje || null, // ← AGREGAR ESTO
        estado: formData.estado,
      fechaInicio: formData.fechaInicio 
        ? formatDateToUTC(formData.fechaInicio, false)
        : null,
      fechaFin: formData.fechaFin 
        ? formatDateToUTC(formData.fechaFin, true)
        : null,
      };

      console.log("📤 DATOS COMPLETOS A ENVIAR:");
      console.log(JSON.stringify(cuentaToSave, null, 2));
      console.log("📤 Tipo de servicioId:", typeof cuentaToSave.servicioId);
      console.log("📤 Valor de servicioId:", cuentaToSave.servicioId);

      // 2. Configurar petición
      const url = cuentaData?.id
        ? `${API_BASE_URL}/Cuentas/${cuentaData.id}`
        : `${API_BASE_URL}/Cuentas`;

      const method = cuentaData?.id ? "PUT" : "POST";
      
      console.log("🌐 URL de destino:", url);
      console.log("🔧 Método HTTP:", method);
      console.log("🌐 API_BASE_URL:", API_BASE_URL);

      const headers = getAuthHeaders();

      // 3. Enviar petición
      console.log("📡 ENVIANDO PETICIÓN...");
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(cuentaToSave)
      });

      const endTime = Date.now();
      console.log(`📡 Tiempo de respuesta: ${endTime - startTime}ms`);
      console.log("📥 STATUS de respuesta:", response.status, response.statusText);
      console.log("📥 URL de respuesta:", response.url);

      // 4. Procesar respuesta
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("📥 RESPUESTA CRUDA del servidor:");
        console.log(responseText);
      } catch (textError) {
        console.error("❌ Error leyendo respuesta:", textError);
      }

      let result = {};
      try {
        if (responseText) {
          result = JSON.parse(responseText);
          console.log("📥 JSON parseado:", result);
        }
      } catch (jsonError) {
        console.error("❌ Error parseando JSON:", jsonError);
        console.log("📥 Texto que falló:", responseText);
      }

      // 5. Manejar errores específicos
      if (response.status === 401) {
        console.error("🔐 ERROR 401: No autorizado");
        console.log("🔐 Headers de respuesta:", [...response.headers.entries()]);
        throw new Error("Sesión expirada. Inicie sesión nuevamente.");
      }

      if (response.status === 400) {
        console.error("❌ ERROR 400: Bad Request");
        console.log("❌ Posible problema con los datos enviados");
        console.log("❌ Datos enviados:", cuentaToSave);
        throw new Error(result.message || "Datos inválidos. Verifique los campos.");
      }

      if (response.status === 500) {
        console.error("💥 ERROR 500: Internal Server Error");
        console.log("💥 Esto es un error del backend. Revisa:");
        console.log("💥 1. Terminal donde corre tu API .NET");
        console.log("💥 2. Archivos de log del servidor");
        console.log("💥 3. Si el endpoint /api/Cuentas está activo");
        throw new Error("Error interno del servidor. Contacte al administrador.");
      }

      if (!response.ok) {
        console.error(`⚠️ ERROR ${response.status}:`, result);
        throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
      }

      // 6. Éxito
      console.log("✅ ÉXITO: Cuenta guardada correctamente");
      console.log("✅ Resultado completo:", result);

      setAlert({
        open: true,
        severity: "success",
        message: cuentaData?.id ? "✅ Cuenta actualizada" : "✅ Cuenta creada"
      });

      setTimeout(() => {
        if (onSave) onSave(result);
        onClose();
      }, 1000);

    } catch (error) {
      console.error("💥 ERROR COMPLETO en handleSubmit:");
      console.error("💥 Mensaje:", error.message);
      console.error("💥 Stack:", error.stack);
      
      setAlert({
        open: true,
        severity: "error",
        message: `❌ Error: ${error.message}`
      });
    } finally {
      setSaving(false);
      console.log("🏁 FINALIZANDO PROCESO =======================");
    }
  };
// ✅ FUNCIÓN AUXILIAR PARA CONVERTIR A UTC
function formatDateToUTC(dateString, isEndOfDay = false) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  if (isEndOfDay) {
    // Para fechaFin: 23:59:59.999 UTC
    date.setUTCHours(23, 59, 59, 999);
  } else {
    // Para fechaInicio: 00:00:00.000 UTC
    date.setUTCHours(0, 0, 0, 0);
  }
  
  return date.toISOString(); // Ej: "2024-01-15T00:00:00.000Z"
}
  const handleCloseAlert = () => setAlert(prev => ({ ...prev, open: false }));

  if (!open) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3, 
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cuentaData ? "✏️" : "👤"}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {cuentaData ? "Editar Cuenta" : "Nueva Cuenta"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {loggedUser ? `Usuario: ${loggedUser.nombre || loggedUser.usuario}` : 'No autenticado'}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={onClose}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2.5}>
              
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  size="small"
                  error={!!errors.servicioId}
                  disabled={!!servicioId}
                >
                  <InputLabel>Servicio *</InputLabel>
                  <Select
                    name="servicioId"
                    value={formData.servicioId}
                    onChange={handleChange}
                    label="Servicio *"
                  >
                    <MenuItem value="">
                      <em>Seleccionar servicio</em>
                    </MenuItem>
                    {servicios && servicios.map(servicio => (
                      <MenuItem key={servicio.id} value={servicio.id}>
                        {servicio.nombre} - {servicio.plan}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.servicioId && (
                    <FormHelperText error>{errors.servicioId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Usuario *"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  error={!!errors.usuario}
                  helperText={errors.usuario}
                  fullWidth
                  size="small"
                  placeholder="usuario@ejemplo.com"
                  autoComplete="off"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Contraseña *"
                  name="contrasena"
                  type={showPassword ? "text" : "password"}
                  value={formData.contrasena}
                  onChange={handleChange}
                  error={!!errors.contrasena}
                  helperText={errors.contrasena}
                  fullWidth
                  size="small"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Perfil"
                  name="perfil"
                  value={formData.perfil}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="Premium, Estándar..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="PIN"
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="1234"
                />
              </Grid>
{/* ✅ NUEVO: CAMPO MENSAJE */}
              <Grid item xs={12}>
                <TextField
                  label="Mensaje/Notas"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Mensaje adicional o notas sobre la cuenta..."
                  helperText="Opcional - Puede incluir instrucciones, observaciones, etc."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    label="Estado"
                  >
                    <MenuItem value="activo">Activo</MenuItem>
                    <MenuItem value="inactivo">Inactivo</MenuItem>
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="vencido">Vencido</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Fecha Inicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  type="date"
                  label="Fecha Fin"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  error={!!errors.fechaFin}
                  helperText={errors.fechaFin}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

            </Grid>

            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="caption" color="text.secondary">
                <strong>ℹ️ Información:</strong> Los campos Serie, Lote y Código se generan automáticamente en el servidor.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="caption" color="text.secondary">
            * Campos requeridos
          </Typography>
          
          <Box display="flex" gap={2}>
            <Button 
              onClick={onClose}
              variant="outlined"
              color="inherit"
              disabled={saving}
              sx={{ minWidth: 100 }}
            >
              Cancelar
            </Button>
            
            <Button 
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
              sx={{ minWidth: 120 }}
            >
              {saving ? "Guardando..." : (cuentaData ? "Actualizar" : "Guardar")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ 
            borderRadius: 1,
            fontWeight: 'medium'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}