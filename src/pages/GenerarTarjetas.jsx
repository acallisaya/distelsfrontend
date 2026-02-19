import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Stepper, Step, StepLabel, TextField, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress, Snackbar,
  Chip, Divider, InputAdornment, Checkbox,
  FormControlLabel, FormGroup, LinearProgress, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import {
  AutoAwesome, AccountCircle, Visibility, VisibilityOff,
  Close, Image, Download,
  Print, ContentCopy, Search, CheckCircle,
  ArrowBack, ArrowForward, RocketLaunch,
  NavigateNext, Warning, Person, VerifiedUser
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function GenerarTarjetasAuto() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Datos
  const [servicios, setServicios] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [tarjetasGeneradas, setTarjetasGeneradas] = useState([]);
  const [detallesGeneracion, setDetallesGeneracion] = useState([]);
  const [cuentasInfo, setCuentasInfo] = useState({
    total: 0,
    disponibles: 0,
    ocupadas: 0
  });

  // Formulario
  const [formData, setFormData] = useState({
    idServicio: '',
    idPlan: '',
    cantidad: 10,
    prefijoLote: '',
    idVendedor: '',
    incluirQR: true,
    imprimirInstrucciones: true,
    asignacionAutomatica: true
  });

  // Estado para imagen y PDF
  const [imagenLote, setImagenLote] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenSubida, setImagenSubida] = useState(false);

  // Estado general
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingImagen, setLoadingImagen] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingVendedores, setLoadingVendedores] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const [detallesDialog, setDetallesDialog] = useState(false);

  // ========== FUNCIONES DE CARGA CON HEADERS CORREGIDOS ==========
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true' // 👈 HEADER CLAVE PARA NGROK
    };
  };

  const fetchServicios = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Servicios`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setServicios(data);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
      showSnackbar('Error cargando servicios', 'error');
    }
  };

  const fetchVendedores = async () => {
    try {
      setLoadingVendedores(true);
      const res = await fetch(`${API_BASE_URL}/Clientes/tipo/VENDEDOR`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const responseData = await res.json();
      console.log('✅ Vendedores recibidos:', responseData);
      
      // La API devuelve { success: true, data: [...] }
      if (responseData.success && Array.isArray(responseData.data)) {
        setVendedores(responseData.data);
      } else if (Array.isArray(responseData)) {
        setVendedores(responseData);
      } else {
        console.warn('Formato de respuesta inesperado:', responseData);
        setVendedores([]);
      }
    } catch (err) {
      console.error('❌ Error cargando vendedores:', err);
      showSnackbar('Error cargando vendedores: ' + err.message, 'error');
      setVendedores([]);
    } finally {
      setLoadingVendedores(false);
    }
  };

  const fetchPlanesPorServicio = useCallback(async (idServicio) => {
    try {
      const res = await fetch(`${API_BASE_URL}/Servicios/${idServicio}/planes`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPlanes(data);
      } else {
        setPlanes([]);
      }
    } catch (error) {
      console.error('Error cargando planes:', error);
      showSnackbar('Error cargando planes', 'error');
      setPlanes([]);
    }
  }, []);

  const fetchEstadisticasCuentas = useCallback(async (idServicio) => {
    try {
      setLoadingInfo(true);
      const res = await fetch(`${API_BASE_URL}/Cuentas/estadisticas`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const servicioStats = data.data?.estadisticasPorServicio
          ?.find(s => s.ServicioId === parseInt(idServicio));
        
        if (servicioStats) {
          setCuentasInfo({
            total: data.data?.totalCuentas || 0,
            disponibles: servicioStats.Estado === 'DISPONIBLE' ? servicioStats.Cantidad : 0,
            ocupadas: servicioStats.Estado === 'OCUPADA' ? servicioStats.Cantidad : 0
          });
        }
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  // ========== useEffect CORREGIDOS ==========
  // ✅ Cargar servicios y vendedores (solo una vez)
  useEffect(() => {
    fetchServicios();
    fetchVendedores();
  }, []);

  // ✅ Cargar planes cuando se selecciona servicio
  useEffect(() => {
    if (formData.idServicio) {
      fetchPlanesPorServicio(formData.idServicio);
    } else {
      setPlanes([]);
      setFormData(prev => ({ ...prev, idPlan: '' }));
    }
  }, [formData.idServicio, fetchPlanesPorServicio]);

  // ✅ Cargar información de cuentas cuando se selecciona servicio
  useEffect(() => {
    if (formData.idServicio) {
      fetchEstadisticasCuentas(formData.idServicio);
    }
  }, [formData.idServicio, fetchEstadisticasCuentas]);

  // ✅ Actualizar prefijo automático
  useEffect(() => {
    if (formData.idServicio && servicios.length > 0) {
      const servicio = servicios.find(s => s.idServicio === parseInt(formData.idServicio));
      if (servicio) {
        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const hora = new Date().getTime().toString().slice(-4);
        setFormData(prev => ({
          ...prev,
          prefijoLote: `${servicio.codigo}-${fecha}-${hora}`
        }));
      }
    }
  }, [formData.idServicio, servicios]);

  // ========== FUNCIONES AUXILIARES ==========
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.idServicio) {
      showSnackbar('Seleccione un servicio', 'error');
      return;
    }
    
    if (activeStep === 1 && !formData.idPlan) {
      showSnackbar('Seleccione un plan', 'error');
      return;
    }
    
    if (activeStep === 2 && !formData.idVendedor) {
      showSnackbar('Seleccione un vendedor', 'error');
      return;
    }
    
    setCompletedSteps([...completedSteps, activeStep]);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleGenerarTarjetas = async () => {
    if (!formData.idPlan || formData.cantidad < 1) {
      showSnackbar('Complete todos los campos', 'error');
      return;
    }

    if (!formData.idVendedor) {
      showSnackbar('Seleccione un vendedor', 'error');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        idPlan: parseInt(formData.idPlan),
        cantidad: parseInt(formData.cantidad),
        prefijoLote: formData.prefijoLote,
        asignacionAutomatica: true,
        idVendedor: parseInt(formData.idVendedor)
      };

      console.log('Enviando datos:', requestData);

      const res = await fetch(`${API_BASE_URL}/Tarjetas/generar-automatico`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData)
      });

      const result = await res.json();
      
      if (result.success) {
        showSnackbar(`✅ ${result.tarjetasGeneradas || result.cantidad || result.data?.length || 0} tarjetas generadas`, 'success');
        
        setDetallesGeneracion(result.detalles || result.data || []);
        
        setTimeout(() => {
          if (result.lote) {
            fetchTarjetasGeneradas(result.lote);
          }
        }, 1000);
        
        setCompletedSteps([...completedSteps, activeStep]);
        setActiveStep(4);
      } else {
        showSnackbar(result.message || 'Error al generar', 'error');
      }
    } catch (err) {
      showSnackbar('Error en la conexión: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTarjetasGeneradas = async (lote) => {
    try {
      const res = await fetch(`${API_BASE_URL}/Tarjetas/lote/${lote}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setTarjetasGeneradas(data.data || []);
      }
    } catch (err) {
      console.error('Error obteniendo tarjetas:', err);
    }
  };

  const getPlanSeleccionado = () => {
    return planes.find(p => p.idPlan === parseInt(formData.idPlan));
  };

  const getServicioSeleccionado = () => {
    return servicios.find(s => s.idServicio === parseInt(formData.idServicio));
  };

  const getVendedorSeleccionado = () => {
    if (!formData.idVendedor) return null;
    return vendedores.find(v => v.id === parseInt(formData.idVendedor));
  };

  const requierePerfil = () => {
    const servicio = getServicioSeleccionado();
    return servicio?.maxPerfiles > 0;
  };

  const requierePIN = () => {
    const servicio = getServicioSeleccionado();
    return servicio?.maxPerfiles > 0;
  };

  const formatCurrency = (amount) => {
    return `Bs. ${parseFloat(amount).toFixed(2)}`;
  };

  const subirImagenLote = async () => {
    if (!imagenLote) {
      showSnackbar('Selecciona una imagen primero', 'warning');
      return;
    }

    const datos = detallesGeneracion.length > 0 ? detallesGeneracion : tarjetasGeneradas;
    if (datos.length === 0) {
      showSnackbar('No hay tarjetas generadas', 'error');
      return;
    }

    const lote = datos[0]?.lote || datos[0]?.Lote;
    if (!lote) {
      showSnackbar('No se encontró el lote', 'error');
      return;
    }

    const formDataImg = new FormData();
    formDataImg.append('imagen', imagenLote);
    formDataImg.append('lote', lote);

    const token = localStorage.getItem('token');
    setLoadingImagen(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Tarjetas/subir-imagen-lote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: formDataImg
      });

      const result = await res.json();
      if (result.success) {
        showSnackbar('✅ Imagen subida exitosamente', 'success');
        setImagenSubida(true);
      } else {
        showSnackbar(result.message || 'Error al subir imagen', 'error');
      }
    } catch (err) {
      showSnackbar('Error de conexión: ' + err.message, 'error');
    } finally {
      setLoadingImagen(false);
    }
  };

  const imprimirPDFConImagen = async () => {
    const datos = detallesGeneracion.length > 0 ? detallesGeneracion : tarjetasGeneradas;
    if (datos.length === 0) {
      showSnackbar('No hay tarjetas para imprimir', 'warning');
      return;
    }

    const lote = datos[0]?.lote || datos[0]?.Lote;
    const token = localStorage.getItem('token');
    setLoadingPDF(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Tarjetas/imprimir-con-imagen/${lote}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarjetas_${lote}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showSnackbar('PDF generado exitosamente', 'success');
      } else {
        showSnackbar('Error generando PDF', 'error');
      }
    } catch (err) {
      showSnackbar('Error imprimiendo: ' + err.message, 'error');
    } finally {
      setLoadingPDF(false);
    }
  };

  const descargarCSVCompleto = async () => {
    try {
      const datos = detallesGeneracion.length > 0 ? detallesGeneracion : tarjetasGeneradas;
      if (!datos || datos.length === 0) {
        showSnackbar('No hay datos para exportar', 'warning');
        return;
      }

      const lote = datos[0]?.lote || datos[0]?.Lote;
      if (!lote) {
        showSnackbar('No hay lote disponible para exportar', 'warning');
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/Tarjetas/lote/${lote}/csv`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarjetas_${lote}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showSnackbar('CSV descargado exitosamente', 'success');
      } else {
        generarCSVManual();
      }
    } catch {
      generarCSVManual();
    }
  };

  const generarCSVManual = () => {
    const datos = detallesGeneracion.length > 0 ? detallesGeneracion : 
                  (tarjetasGeneradas.length > 0 ? tarjetasGeneradas : []);
    
    if (datos.length === 0) {
      showSnackbar('No hay datos para exportar', 'warning');
      return;
    }
    
    const headers = ['N°', 'Código', 'Serie', 'Lote', 'Usuario', 'Contraseña', 'Perfil', 'PIN', 'Estado', 'Fecha Vencimiento', 'Vendedor'];
    const rows = datos.map((item, index) => [
      index + 1,
      item.codigo || item.Codigo || '',
      item.serie || item.Serie || '',
      item.lote || item.Lote || '',
      item.usuario || item.Usuario || item.perfil?.cuenta?.usuario || '',
      item.contrasena || item.Contrasena || item.perfil?.cuenta?.contrasena || '',
      item.perfil || item.Perfil || item.perfil?.nombre || '',
      item.pin || item.Pin || item.perfil?.pin || '',
      item.estado || item.Estado || 'DISPONIBLE',
      item.fechaVencimiento || item.FechaVencimiento || '',
      item.vendedor?.nombre || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarjetas_${datos[0]?.lote || datos[0]?.Lote || 'generadas'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSnackbar('CSV generado localmente', 'info');
  };

  const copiarCredenciales = (index) => {
    const datos = detallesGeneracion.length > 0 ? detallesGeneracion : tarjetasGeneradas;
    if (!datos || !datos[index]) return;
    
    const item = datos[index];
    const texto = `Servicio: ${getServicioSeleccionado()?.nombre}\n` +
                  `Código: ${item.codigo || item.Codigo || ''}\n` +
                  `Usuario: ${item.usuario || item.Usuario || item.perfil?.cuenta?.usuario || ''}\n` +
                  `Contraseña: ${item.contrasena || item.Contrasena || item.perfil?.cuenta?.contrasena || ''}\n` +
                  `Perfil: ${item.perfil || item.Perfil || item.perfil?.nombre || ''}\n` +
                  `PIN: ${item.pin || item.Pin || item.perfil?.pin || 'N/A'}\n` +
                  `Vence: ${item.fechaVencimiento || item.FechaVencimiento || ''}\n` +
                  `Vendedor: ${item.vendedor?.nombre || 'No asignado'}`;
    
    navigator.clipboard.writeText(texto)
      .then(() => showSnackbar('Credenciales copiadas', 'info'))
      .catch(() => showSnackbar('Error al copiar', 'error'));
  };

  const steps = [
    { label: 'Servicio', description: 'Elige el servicio' },
    { label: 'Plan', description: 'Selecciona duración y precio' },
    { label: 'Configuración', description: 'Define cantidad y vendedor' },
    { label: 'Generar', description: 'Proceso automático' },
    { label: 'Resultados', description: 'Ver tarjetas generadas' }
  ];

  const renderSelectorVendedor = () => {
    if (loadingVendedores) {
      return (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Cargando vendedores...</Typography>
          </Box>
        </Grid>
      );
    }

    if (vendedores.length === 0) {
      return (
        <Grid item xs={12}>
          <Alert 
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => navigate('/ClientesListPro')}
                endIcon={<NavigateNext />}
              >
                Registrar Vendedor
              </Button>
            }
          >
            <Typography variant="body2" fontWeight="bold">
              ⚠️ Vendedor Requerido
            </Typography>
            <Typography variant="body2">
              Debes registrar al menos un vendedor para continuar
            </Typography>
          </Alert>
        </Grid>
      );
    }

    return (
      <Grid item xs={12}>
        <FormControl fullWidth size="small" required error={!formData.idVendedor && activeStep >= 2}>
          <InputLabel>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1, fontSize: 18 }} />
              Asignar a Vendedor *
            </Box>
          </InputLabel>
          <Select
            name="idVendedor"
            value={formData.idVendedor}
            onChange={handleChange}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1, fontSize: 18 }} />
                Asignar a Vendedor *
              </Box>
            }
            renderValue={(selected) => {
              if (!selected) {
                return <em>Seleccione un vendedor</em>;
              }
              const vendedor = vendedores.find(v => v.id === parseInt(selected));
              return vendedor ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountCircle sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">{vendedor.nombre}</Typography>
                </Box>
              ) : selected;
            }}
          >
            {vendedores.map(vendedor => (
              <MenuItem key={vendedor.id} value={vendedor.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AccountCircle sx={{ mr: 1.5, color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {vendedor.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {vendedor.email}
                    </Typography>
                  </Box>
                  {vendedor.celular && (
                    <Chip 
                      label={vendedor.celular}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
          {!formData.idVendedor && activeStep >= 2 && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
              Este campo es requerido
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Las tarjetas generadas serán asignadas automáticamente a este vendedor
          </Typography>
        </FormControl>
      </Grid>
    );
  };

  const getStepContent = (step) => {
    const servicioSeleccionado = getServicioSeleccionado();
    const requierePerfilServicio = requierePerfil();
    const requierePINServicio = requierePIN();
    
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Seleccionar Servicio
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Elige el servicio para el cual generarás tarjetas
            </Typography>
            
            {loadingInfo ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {servicios.map(servicio => (
                  <Grid item xs={12} sm={6} md={4} key={servicio.idServicio}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: formData.idServicio === servicio.idServicio ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          transform: 'translateY(-2px)', 
                          boxShadow: 3,
                          borderColor: '#1976d2'
                        }
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, idServicio: servicio.idServicio }))}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ 
                          width: 56, 
                          height: 56, 
                          bgcolor: formData.idServicio === servicio.idServicio ? '#1976d2' : '#f5f5f5', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                          color: formData.idServicio === servicio.idServicio ? 'white' : '#666',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}>
                          {servicio.nombre.charAt(0)}
                        </Box>
                        
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                          {servicio.nombre}
                        </Typography>
                        
                        <Chip 
                          label={servicio.codigo}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        
                        <Box sx={{ textAlign: 'left', mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            <strong>Configuración:</strong>
                          </Typography>
                          <Typography variant="caption" display="block">
                            • {servicio.maxPerfiles > 0 ? `${servicio.maxPerfiles} perfil${servicio.maxPerfiles >= 1 ? 'es' : ''}` : 'Sin perfiles'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            • {servicio.maxPerfiles > 0 ?  'Con PIN' : 'Sin PIN' }
                          </Typography>
                          <Typography variant="caption" display="block">
                            • {servicio.asignacionAutomatica ? 'Auto-asignación' : 'Asignación manual'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Elegir Plan
            </Typography>
            {servicioSeleccionado && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Servicio seleccionado: <strong>{servicioSeleccionado.nombre}</strong>
                  {servicioSeleccionado.maxPerfiles === 0 ? (
                    <Chip 
                      label="Sin perfiles ni PIN" 
                      size="small" 
                      color="info" 
                      sx={{ ml: 2 }}
                    />
                  ) : servicioSeleccionado.maxPerfiles > 0  ? (
                    <Chip 
                      label="Con perfiles y PIN"
                      size="small" 
                      color="warning" 
                      sx={{ ml: 2 }}
                    />
                  ) : (
                    <Chip 
                      label="Con perfiles y PIN" 
                      size="small" 
                      color="success" 
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Selecciona el plan con su duración y precio
            </Typography>
            
            {planes.length === 0 ? (
              <Alert severity="info">
                Selecciona primero un servicio para ver sus planes disponibles.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {planes.map(plan => (
                  <Grid item xs={12} md={6} key={plan.idPlan}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: formData.idPlan === plan.idPlan ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          transform: 'translateY(-2px)', 
                          boxShadow: 3 
                        }
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, idPlan: plan.idPlan }))}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {plan.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {plan.duracionDias} días de servicio
                            </Typography>
                          </Box>
                          <Chip 
                            label={`${plan.duracionDias} días`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Precio Compra
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {formatCurrency(plan.precioCompra)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Precio Venta
                              </Typography>
                              <Typography variant="body1" fontWeight="medium" color="success.main">
                                {formatCurrency(plan.precioVenta)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            <strong>Ganancia por tarjeta:</strong>
                          </Typography>
                          <Typography variant="body1" color="#28a745" fontWeight="bold">
                            {formatCurrency(plan.precioVenta - plan.precioCompra)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 2:
        const vendedorSeleccionado = getVendedorSeleccionado();
        const planSeleccionado = getPlanSeleccionado();
        
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Configurar Generación
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Define los parámetros para la generación automática
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cantidad de Tarjetas"
                  name="cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={handleChange}
                  size="small"
                  required
                  InputProps={{ 
                    inputProps: { min: 1, max: 1000 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption">tarjetas</Typography>
                      </InputAdornment>
                    )
                  }}
                  helperText="Máximo 1000 tarjetas por lote"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prefijo del Lote"
                  name="prefijoLote"
                  value={formData.prefijoLote}
                  onChange={handleChange}
                  size="small"
                  helperText="Identificador único para el lote"
                />
              </Grid>
              
              {renderSelectorVendedor()}
              
              {vendedorSeleccionado && (
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom color="success.main">
                        <AccountCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Vendedor Asignado
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>Nombre:</strong> {vendedorSeleccionado.nombre}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>Email:</strong> {vendedorSeleccionado.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>Teléfono:</strong> {vendedorSeleccionado.celular || 'No especificado'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Alert 
                  severity={requierePerfilServicio ? "info" : "warning"} 
                  icon={<Warning />}
                >
                  <Typography variant="body2" fontWeight="bold">
                    Configuración del Servicio:
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Perfiles:</strong> {requierePerfilServicio ? 
                      `Sí (${servicioSeleccionado?.maxPerfiles} por cuenta)` : 
                      'No (Cuenta simple)'}
                  </Typography>
                  <Typography variant="body2">
                    • <strong>PIN:</strong> {requierePerfilServicio ? 
                      (requierePINServicio ? 'Sí (4 dígitos)' : 'No') : 
                      'No (Sin perfiles)'}
                  </Typography>
                  <Typography variant="body2">
                    • Las tarjetas se asignarán automáticamente al vendedor seleccionado
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.incluirQR}
                        onChange={handleChange}
                        name="incluirQR"
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VerifiedUser sx={{ mr: 1, fontSize: 18 }} />
                        Incluir código QR en las tarjetas
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.imprimirInstrucciones}
                        onChange={handleChange}
                        name="imprimirInstrucciones"
                        size="small"
                      />
                    }
                    label="Incluir instrucciones de uso en el PDF"
                  />
                </FormGroup>
              </Grid>
              
              {planSeleccionado && (
                <Grid item xs={12}>
                  <Card sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Resumen Financiero
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Inversión Total
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {formatCurrency(planSeleccionado.precioCompra * formData.cantidad)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Ingreso Total
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="success.main">
                              {formatCurrency(planSeleccionado.precioVenta * formData.cantidad)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Ganancia Total
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="#28a745">
                              {formatCurrency((planSeleccionado.precioVenta - planSeleccionado.precioCompra) * formData.cantidad)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 3:
        const vendedorInfo = getVendedorSeleccionado();
        
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Confirmar Generación
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Revisa los detalles antes de iniciar la generación automática
            </Typography>
            
            <Card sx={{ maxWidth: 600, mx: 'auto', p: 4, border: '1px solid #e0e0e0' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: loading ? '#f5f5f5' : '#1976d2', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: 'white',
                fontSize: '2rem'
              }}>
                {loading ? <CircularProgress size={50} color="inherit" /> : <RocketLaunch />}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {loading ? 'Procesando...' : 'Listo para Generar'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Se crearán {formData.cantidad} tarjetas automáticamente
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Detalles de la generación:
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Servicio:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {servicioSeleccionado?.nombre}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Plan:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {getPlanSeleccionado()?.nombre}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Cantidad:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {formData.cantidad} tarjetas
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Vendedor:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      {vendedorInfo?.nombre || 'No seleccionado'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Perfiles:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {requierePerfilServicio ? 
                        `${servicioSeleccionado?.maxPerfiles} por cuenta` : 
                        'Sin perfiles'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      PIN:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {requierePerfilServicio ? 
                        (requierePINServicio ? 'Sí (4 dígitos)' : 'No') : 
                        'No aplica'}
                    </Typography>
                  </Grid>
                </Grid>
                
                {getPlanSeleccionado() && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Proyección financiera:
                    </Typography>
                    <Typography variant="body2">
                      • Inversión: {formatCurrency(getPlanSeleccionado().precioCompra * formData.cantidad)}
                    </Typography>
                    <Typography variant="body2">
                      • Ingreso: {formatCurrency(getPlanSeleccionado().precioVenta * formData.cantidad)}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="#28a745">
                      • Ganancia: {formatCurrency((getPlanSeleccionado().precioVenta - getPlanSeleccionado().precioCompra) * formData.cantidad)}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Button
                variant="contained"
                size="large"
                onClick={handleGenerarTarjetas}
                disabled={loading || !formData.idVendedor}
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                sx={{ 
                  bgcolor: '#1976d2',
                  minWidth: 220,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  '&:hover': { bgcolor: '#1565c0' },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666'
                  }
                }}
              >
                {loading ? 'Generando...' : 'Iniciar Generación Automática'}
              </Button>
              
              {!formData.idVendedor && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  ⚠️ Debe seleccionar un vendedor para continuar
                </Typography>
              )}
              
              {loading && (
                <Box sx={{ mt: 3 }}>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Esto puede tomar unos segundos...
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        );

      case 4:
        const datos = detallesGeneracion.length > 0 ? detallesGeneracion : tarjetasGeneradas;
        
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Resultados de la Generación
            </Typography>
            
            {datos.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <CircularProgress size={60} sx={{ mb: 3, color: '#1976d2' }} />
                <Typography variant="h6" gutterBottom>
                  Procesando generación...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Las tarjetas están siendo creadas en el sistema.
                </Typography>
              </Card>
            ) : (
              <>
                <Alert 
                  severity="success" 
                  icon={<CheckCircle fontSize="large" />}
                  sx={{ mb: 3, border: '1px solid #c8e6c9' }}
                >
                  <Typography variant="h6" gutterBottom>
                    ¡Generación Exitosa!
                  </Typography>
                  <Typography>
                    Se generaron {datos.length} tarjetas para {servicioSeleccionado?.nombre}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      • Lote: <strong>{datos[0]?.lote || datos[0]?.Lote}</strong>
                    </Typography>
                    <Typography variant="body2">
                      • Vendedor asignado: <strong>{getVendedorSeleccionado()?.nombre}</strong>
                    </Typography>
                    <Typography variant="body2">
                      • Configuración: {requierePerfilServicio ? 
                        `${servicioSeleccionado?.maxPerfiles} perfil${servicioSeleccionado?.maxPerfiles > 1 ? 'es' : ''}` : 
                        'Sin perfiles'}
                    </Typography>
                    <Typography variant="body2">
                      • PIN: {requierePerfilServicio ? 
                        (requierePINServicio ? 'Sí' : 'No') : 
                        'No aplica'}
                    </Typography>
                  </Box>
                </Alert>
                
                <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Acciones Disponibles
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={descargarCSVCompleto}
                        size="medium"
                        sx={{ 
                          bgcolor: '#1976d2',
                          '&:hover': { bgcolor: '#1565c0' }
                        }}
                      >
                        Descargar CSV
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Print />}
                        onClick={imprimirPDFConImagen}
                        disabled={loadingPDF}
                        size="medium"
                      >
                        {loadingPDF ? <CircularProgress size={20} /> : 'Imprimir PDF'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => setDetallesDialog(true)}
                        startIcon={<Search />}
                        size="medium"
                      >
                        Ver Detalles
                      </Button>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Logo Personalizado (Opcional)
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<Image />}
                          size="small"
                        >
                          {imagenSubida ? 'Logo Subido ✓' : 'Seleccionar Logo'}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setImagenLote(file);
                                setImagenPreview(URL.createObjectURL(file));
                                setImagenSubida(false);
                              }
                            }}
                          />
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        {imagenPreview && (
                          <Box sx={{ textAlign: 'center' }}>
                            <img 
                              src={imagenPreview} 
                              alt="Vista previa" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: 80,
                                borderRadius: 4,
                                border: '1px solid #ddd'
                              }} 
                            />
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Button
                          variant="contained"
                          onClick={subirImagenLote}
                          disabled={!imagenLote || imagenSubida || loadingImagen}
                          fullWidth
                          startIcon={loadingImagen ? <CircularProgress size={20} /> : <Image />}
                          size="small"
                        >
                          {loadingImagen ? 'Subiendo...' : 'Subir Logo'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Ejemplo de Tarjetas Generadas
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                            <TableCell><strong>#</strong></TableCell>
                            <TableCell><strong>Código</strong></TableCell>
                            <TableCell><strong>Usuario</strong></TableCell>
                            <TableCell><strong>Contraseña</strong></TableCell>
                            {requierePerfilServicio && <TableCell><strong>Perfil</strong></TableCell>}
                            {requierePINServicio && <TableCell><strong>PIN</strong></TableCell>}
                            <TableCell><strong>Vendedor</strong></TableCell>
                            <TableCell><strong>Acciones</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {datos.slice(0, 3).map((item, index) => {
                            const normalizedItem = {
                              codigo: item.codigo || item.Codigo || '',
                              usuario: item.usuario || item.Usuario || item.perfil?.cuenta?.usuario || '',
                              contrasena: item.contrasena || item.Contrasena || item.perfil?.cuenta?.contrasena || '',
                              perfil: item.perfil || item.Perfil || item.perfil?.nombre || '',
                              pin: item.pin || item.Pin || item.perfil?.pin || '',
                              vendedor: getVendedorSeleccionado()?.nombre || ''
                            };
                            
                            return (
                              <TableRow key={index} hover>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                                  {normalizedItem.codigo}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                  {normalizedItem.usuario}
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography sx={{ 
                                      fontFamily: 'monospace',
                                      mr: 1,
                                      filter: showPassword ? 'none' : 'blur(3px)',
                                      fontSize: '0.9rem'
                                    }}>
                                      {normalizedItem.contrasena}
                                    </Typography>
                                    <IconButton 
                                      size="small"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? 
                                        <VisibilityOff fontSize="small" /> : 
                                        <Visibility fontSize="small" />
                                      }
                                    </IconButton>
                                  </Box>
                                </TableCell>
                                {requierePerfilServicio && (
                                  <TableCell>{normalizedItem.perfil || 'Principal'}</TableCell>
                                )}
                                {requierePINServicio && (
                                  <TableCell sx={{ fontFamily: 'monospace' }}>
                                    {normalizedItem.pin || 'Generando...'}
                                  </TableCell>
                                )}
                                <TableCell>
                                  <Chip 
                                    label={normalizedItem.vendedor}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    icon={<AccountCircle />}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="Copiar credenciales">
                                    <IconButton 
                                      size="small"
                                      onClick={() => copiarCredenciales(index)}
                                    >
                                      <ContentCopy fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setActiveStep(0);
                      setCompletedSteps([]);
                      setTarjetasGeneradas([]);
                      setDetallesGeneracion([]);
                      setImagenLote(null);
                      setImagenPreview(null);
                      setImagenSubida(false);
                      setFormData({
                        idServicio: '',
                        idPlan: '',
                        cantidad: 10,
                        prefijoLote: '',
                        idVendedor: '',
                        incluirQR: true,
                        imprimirInstrucciones: true,
                        asignacionAutomatica: true
                      });
                    }}
                    sx={{ 
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#1565c0' }
                    }}
                  >
                    Generar Más Tarjetas
                  </Button>
                </Box>
              </>
            )}
          </Box>
        );

      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        color: 'white',
        boxShadow: 2
      }}>
        <Box display="flex" alignItems="center" mb={2}>
          <AutoAwesome sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Generador Automático de Tarjetas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Crea tarjetas de regalo con cuentas automáticas
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel 
                StepIconProps={{
                  sx: {
                    '&.Mui-completed': { color: '#1976d2' },
                    '&.Mui-active': { color: '#1976d2', fontWeight: 'bold' }
                  }
                }}
              >
                <Typography variant="subtitle2" fontWeight={activeStep === steps.indexOf(step) ? 'bold' : 'normal'}>
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 3, p: { xs: 1, sm: 2 } }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            size="medium"
            variant="outlined"
          >
            Atrás
          </Button>
          
          {activeStep < 4 && activeStep !== 3 && (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              size="medium"
              disabled={activeStep === 2 && !formData.idVendedor}
              sx={{ 
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                '&:disabled': {
                  bgcolor: '#ccc',
                  color: '#666'
                }
              }}
            >
              {activeStep === 2 ? 'Revisar y Generar' : 'Continuar'}
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog
        open={detallesDialog}
        onClose={() => setDetallesDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Detalles Completos
            </Typography>
            <IconButton onClick={() => setDetallesDialog(false)} size="small" sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {detallesGeneracion.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Código</strong></TableCell>
                    <TableCell><strong>Usuario</strong></TableCell>
                    {requierePerfil() && <TableCell><strong>Perfil</strong></TableCell>}
                    {requierePIN() && <TableCell><strong>PIN</strong></TableCell>}
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detallesGeneracion.slice(0, 15).map((item, index) => {
                    const normalizedItem = {
                      codigo: item.codigo || item.Codigo || '',
                      usuario: item.usuario || item.Usuario || '',
                      perfil: item.perfil || item.Perfil || '',
                      pin: item.pin || item.Pin || '',
                      estado: item.estado || item.Estado || 'DISPONIBLE'
                    };
                    
                    return (
                      <TableRow key={index} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {normalizedItem.codigo}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {normalizedItem.usuario}
                        </TableCell>
                        {requierePerfil() && (
                          <TableCell>{normalizedItem.perfil}</TableCell>
                        )}
                        {requierePIN() && (
                          <TableCell sx={{ fontFamily: 'monospace' }}>
                            {normalizedItem.pin}
                          </TableCell>
                        )}
                        <TableCell>
                          <Chip 
                            label={normalizedItem.estado} 
                            size="small" 
                            color={normalizedItem.estado === 'DISPONIBLE' ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetallesDialog(false)} size="medium">
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            onClick={descargarCSVCompleto}
            startIcon={<Download />}
            size="medium"
            sx={{ ml: 1 }}
          >
            CSV
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={imprimirPDFConImagen}
            disabled={loadingPDF}
            startIcon={loadingPDF ? <CircularProgress size={16} /> : <Print />}
            size="medium"
            sx={{ ml: 1 }}
          >
            PDF
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}