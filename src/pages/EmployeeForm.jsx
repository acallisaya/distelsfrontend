import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
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
  Grid
} from "@mui/material";
import { Save, X, User, Mail, MapPin, Calendar, Phone, Users, Clock } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function EmployeeForm({ open, onClose, employeeData, onSave, loggedUser }) {
  const [formData, setFormData] = useState({
    re_id_empleado: "",
    re_nombre: "",
    re_apellido_paterno: "",
    re_apellido_materno: "",
    re_ci: "",
    re_fecha_nacimiento: "",
    re_par_genero: "",
    re_par_pais: "",
    re_par_ciudad: "",
    re_email: "",
    re_celular: "",
    re_direccion: "",
    re_fecha_ingreso: "",
    re_par_turno: "",
    re_id_usuario_registro: loggedUser || "admin",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

  const [paises, setPaises] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCloseAlert = () => setAlert(prev => ({ ...prev, open: false }));

  // Cargar parámetros
  useEffect(() => {
    const fetchParametros = async () => {
      try {
        setLoading(true);
        const [paisRes, generoRes, turnoRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Parametro/GetParametro/PAIS`),
          fetch(`${API_BASE_URL}/Parametro/GetParametro/GENERO`),
          fetch(`${API_BASE_URL}/Parametro/GetParametro/TURNO`)
        ]);

        const paisData = await paisRes.json();
        const generoData = await generoRes.json();
        const turnoData = await turnoRes.json();

        setPaises(Array.isArray(paisData) ? paisData : [paisData]);
        setGeneros(Array.isArray(generoData) ? generoData : [generoData]);
        setTurnos(Array.isArray(turnoData) ? turnoData : [turnoData]);

        // Establecer valores por defecto para nuevo registro
        if (!employeeData) {
          setFormData(prev => ({
            ...prev,
            re_par_genero: Array.isArray(generoData) && generoData.length > 0 ? generoData[0].idparametro : "",
            re_par_pais: Array.isArray(paisData) && paisData.length > 0 ? paisData[0].idparametro : "",
            re_par_turno: Array.isArray(turnoData) && turnoData.length > 0 ? turnoData[0].idparametro : ""
          }));
        }
      } catch (err) {
        console.error(err);
        setAlert({ open: true, severity: "error", message: "❌ Error al cargar parámetros" });
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchParametros();
    }
  }, [open, employeeData]);

  // Inicializar datos al abrir el formulario
  useEffect(() => {
    if (open && employeeData) {
      setFormData({
        ...employeeData,
        re_id_usuario_registro: loggedUser || "admin"
      });
    }
  }, [employeeData, loggedUser, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const upperValue = ["re_nombre","re_apellido_paterno","re_apellido_materno","re_par_ciudad","re_direccion"].includes(name)
      ? value.toUpperCase()
      : value;
    setFormData(prev => ({ ...prev, [name]: upperValue }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.re_nombre) newErrors.re_nombre = "Requerido *";
    if (!formData.re_apellido_paterno) newErrors.re_apellido_paterno = "Requerido *";
    if (!formData.re_ci) newErrors.re_ci = "Requerido *";
    if (!formData.re_fecha_nacimiento) newErrors.re_fecha_nacimiento = "Requerido *";
    if (!formData.re_par_genero) newErrors.re_par_genero = "Requerido *";
    if (!formData.re_par_pais) newErrors.re_par_pais = "Requerido *";
    if (!formData.re_par_ciudad) newErrors.re_par_ciudad = "Requerido *";
    
    // Validación de email
    if (!formData.re_email) {
      newErrors.re_email = "Requerido *";
    } else if (!emailRegex.test(formData.re_email)) {
      newErrors.re_email = "Correo electrónico inválido";
    }

    if (!formData.re_celular) newErrors.re_celular = "Requerido *";
    if (!formData.re_fecha_ingreso) newErrors.re_fecha_ingreso = "Requerido *";
    if (!formData.re_par_turno) newErrors.re_par_turno = "Requerido *";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const url = formData.re_id_empleado
        ? `${API_BASE_URL}/Empleado/UpdateEmpleado/${formData.re_id_empleado}`
        : `${API_BASE_URL}/Empleado/AddEmpleado`;

      const method = formData.re_id_empleado ? "PUT" : "POST";
      
      // Preparar datos para enviar (sin el prefijo re_)
      const bodyData = {
        nombre: formData.re_nombre,
        apellido_paterno: formData.re_apellido_paterno,
        apellido_materno: formData.re_apellido_materno,
        ci: formData.re_ci,
        fecha_nacimiento: formData.re_fecha_nacimiento,
        genero: formData.re_par_genero,
        pais: formData.re_par_pais,
        ciudad: formData.re_par_ciudad,
        email: formData.re_email,
        celular: formData.re_celular,
        direccion: formData.re_direccion,
        fecha_ingreso: formData.re_fecha_ingreso,
        turno: formData.re_par_turno,
        id_usuario_registro: formData.re_id_usuario_registro
      };

      // Para actualización, incluir el ID
      if (formData.re_id_empleado) {
        bodyData.id_empleado = formData.re_id_empleado;
      }
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      const text = await res.text();
      let savedData;
      try { savedData = JSON.parse(text); } catch { savedData = text; }

      if (!res.ok) throw new Error(savedData?.message || savedData || "Error al guardar");

      setAlert({ open: true, severity: "success", message: "✅ Empleado guardado con éxito" });

      setTimeout(() => {
        onSave(savedData);
        onClose();
      }, 400);

    } catch (err) {
      console.error(err);
      setAlert({ open: true, severity: "error", message: "❌ " + (err.message || "Error al guardar") });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000,
          p: 2
        }}
      >
        <Paper 
          sx={{ 
            width: { xs: '95%', md: '400px' },
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            textAlign: 'center',
            p: 4
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000,
          p: 2
        }}
      >
        <Paper 
          sx={{ 
            width: { xs: '95%', md: '800px' },
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: "relative"
          }}
        >
          {/* Header con gradiente */}
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 2,
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {formData.re_id_empleado ? "✏️ Editar Empleado" : "👤 Nuevo Empleado"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                    {formData.re_id_empleado ? 'Actualizar información del empleado' : 'Crear nuevo registro de empleado'}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={onClose}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <X size={20} />
              </IconButton>
            </Box>
          </Box>

          {/* Contenido del formulario */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <Grid container spacing={2}>
              
              {/* Primera fila */}
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Nombre *" 
                  name="re_nombre" 
                  value={formData.re_nombre} 
                  onChange={handleChange} 
                  error={!!errors.re_nombre}
                  helperText={errors.re_nombre}
                  fullWidth
                  size="small"
                  placeholder="Ingrese nombre"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField 
                  label="Apellido Paterno *" 
                  name="re_apellido_paterno" 
                  value={formData.re_apellido_paterno} 
                  onChange={handleChange} 
                  error={!!errors.re_apellido_paterno}
                  helperText={errors.re_apellido_paterno}
                  fullWidth
                  size="small"
                  placeholder="Ingrese apellido paterno"
                />
              </Grid>

              {/* Segunda fila */}
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Apellido Materno" 
                  name="re_apellido_materno" 
                  value={formData.re_apellido_materno} 
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="Ingrese apellido materno"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField 
                  label="CI *" 
                  name="re_ci" 
                  value={formData.re_ci} 
                  onChange={handleChange} 
                  error={!!errors.re_ci}
                  helperText={errors.re_ci}
                  fullWidth
                  size="small"
                  placeholder="Ingrese CI"
                />
              </Grid>

              {/* Tercera fila */}
              <Grid item xs={12} md={6}>
                <TextField 
                  type="date" 
                  label="Fecha Nacimiento *" 
                  name="re_fecha_nacimiento" 
                  value={formData.re_fecha_nacimiento} 
                  onChange={handleChange} 
                  error={!!errors.re_fecha_nacimiento}
                  helperText={errors.re_fecha_nacimiento}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" error={!!errors.re_par_genero}>
                  <InputLabel>Género *</InputLabel>
                  <Select 
                    name="re_par_genero" 
                    value={formData.re_par_genero || ""} 
                    onChange={handleChange} 
                    label="Género *"
                    MenuProps={{ 
                      disablePortal: true,
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          marginTop: 1,
                          '& .MuiMenuItem-root': {
                            padding: '10px 16px',
                            fontSize: '0.85rem'
                          }
                        }
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '8px 14px',
                        fontSize: '0.85rem'
                      }
                    }}
                  >
                    {generos.map(g => (
                      <MenuItem key={g.idparametro} value={g.idparametro}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '1rem' }}>👤</span>
                          <span style={{ fontSize: '0.85rem' }}>{g.descparametro}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Cuarta fila */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" error={!!errors.re_par_pais}>
                  <InputLabel>País *</InputLabel>
                  <Select 
                    name="re_par_pais" 
                    value={formData.re_par_pais || ""} 
                    onChange={handleChange}
                    label="País *"
                    MenuProps={{ 
                      disablePortal: true,
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          marginTop: 1,
                          maxHeight: 300,
                          '& .MuiMenuItem-root': {
                            padding: '10px 16px',
                            fontSize: '0.85rem'
                          }
                        }
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '8px 14px',
                        fontSize: '0.85rem'
                      }
                    }}
                  >
                    {paises.map(p => (
                      <MenuItem key={p.idparametro} value={p.idparametro}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '1rem' }}>🌎</span>
                          <span style={{ fontSize: '0.85rem' }}>{p.descparametro}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField 
                  label="Ciudad *" 
                  name="re_par_ciudad" 
                  value={formData.re_par_ciudad} 
                  onChange={handleChange} 
                  error={!!errors.re_par_ciudad}
                  helperText={errors.re_par_ciudad}
                  fullWidth
                  size="small"
                  placeholder="Ingrese ciudad"
                />
              </Grid>

              {/* Quinta fila */}
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Email *" 
                  name="re_email" 
                  value={formData.re_email} 
                  onChange={handleChange} 
                  error={!!errors.re_email}
                  helperText={errors.re_email}
                  fullWidth
                  size="small"
                  placeholder="Ingrese email"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField 
                  label="Celular *" 
                  name="re_celular" 
                  value={formData.re_celular} 
                  onChange={handleChange} 
                  error={!!errors.re_celular}
                  helperText={errors.re_celular}
                  fullWidth
                  size="small"
                  placeholder="Ingrese celular"
                />
              </Grid>

              {/* Sexta fila */}
              <Grid item xs={12}>
                <TextField 
                  label="Dirección" 
                  name="re_direccion" 
                  value={formData.re_direccion} 
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="Ingrese dirección completa"
                />
              </Grid>

              {/* Séptima fila */}
              <Grid item xs={12} md={6}>
                <TextField 
                  type="date" 
                  label="Fecha Ingreso *" 
                  name="re_fecha_ingreso" 
                  value={formData.re_fecha_ingreso} 
                  onChange={handleChange} 
                  error={!!errors.re_fecha_ingreso}
                  helperText={errors.re_fecha_ingreso}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" error={!!errors.re_par_turno}>
                  <InputLabel>Turno *</InputLabel>
                  <Select 
                    name="re_par_turno" 
                    value={formData.re_par_turno || ""} 
                    onChange={handleChange} 
                    label="Turno *"
                    MenuProps={{ 
                      disablePortal: true,
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          marginTop: 1,
                          '& .MuiMenuItem-root': {
                            padding: '10px 16px',
                            fontSize: '0.85rem'
                          }
                        }
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        padding: '8px 14px',
                        fontSize: '0.85rem'
                      }
                    }}
                  >
                    {turnos.map(t => (
                      <MenuItem key={t.idparametro} value={t.idparametro}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '1rem' }}>🕒</span>
                          <span style={{ fontSize: '0.85rem' }}>{t.descparametro}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

            </Grid>

            {/* Botones de acción */}
            <Box sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              pt: 2,
              borderTop: '1px solid #e0e0e0'
            }}>
              <Button 
                onClick={onClose}
                variant="outlined"
                color="error"
                startIcon={<X />}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  px: 2,
                  py: 0.8,
                  fontWeight: 'bold',
                  minWidth: 100
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <Save />}
                disabled={saving}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 2,
                  py: 0.8,
                  fontWeight: 'bold',
                  minWidth: 120,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}