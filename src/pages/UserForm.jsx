import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
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
import { Save, X, User } from "lucide-react";

export default function UserForm({ open, onClose, userData, onSave, loggedUser }) {
  const [formData, setFormData] = useState({
    idusuario: 0,
    idempleado: "",
    codusuario: "",
    password: "",
    tiporol: "",
    estado: true,
    codusuarioreg: loggedUser?.codusuario || loggedUser || "admin"
  });
  const [originalPassword, setOriginalPassword] = useState("");
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });
  const [triedSubmit, setTriedSubmit] = useState(false);

  const handleCloseAlert = () => setAlert(prev => ({ ...prev, open: false }));

  // ⚡ Cargar roles TIPOROL
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        console.log("🔍 Iniciando carga de roles...");
        const res = await fetch(`${API_BASE_URL}/Parametro/GetParametro/TIPOROL`);
        if (!res.ok) throw new Error("No se pudo cargar TIPOROL");
        const data = await res.json();
        console.log("📋 Datos crudos de roles:", data);
        
        const rolesList = Array.isArray(data) ? data.filter(r => r.estado === "1" || r.estado === 1) : [];
        console.log("👥 Roles filtrados (activos):", rolesList);
        
        setRoles(rolesList);
        
        // Si es un nuevo usuario y hay roles disponibles, seleccionar el primer rol
        if (!userData?.idusuario && rolesList.length > 0 && open) {
          console.log("🆕 Es nuevo usuario, seleccionando primer rol:", rolesList[0]);
          const defaultRol = rolesList[0].idparametro;
          
          setFormData(prev => ({
            ...prev,
            tiporol: defaultRol
          }));
          console.log("✅ Rol por defecto establecido:", defaultRol);
        }
      } catch (err) {
        console.error("❌ Error cargando roles:", err);
        setRoles([]);
      } finally {
        setLoadingRoles(false);
        console.log("🏁 Carga de roles finalizada");
      }
    };
    
    if (open) {
      console.log("🚀 Formulario abierto, cargando roles...");
      fetchRoles();
    }
  }, [open, userData]);

  // ⚡ Inicializar formData al abrir el formulario
  useEffect(() => {
    if (open) {
      console.log("📝 Inicializando formData...");
      console.log("👤 userData:", userData);
      console.log("🎯 Roles disponibles:", roles);
      
      const isNewUser = !userData?.idusuario;
      console.log("🆕 Es nuevo usuario?", isNewUser);
      
      // Solo establecer rol por defecto si es nuevo usuario y no hay rol en userData
      const defaultRol = (isNewUser && roles.length > 0 && !userData?.tiporol && !userData?.rol) 
        ? roles[0].idparametro 
        : userData?.tiporol || userData?.rol || "";
      
      console.log("🎯 Rol a establecer:", defaultRol);
      
      setFormData({
        idusuario: userData?.idusuario ?? 0,
        idempleado: userData?.idempleado ?? "",
        codusuario: userData?.codusuario ?? "",
        password: userData?.password ?? "",
        tiporol: defaultRol,
        estado: userData?.estado ?? true,
        codusuarioreg: loggedUser?.codusuario || loggedUser || "admin"
      });
      
      console.log("✅ formData inicializado:", {
        ...formData,
        tiporol: defaultRol
      });
      
      setOriginalPassword(userData?.password ?? "");
      setTriedSubmit(false);
    }
  }, [userData, loggedUser, open, roles]); // Agregamos roles como dependencia

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Cambio en campo ${name}:`, value);
    
    if (name === "estado") {
      setFormData(prev => ({ ...prev, [name]: value === "true" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ⚡ Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTriedSubmit(true);
    
    const isEdit = formData.idusuario !== 0;
    
    console.log("📤 Enviando formulario...");
    console.log("📊 formData:", formData);
    console.log("✏️ Es edición?", isEdit);

    // Validaciones básicas
    if (!formData.codusuario) {
      console.log("❌ Falta código de usuario");
      setAlert({ open: true, severity: "error", message: "❌ Código de usuario obligatorio" });
      return;
    }
    if (!formData.tiporol) {
      console.log("❌ Falta seleccionar rol");
      setAlert({ open: true, severity: "error", message: "❌ Debe seleccionar un rol" });
      return;
    }
    if (!isEdit && !formData.password) {
      console.log("❌ Falta contraseña para nuevo usuario");
      setAlert({ open: true, severity: "error", message: "❌ Contraseña obligatoria para nuevo usuario" });
      return;
    }

    setSaving(true);
    try {
      const bodyData = {
        idusuario: String(formData.idusuario),
        idempleado: String(formData.idempleado),
        codusuario: formData.codusuario,
        tiporol: String(formData.tiporol),
        estado: formData.estado,
        codusuarioreg: formData.codusuarioreg,
        password: formData.password && formData.password.trim() !== "" ? formData.password : originalPassword
      };

      const url = isEdit
        ? `${API_BASE_URL}/Usuarios/UpdateUsuario/${formData.idusuario}`
        : `${API_BASE_URL}/Usuarios/AddUsuario`;
      const method = isEdit ? "PUT" : "POST";

      console.log("🌐 Enviando a API:", { url, method, bodyData });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      const text = await res.text();
      let savedData;
      try { savedData = JSON.parse(text); } catch { savedData = text; }

      if (!res.ok) throw new Error(savedData?.message || savedData || "Error al guardar usuario");

      console.log("✅ Usuario guardado exitosamente");
      setAlert({ open: true, severity: "success", message: "✅ Usuario guardado con éxito" });

      setTimeout(() => {
        onSave(savedData);
        onClose();
      }, 400);

    } catch (err) {
      console.error("❌ Error al guardar usuario:", err);
      setAlert({ open: true, severity: "error", message: "❌ " + (err.message || "Error al guardar") });
    } finally {
      setSaving(false);
    }
  };

  // Agregamos un efecto adicional para depurar el estado actual
  useEffect(() => {
    if (open) {
      console.log("🔍 Estado actual - formData.tiporol:", formData.tiporol);
      console.log("🔍 Estado actual - roles:", roles);
      console.log("🔍 Estado actual - loadingRoles:", loadingRoles);
    }
  }, [formData.tiporol, roles, loadingRoles, open]);

  if (!open) return null;

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
            width: { xs: '95%', md: '750px' },
            maxHeight: "85vh",
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
                    {formData.idusuario !== 0 ? "✏️ Editar Usuario" : "👤 Nuevo Usuario"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                    {formData.idusuario !== 0 ? 'Actualizar información del usuario' : 'Crear nueva cuenta de usuario'}
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
              <Grid item xs={12} md={6}>
                <TextField 
                  label="ID Empleado" 
                  name="idempleado" 
                  value={formData.idempleado} 
                  InputProps={{ readOnly: true }} 
                  fullWidth
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Código Usuario *" 
                  name="codusuario" 
                  value={formData.codusuario} 
                  onChange={handleChange} 
                  fullWidth
                  size="small"
                  placeholder="Ingrese código de usuario"
                  error={triedSubmit && !formData.codusuario}
                  helperText={triedSubmit && !formData.codusuario ? "Campo requerido" : ""}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label={formData.idusuario !== 0 ? "Nueva Contraseña (opcional)" : "Contraseña *"}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder={formData.idusuario !== 0 ? "Dejar vacío para mantener actual" : "Ingrese contraseña"}
                  error={triedSubmit && !formData.idusuario && !formData.password}
                  helperText={triedSubmit && !formData.idusuario && !formData.password ? "Campo requerido" : ""}
                />
              </Grid>

              {/* Select de Rol - CON SELECCIÓN AUTOMÁTICA MEJORADA */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="label-rol">Rol *</InputLabel>
                  <Select
                    labelId="label-rol"
                    name="tiporol"
                    value={formData.tiporol || ""}
                    onChange={handleChange}
                    label="Rol *"
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
                    renderValue={(selected) => {
                      console.log("🎨 Renderizando valor seleccionado:", selected);
                      if (!selected) {
                        return <em>Seleccione un rol</em>;
                      }
                      const selectedRole = roles.find(r => r.idparametro === selected);
                      console.log("🔍 Rol encontrado para render:", selectedRole);
                      return selectedRole ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>👤</span>
                          <span>{selectedRole.descparametro}</span>
                        </Box>
                      ) : selected;
                    }}
                  >
                    {loadingRoles ? (
                      <MenuItem disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={14} />
                          <span style={{ fontSize: '0.85rem' }}>Cargando roles...</span>
                        </Box>
                      </MenuItem>
                    ) : (
                      roles.map(r => (
                        <MenuItem key={r.idparametro} value={r.idparametro}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: '1rem' }}>👤</span>
                            <span style={{ fontSize: '0.85rem' }}>{r.descparametro}</span>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Select de Estado */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="label-estado">Estado</InputLabel>
                  <Select
                    labelId="label-estado"
                    name="estado"
                    value={formData.estado ? "true" : "false"}
                    onChange={handleChange}
                    label="Estado"
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
                    <MenuItem value="true">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ color: '#4caf50', fontSize: '1rem' }}>🟢</span>
                        <span style={{ fontSize: '0.85rem' }}>Activo</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="false">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ color: '#f44336', fontSize: '1rem' }}>🔴</span>
                        <span style={{ fontSize: '0.85rem' }}>Inactivo</span>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField 
                  label="Registrado por" 
                  name="codusuarioreg" 
                  value={formData.codusuarioreg} 
                  InputProps={{ readOnly: true }} 
                  fullWidth
                  size="small"
                />
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
                startIcon={<Save />}
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
                {saving ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={14} color="inherit" />
                    Guardando...
                  </Box>
                ) : (
                  "Guardar"
                )}
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