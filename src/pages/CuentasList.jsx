import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  CircularProgress,
  TextField,
  Grid,
  Chip,
  TablePagination,
  InputAdornment,
  Avatar,
  Alert
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ContentCopy,
  ArrowBack,
  Search,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import CuentaForm from "./CuentaForm";

// ✅ FUNCIÓN PARA OBTENER USUARIO
const getLoggedUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return {
        idusuario: userData.idusuario || userData.id || userData.userId || null,
        nombre: userData.nombre || userData.username || userData.usuario || 'Usuario',
        usuario: userData.usuario || userData.username || 'Usuario',
        rol: userData.rol || '',
        token: userData.token || null,
        ...userData
      };
    }
  } catch (error) {
    console.error("Error al leer usuario:", error);
  }
  return null;
};

export default function CuentasList() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const servicioId = queryParams.get('servicio');
  
  // ✅ OBTENER USUARIO DE localStorage
  const loggedUser = getLoggedUser();
  const userId = loggedUser ? loggedUser.idusuario : null;
  
  console.log("🔥 CuentasList - Usuario logueado:", loggedUser);
  console.log("🔥 CuentasList - servicioId:", servicioId);
  
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [filteredCuentas, setFilteredCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCuentaForm, setOpenCuentaForm] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [error, setError] = useState(null);
  
  // ✅ FUNCIÓN PARA OBTENER NOMBRE DEL SERVICIO
  const getNombreServicio = (servicioId) => {
    if (!servicioId || !servicios.length) return `ID: ${servicioId}`;
    
    const servicio = servicios.find(s => s.id == servicioId);
    return servicio ? servicio.nombre : `ID: ${servicioId}`;
  };
  
  // ✅ OBTENER TOKEN
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (token) return token;
    if (loggedUser?.token) return loggedUser.token;
    return null;
  };

  // ✅ FUNCIÓN PARA OBTENER HEADERS
  const getAuthHeaders = () => {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (userId) {
      headers["X-User-Id"] = userId;
    }
    
    return headers;
  };

  // ✅ FUNCIÓN PARA VOLVER ATRÁS
  const handleGoBack = () => {
    console.log("📍 handleGoBack ejecutándose...");
    
    // Si tenemos un servicioId, volver a ServiciosList
    if (servicioId) {
      console.log("📍 Volviendo a ServiciosList (por servicioId)");
      navigate('/ServiciosList');
      return;
    }
    
    // Por defecto, ir a Start
    console.log("📍 No hay historial, yendo a Start");
    navigate('/Start');
  };

  // ✅ CARGAR DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔥 Iniciando carga de datos...");
        setLoading(true);
        setError(null);
        
        const headers = getAuthHeaders();
        
        // 1. CARGAR SERVICIOS
        console.log("🔥 Cargando servicios...");
        const serviciosRes = await fetch(`${API_BASE_URL}/Servicios`, { headers });
        
        if (serviciosRes.status === 401) {
          navigate("/login");
          return;
        }
        
        if (!serviciosRes.ok) {
          throw new Error(`Error ${serviciosRes.status} al cargar servicios`);
        }
        
        const serviciosData = await serviciosRes.json();
        console.log("🔥 Servicios cargados:", serviciosData.length);
        setServicios(serviciosData);
        
        // 2. BUSCAR SERVICIO SELECCIONADO
        if (servicioId && serviciosData.length > 0) {
          const servicio = serviciosData.find(s => s.id == servicioId);
          console.log("🔥 Servicio encontrado:", servicio);
          setServicioSeleccionado(servicio);
        }
        
        // 3. CARGAR CUENTAS
        console.log("🔥 Cargando cuentas...");
        let cuentasData = [];
        
        if (servicioId) {
          console.log("🔥 Filtrando por servicio:", servicioId);
          const cuentasRes = await fetch(`${API_BASE_URL}/Cuentas/por-servicio/${servicioId}`, { headers });
          
          console.log("🔥 Status cuentas:", cuentasRes.status);
          
          if (cuentasRes.status === 401) {
            navigate("/login");
            return;
          }
          
          if (cuentasRes.status === 404) {
            console.log("🔥 No hay cuentas (404)");
            cuentasData = [];
          } else if (!cuentasRes.ok) {
            console.error("🔥 Error en respuesta:", cuentasRes.status);
            setError(`Error ${cuentasRes.status}: ${cuentasRes.statusText}`);
          } else {
            cuentasData = await cuentasRes.json();
            console.log("🔥 Cuentas cargadas:", cuentasData.length);
          }
        } else {
          console.log("🔥 Cargando TODAS las cuentas");
          const cuentasRes = await fetch(`${API_BASE_URL}/Cuentas`, { headers });
          
          if (cuentasRes.status === 401) {
            navigate("/login");
            return;
          }
          
          if (!cuentasRes.ok) {
            throw new Error(`Error ${cuentasRes.status} al cargar cuentas`);
          }
          
          cuentasData = await cuentasRes.json();
          console.log("🔥 Todas las cuentas:", cuentasData.length);
        }
        
        setCuentas(cuentasData);
        setFilteredCuentas(cuentasData);
        
      } catch (err) {
        console.error('🔥 Error en fetchData:', err);
        setError(err.message);
        
        if (err.message.includes("401")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (!loggedUser) {
      console.log("🔥 No hay usuario logueado - Redirigiendo al login");
      navigate("/login");
      return;
    }
    
    fetchData();
  }, [servicioId, navigate]);

  // FILTRO DE BÚSQUEDA
  useEffect(() => {
    let filtered = cuentas;
    
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(c => {
        // Buscar en usuario y perfil
        if (c.usuario?.toLowerCase().includes(lower) || 
            c.perfil?.toLowerCase().includes(lower)) {
          return true;
        }
        
        // Buscar en nombre del servicio (necesitamos hacer match con servicios)
        if (c.servicioId) {
          const nombreServicio = getNombreServicio(c.servicioId).toLowerCase();
          if (nombreServicio.includes(lower)) {
            return true;
          }
        }
        
        return false;
      });
    }
    
    setFilteredCuentas(filtered);
    setPage(0);
  }, [search, cuentas]);

  // ✅ AGREGAR CUENTA
  const handleAddCuenta = () => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }
    setEditingCuenta(null);
    setOpenCuentaForm(true);
  };

  // ✅ EDITAR CUENTA
  const handleEditCuenta = (cuenta) => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }
    setEditingCuenta(cuenta);
    setOpenCuentaForm(true);
  };

  // ✅ ELIMINAR CUENTA
  const handleDeleteCuenta = async (id) => {
    if (!window.confirm("¿Eliminar esta cuenta?")) return;
    
    if (!loggedUser) {
      navigate("/login");
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      
      const res = await fetch(`${API_BASE_URL}/Cuentas/${id}`, {
        method: "DELETE",
        headers
      });

      if (res.status === 401) {
        alert("Sesión expirada. Por favor, inicie sesión nuevamente.");
        navigate("/login");
        return;
      }
      
      if (!res.ok) throw new Error("Error al eliminar");
      
      // Recargar datos
      if (servicioId) {
        const cuentasRes = await fetch(`${API_BASE_URL}/Cuentas/por-servicio/${servicioId}`, { headers });
        const cuentasData = cuentasRes.ok ? await cuentasRes.json() : [];
        setCuentas(cuentasData);
      } else {
        const cuentasRes = await fetch(`${API_BASE_URL}/Cuentas`, { headers });
        const cuentasData = await cuentasRes.json();
        setCuentas(cuentasData);
      }
      
      alert("✅ Cuenta eliminada correctamente");
    } catch (err) {
      console.error('Error:', err);
      alert("Error al eliminar: " + err.message);
    }
  };

  // ✅ GUARDAR CUENTA
  const handleSaveCuenta = async () => {
    setOpenCuentaForm(false);
    
    if (!loggedUser) {
      navigate("/login");
      return;
    }
    
    const headers = getAuthHeaders();
    
    try {
      if (servicioId) {
        const cuentasRes = await fetch(`${API_BASE_URL}/Cuentas/por-servicio/${servicioId}`, { headers });
        const cuentasData = cuentasRes.ok ? await cuentasRes.json() : [];
        setCuentas(cuentasData);
      } else {
        const cuentasRes = await fetch(`${API_BASE_URL}/Cuentas`, { headers });
        const cuentasData = await cuentasRes.json();
        setCuentas(cuentasData);
      }
    } catch (err) {
      console.error("Error al recargar datos:", err);
    }
    
    setEditingCuenta(null);
  };

  const togglePassword = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copiarCredenciales = (usuario, contrasena) => {
    navigator.clipboard.writeText(`Usuario: ${usuario}\nContraseña: ${contrasena}`);
    alert("Credenciales copiadas");
  };

  const getEstadoColor = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const paginatedCuentas = filteredCuentas.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  // ✅ VERIFICACIÓN DE USUARIO
  if (!loggedUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Verificando sesión...
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando cuentas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2, bgcolor: '#2196f3', color: 'white' }}>
        <Box>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={handleGoBack} sx={{ color: 'white' }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                📋 {servicioSeleccionado ? `Cuentas de ${servicioSeleccionado.nombre}` : 'Todas las Cuentas'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {servicioSeleccionado ? `${filteredCuentas.length} cuentas disponibles` : `${filteredCuentas.length} cuentas en total`}
                {loggedUser && (
                  <span style={{ marginLeft: '10px', fontSize: '0.8rem' }}>
                    👤 Usuario: {loggedUser.nombre || loggedUser.usuario}
                  </span>
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Mostrar error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Controles */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={8}>
            <Button 
              variant="contained" 
              size="small"
              startIcon={<Add />}
              onClick={handleAddCuenta}
              sx={{ bgcolor: '#2196f3' }}
            >
              Nueva Cuenta
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar por usuario, perfil o servicio..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {filteredCuentas.length === 0 ? (
          <Box p={3} textAlign="center">
            <Alert severity="info">
              {servicioSeleccionado 
                ? `No hay cuentas registradas para ${servicioSeleccionado.nombre}. ¡Agrega la primera!`
                : 'No hay cuentas registradas. ¡Agrega la primera!'}
            </Alert>
            
            {servicioSeleccionado && (
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleAddCuenta}
                sx={{ mt: 2 }}
              >
                Crear primera cuenta para {servicioSeleccionado.nombre}
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>#</strong></TableCell>
                    {!servicioId && <TableCell><strong>Servicio</strong></TableCell>}
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Contraseña</strong></TableCell>
                    <TableCell><strong>Perfil/PIN</strong></TableCell>
                    <TableCell><strong>Mensaje</strong></TableCell> {/* ← NUEVA COLUMNA */}
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Vencimiento</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCuentas.map((cuenta, index) => {
                    // ✅ OBTENER NOMBRE DEL SERVICIO para esta cuenta
                    const nombreServicio = getNombreServicio(cuenta.servicioId);
                    
                    return (
                      <TableRow key={cuenta.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        
                        {!servicioId && (
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: getServiceColor(nombreServicio),
                                color: 'white',
                                fontSize: 12
                              }}>
                                {nombreServicio?.charAt(0) || 'S'}
                              </Avatar>
                              <Typography variant="body2">
                                {nombreServicio}
                              </Typography>
                            </Box>
                          </TableCell>
                        )}
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {cuenta.usuario}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {showPassword[cuenta.id] ? cuenta.contrasena : '••••••••'}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => togglePassword(cuenta.id)}
                            >
                              {showPassword[cuenta.id] ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            {cuenta.perfil && (
                              <Typography variant="body2" component="span">
                                Perfil: {cuenta.perfil}
                              </Typography>
                            )}
                            {cuenta.pin && (
                              <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                • PIN: {cuenta.pin}
                              </Typography>
                            )}
                            {!cuenta.perfil && !cuenta.pin && (
                              <Typography variant="body2" color="text.secondary">
                                Sin perfil/PIN
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                         {/* ✅ NUEVA CELDA: MENSAJE */}
      <TableCell>
        {cuenta.mensaje ? (
          <Typography 
            variant="body2" 
            sx={{ 
              maxWidth: 200,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }}
            title={cuenta.mensaje} // Tooltip con mensaje completo
          >
            {cuenta.mensaje}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Sin mensaje
          </Typography>
        )}
      </TableCell>
                        <TableCell>
                          <Chip 
                            label={cuenta.estado || 'activo'} 
                            size="small" 
                            color={getEstadoColor(cuenta.estado)}
                          />
                        </TableCell>
                        
                        <TableCell>
                          {cuenta.fechaFin ? (
                            <Box>
                              <Typography variant="body2">
                                {new Date(cuenta.fechaFin).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(cuenta.fechaFin) > new Date() ? 'Activa' : 'Vencida'}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="success.main">
                              No vence
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton 
                              size="small"
                              onClick={() => copiarCredenciales(cuenta.usuario, cuenta.contrasena)}
                              color="primary"
                              title="Copiar credenciales"
                            >
                              <ContentCopy />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={() => handleEditCuenta(cuenta)}
                              title="Editar cuenta"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={() => handleDeleteCuenta(cuenta.id)}
                              color="error"
                              title="Eliminar cuenta"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={filteredCuentas.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      {/* Formulario Cuenta */}
      {openCuentaForm && (
        <CuentaForm
          open={openCuentaForm}
          onClose={() => setOpenCuentaForm(false)}
          cuentaData={editingCuenta}
          onSave={handleSaveCuenta}
          servicios={servicios}
          servicioId={servicioId}
          loggedUser={loggedUser}
        />
      )}
    </Box>
  );
}

// Función para obtener color según servicio
function getServiceColor(serviceName) {
  const colors = {
    'netflix': '#e50914',
    'disney': '#0063e5',
    'hbo': '#3d3d3d',
    'amazon': '#00a8e1',
    'spotify': '#1db954',
    'hulu': '#3dbb3d',
    'apple': '#a2aaad',
    'youtube': '#ff0000',
    'prime': '#00a8e1',
    'paramount': '#0066cc'
  };
  
  if (!serviceName) return '#9e9e9e';
  
  const lower = serviceName.toLowerCase();
  for (const [key, color] of Object.entries(colors)) {
    if (lower.includes(key)) return color;
  }
  return '#9e9e9e';
}