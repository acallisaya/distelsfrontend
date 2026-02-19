import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Tab,
  Tabs,
  Avatar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  Logout, 
  ArrowBack,
  Edit,
  Language,
  WhatsApp,
  QrCode,
  ContentCopy,
  Share,
  Visibility,
  Build,
  Settings,
  Dashboard as DashboardIcon,
  Business,
  Phone,
  Email,
  LocationOn,
  Refresh,
  InsertPhoto,
  VideoLibrary,
  Star,
  Chat,
  Speed,
  Close,
  Security,
  Person,
  Lock,
  Send,
  CheckCircle,
  Warning,
  FiberManualRecord,
  MenuBook,
  Palette,
  ShareLocation
} from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';
import { API_BASE_URL } from '../config';

// Importar los formularios
import PaginaFormPro from './PaginaFormPro';
import PreviewPagePro from './PreviewPagePro';
import WhatsAppForm from './WhatsAppForm';

export default function DashboardCliente() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cliente, setCliente] = useState(null);
  const [pagina, setPagina] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para modales
  const [editPaginaDialog, setEditPaginaDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [whatsAppDialog, setWhatsAppDialog] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // ========== FUNCIÓN PARA OBTENER HEADERS CON TOKEN Y NGROK ==========
  const getHeaders = () => {
    const token = localStorage.getItem('clienteToken') || localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true' // 👈 HEADER CLAVE PARA NGROK
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Verificar sesión y cargar datos
  useEffect(() => {
    const verificarSesion = () => {
      const session = localStorage.getItem('clienteSession');
      const token = localStorage.getItem('clienteToken') || localStorage.getItem('token');
      
      if (!session || !token) {
        console.log('⛔ No hay sesión activa');
        navigate('/login/cliente');
        return;
      }
      
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.id !== parseInt(clienteId)) {
          console.log('⛔ ID de sesión no coincide');
          navigate('/login/cliente');
          return;
        }
        loadClienteData(clienteId);
      } catch (err) {
        console.error('⛔ Error parseando sesión:', err);
        navigate('/login/cliente');
      }
    };

    verificarSesion();
  }, [clienteId, navigate]);

  const loadClienteData = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Cargando datos del cliente:', id);
      
      // Cargar datos del cliente CON HEADERS
      const clienteRes = await fetch(`${API_BASE_URL}/Clientes/${id}`, {
        headers: getHeaders()
      });
      
      if (!clienteRes.ok) {
        const text = await clienteRes.text();
        console.error('Error respuesta:', text);
        throw new Error(`Error ${clienteRes.status}: No se pudo cargar el cliente`);
      }
      
      const clienteData = await clienteRes.json();
      
      // Cargar página del cliente CON HEADERS
      let paginaData = null;
      try {
        const paginaRes = await fetch(`${API_BASE_URL}/ClientePaginas/cliente/${id}`, {
          headers: getHeaders()
        });
        if (paginaRes.ok) {
          paginaData = await paginaRes.json();
          console.log('📄 Página cargada:', paginaData);
        }
      } catch (paginaErr) {
        console.log('⚠️ Error cargando página:', paginaErr);
      }
      
      // Cargar WhatsApp del cliente CON HEADERS
      let whatsAppData = null;
      try {
        const whatsAppRes = await fetch(`${API_BASE_URL}/ClienteWhatsApps/cliente/${id}`, {
          headers: getHeaders()
        });
        if (whatsAppRes.ok) {
          whatsAppData = await whatsAppRes.json();
        }
      } catch {
        console.log('No hay WhatsApp configurado');
      }
      
      // Combinar todos los datos
      const clienteCompleto = {
        ...clienteData,
        pagina: paginaData,
        whatsApp: whatsAppData
      };
      
      console.log('✅ Cliente completo cargado:', clienteCompleto);
      
      setCliente(clienteCompleto);
      setPagina(paginaData);
      
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleLogout = () => {
    localStorage.removeItem('clienteSession');
    localStorage.removeItem('clienteToken');
    localStorage.removeItem('clienteData');
    navigate('/login/cliente');
  };

  // ========== ACCIONES DE PÁGINA WEB ==========
  const handleEditPagina = () => {
    console.log('✏️ Editando página, datos actuales:', pagina);
    
    const paginaData = pagina ? {
      ...pagina,
      clienteId: parseInt(clienteId),
      serviciosPersonalizados: pagina.serviciosPersonalizados || [],
      testimoniosPersonalizados: pagina.testimoniosPersonalizados || [],
      galeriasImagenes: pagina.galeriasImagenes || [],
      videosEmbebidos: pagina.videosEmbebidos || []
    } : {
      clienteId: parseInt(clienteId),
      estado: "activa",
      esResponsive: true,
      mostrarServicios: true,
      mostrarContacto: true,
      serviciosPersonalizados: [],
      testimoniosPersonalizados: [],
      galeriasImagenes: [],
      videosEmbebidos: []
    };
    
    setEditPaginaDialog(true);
  };

  const handleSavePagina = async (paginaGuardada) => {
    try {
      console.log('💾 Guardando página recibida:', paginaGuardada);
      
      setPagina(paginaGuardada);
      setCliente(prev => ({
        ...prev,
        pagina: paginaGuardada
      }));
      
      setEditPaginaDialog(false);
      
      await loadClienteData(clienteId);
      
      showSnackbar('✅ Página guardada correctamente', 'success');
      
    } catch (err) {
      console.error('❌ Error manejando guardado:', err);
      showSnackbar(`❌ Error: ${err.message}`, 'error');
    }
  };

  const handlePreviewPagina = () => {
    if (!cliente) {
      showSnackbar('❌ Error: Cliente no cargado', 'error');
      return;
    }
    
    if (!pagina) {
      showSnackbar('⚠️ Primero debes crear una página', 'warning');
      return;
    }
    
    setPreviewDialog(true);
  };

  const handleViewPublicPage = () => {
    if (!pagina || pagina.estado !== 'activa') {
      showSnackbar('⚠️ La página no está activa o no existe', 'warning');
      return;
    }
    
    const publicUrl = `/pagina/${clienteId}`;
    window.open(publicUrl, '_blank');
  };

  const handleSharePage = () => {
    const pageUrl = `${window.location.origin}/pagina/${clienteId}`;
    navigator.clipboard.writeText(pageUrl);
    showSnackbar('✅ Enlace copiado al portapapeles', 'success');
  };

  const handleGenerateQR = () => {
    const pageUrl = `${window.location.origin}/pagina/${clienteId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pageUrl)}`;
    window.open(qrUrl, '_blank');
  };

  // ========== CONFIGURACIÓN DE WHATSAPP ==========
  const handleConfigurarWhatsApp = () => {
    setWhatsAppDialog(true);
  };

  const handleSaveWhatsApp = async () => {
    await loadClienteData(clienteId);
    setWhatsAppDialog(false);
    showSnackbar('✅ Configuración de WhatsApp guardada correctamente', 'success');
  };

  // ========== RENDERIZADO DE COMPONENTES ==========
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando panel...</Typography>
      </Box>
    );
  }

  if (error && !cliente) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/login/cliente')} sx={{ mt: 2 }}>
          Volver al Login
        </Button>
      </Container>
    );
  }

  // ========== COMPONENTES DE LA INTERFAZ ==========
  
  // Header principal
  const renderHeader = () => (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 3, 
      mb: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos */}
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)'
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.3)'
            }}>
              <Person sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                👋 ¡Hola, {cliente?.nombre || 'Cliente'}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Bienvenido a tu centro de gestión personal
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ 
              bgcolor: 'white', 
              color: '#667eea', 
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              {cliente?.empresa ? `Empresa: ${cliente.empresa}` : 'Gestión de tu presencia digital'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label="SESIÓN ACTIVA" 
                color="success" 
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: 'rgba(255,255,255,0.2)'
                }} 
              />
              <Chip 
                label={`ID: ${clienteId}`} 
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white'
                }} 
              />
              {cliente?.estado === 'activo' && (
                <Chip 
                  label="CUENTA VERIFICADA" 
                  icon={<Security fontSize="small" />}
                  sx={{ 
                    fontWeight: 'bold',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white'
                  }} 
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => loadClienteData(clienteId)}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Actualizar Datos
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  // Tabs de navegación
  const renderTabs = () => (
    <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            fontSize: '1rem',
            fontWeight: 600,
            py: 2
          }
        }}
      >
        <Tab label="Resumen" icon={<DashboardIcon />} iconPosition="start" />
        <Tab label="Página Web" icon={<Language />} iconPosition="start" />
        <Tab label="WhatsApp" icon={<WhatsApp />} iconPosition="start" />
        <Tab label="Configuración" icon={<Settings />} iconPosition="start" />
      </Tabs>
    </Paper>
  );

  // Contenido de cada tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 0: return renderResumenTab();
      case 1: return renderPaginaWebTab();
      case 2: return renderWhatsAppTab();
      case 3: return renderConfiguracionTab();
      default: return renderResumenTab();
    }
  };

  // Tab: Resumen
  const renderResumenTab = () => (
    <Grid container spacing={3}>
      {/* Información Personal */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person /> Información Personal
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">Nombre Completo</Typography>
              <Typography variant="body1" fontWeight="bold">{cliente?.nombre}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Usuario</Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{cliente?.usuario}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Empresa</Typography>
              <Typography variant="body1">{cliente?.empresa || 'No especificada'}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* Contacto */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chat /> Información de Contacto
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            {cliente?.celular && (
              <Box>
                <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="small" /> {cliente.celular}
                </Typography>
              </Box>
            )}
            {cliente?.email && (
              <Box>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" /> {cliente.email}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="textSecondary">ID Cliente</Typography>
              <Typography variant="body1" fontFamily="monospace" sx={{ 
                bgcolor: '#f5f5f5', 
                p: 1, 
                borderRadius: 1 
              }}>
                {clienteId}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* Servicios Activos */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings /> Servicios Activos
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={3}>
            {/* Página Web */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Language fontSize="small" />
                  <Typography variant="body2">Página Web</Typography>
                </Box>
                <Chip 
                  label={pagina ? "✅ ACTIVA" : "⭕ NO CONFIGURADA"} 
                  size="small" 
                  color={pagina ? "success" : "default"} 
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={pagina ? 100 : 0} 
                sx={{ 
                  height: 4,
                  borderRadius: 2,
                  bgcolor: '#f0f0f0'
                }}
              />
            </Box>

            {/* WhatsApp */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WhatsApp fontSize="small" />
                  <Typography variant="body2">WhatsApp</Typography>
                </Box>
                <Chip 
                  label={cliente?.whatsApp ? "✅ CONFIGURADO" : "⭕ NO CONFIGURADO"} 
                  size="small" 
                  color={cliente?.whatsApp ? "success" : "default"} 
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={cliente?.whatsApp ? 100 : 0} 
                sx={{ 
                  height: 4,
                  borderRadius: 2,
                  bgcolor: '#f0f0f0'
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              startIcon={<Build />}
              onClick={() => setActiveTab(1)}
              sx={{ mt: 2 }}
            >
              Gestionar Servicios
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  // Tab: Página Web
  const renderPaginaWebTab = () => (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 'bold' }}>
          <Language /> Mi Página Web
        </Typography>
        <Chip 
          label={pagina ? `ESTADO: ${pagina.estado?.toUpperCase()}` : 'NO CONFIGURADA'} 
          color={pagina?.estado === 'activa' ? 'success' : pagina?.estado === 'en_construccion' ? 'warning' : 'default'}
        />
      </Box>

      {pagina ? (
        <>
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
            Tu página web está configurada y {pagina.estado === 'activa' ? 'pública' : 'en construcción'}.
          </Alert>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Estadísticas */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed /> Estadísticas de la Página
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">URL de Acceso</Typography>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: '#667eea',
                        wordBreak: 'break-all'
                      }}>
                        {window.location.origin}/pagina/{clienteId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Última actualización</Typography>
                      <Typography variant="body1">
                        {new Date(pagina.fechaActualizacion || pagina.fechaCreacion || Date.now()).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Secciones activas</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {pagina.mostrarServicios && <Chip label="Servicios" size="small" color="primary" />}
                        {pagina.mostrarContacto && <Chip label="Contacto" size="small" color="secondary" />}
                        {pagina.esResponsive && <Chip label="Responsive" size="small" color="success" />}
                        {pagina.serviciosPersonalizados && pagina.serviciosPersonalizados.length > 0 && (
                          <Chip label={`${pagina.serviciosPersonalizados.length} Servicios`} size="small" />
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Acciones Rápidas */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShareLocation /> Acciones Rápidas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={handleEditPagina}
                        sx={{ py: 1.5 }}
                      >
                        Editar
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={handleViewPublicPage}
                        disabled={pagina.estado !== 'activa'}
                        sx={{ py: 1.5 }}
                      >
                        Ver Pública
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Share />}
                        onClick={() => setShareDialog(true)}
                        sx={{ py: 1.5 }}
                      >
                        Compartir
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<QrCode />}
                        onClick={() => setQrDialog(true)}
                        sx={{ py: 1.5 }}
                      >
                        QR Code
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
            Aún no tienes una página web configurada. ¡Crea una ahora mismo!
          </Alert>

          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ 
              width: 120, 
              height: 120, 
              bgcolor: '#f0f0f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <Language sx={{ fontSize: 60, color: '#ccc' }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Crea tu Página Web Profesional
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Muestra tus servicios y contacto a tus clientes con una página web moderna y profesional.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<Build />}
              onClick={handleEditPagina}
              sx={{ 
                px: 6, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Crear Mi Página Web
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );

  // Tab: WhatsApp
  const renderWhatsAppTab = () => (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 'bold', mb: 4 }}>
        <WhatsApp /> Configuración de WhatsApp
      </Typography>

      {cliente?.whatsApp ? (
        <>
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
            Tu WhatsApp Business está configurado y activo.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Configuración Actual
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Número de WhatsApp</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {cliente.whatsApp.whatsAppNumber || cliente.whatsApp.numero || 'No configurado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Estado</Typography>
                      <Chip 
                        label={cliente.whatsApp.estado || 'ACTIVO'} 
                        color="success" 
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Mensaje de Bienvenida</Typography>
                      <Typography variant="body1">
                        {cliente.whatsApp.mensajeBienvenida || 'No configurado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Permitidos</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {cliente.whatsApp.permitirTextos && <Chip label="Textos" size="small" color="primary" />}
                        {cliente.whatsApp.permitirImagenes && <Chip label="Imágenes" size="small" color="secondary" />}
                        {cliente.whatsApp.permitirVideos && <Chip label="Videos" size="small" color="info" />}
                        {cliente.whatsApp.permitirAudios && <Chip label="Audios" size="small" color="success" />}
                        {cliente.whatsApp.botActivo && <Chip label="Bot" size="small" color="warning" />}
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Acciones Disponibles
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleConfigurarWhatsApp}
                      sx={{ py: 1.5 }}
                    >
                      Editar Configuración
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Send />}
                      onClick={() => {
                        const numero = cliente.whatsApp.whatsAppNumber || cliente.whatsApp.numero;
                        if (numero) {
                          const url = `https://wa.me/${numero.replace('+', '')}`;
                          window.open(url, '_blank');
                        } else {
                          showSnackbar('No hay número configurado', 'warning');
                        }
                      }}
                      sx={{ py: 1.5 }}
                    >
                      Enviar Mensaje de Prueba
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<QrCode />}
                      onClick={() => {
                        const numero = cliente.whatsApp.whatsAppNumber || cliente.whatsApp.numero;
                        if (numero) {
                          const mensaje = encodeURIComponent('Hola, me gustaría contactarlos');
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wa.me/${numero.replace('+', '')}?text=${mensaje}`;
                          window.open(qrUrl, '_blank');
                        } else {
                          showSnackbar('No hay número configurado', 'warning');
                        }
                      }}
                      sx={{ py: 1.5 }}
                    >
                      Generar Código QR
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ContentCopy />}
                      onClick={() => {
                        const numero = cliente.whatsApp.whatsAppNumber || cliente.whatsApp.numero;
                        if (numero) {
                          navigator.clipboard.writeText(numero);
                          showSnackbar('Número copiado al portapapeles', 'success');
                        } else {
                          showSnackbar('No hay número configurado', 'warning');
                        }
                      }}
                      sx={{ py: 1.5 }}
                    >
                      Copiar Número
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
            Configura WhatsApp Business para comunicarte directamente con tus clientes.
          </Alert>

          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ 
              width: 120, 
              height: 120, 
              bgcolor: '#25D366',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <WhatsApp sx={{ fontSize: 60, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Conecta con tus Clientes
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Recibe consultas, envía promociones y brinda atención personalizada a través de WhatsApp.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<Settings />}
              onClick={handleConfigurarWhatsApp}
              sx={{ 
                px: 6, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                bgcolor: '#25D366',
                '&:hover': {
                  bgcolor: '#128C7E'
                }
              }}
            >
              Configurar WhatsApp
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );

  // Tab: Configuración
  const renderConfiguracionTab = () => (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 'bold', mb: 4 }}>
        <Settings /> Configuración de Cuenta
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seguridad
              </Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => {/* Lógica para cambio de contraseña */}}
                  sx={{ py: 1.5 }}
                >
                  Cambiar Contraseña
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Nota:</strong> Para cambios en información personal como nombre, teléfono o email, 
              contacta al administrador del sistema.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Paper>
  );

  // ========== MODALES Y DIALOGOS ==========
  
  // Modal QR
  const renderQRDialog = () => (
    <Dialog open={qrDialog} onClose={() => setQrDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        bgcolor: '#667eea', 
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight="bold">Código QR de la Página</Typography>
        <IconButton onClick={() => setQrDialog(false)} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/pagina/${clienteId}`)}`}
          alt="QR Code"
          style={{ width: 250, height: 250, marginBottom: 20, borderRadius: 8 }}
        />
        <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-all', mb: 3, fontFamily: 'monospace' }}>
          {window.location.origin}/pagina/{clienteId}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="outlined" 
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/pagina/${clienteId}`);
              showSnackbar('URL copiada al portapapeles', 'success');
            }}
          >
            Copiar URL
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );

  // Modal Compartir
  const renderShareDialog = () => (
    <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#667eea', color: 'white' }}>
        Compartir Página
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<WhatsApp />}
            onClick={() => {
              const message = `Mira mi página web: ${window.location.origin}/pagina/${clienteId}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
              setShareDialog(false);
            }}
            sx={{ justifyContent: 'flex-start' }}
          >
            Compartir en WhatsApp
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/pagina/${clienteId}`);
              showSnackbar('URL copiada al portapapeles', 'success');
              setShareDialog(false);
            }}
            sx={{ justifyContent: 'flex-start' }}
          >
            Copiar Enlace
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShareDialog(false)}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {renderHeader()}
        {renderTabs()}
        {renderTabContent()}
      </Container>

      {/* Modal Editar Página */}
      <Dialog 
        open={editPaginaDialog} 
        onClose={() => setEditPaginaDialog(false)}
        maxWidth="xl"
        fullWidth
        fullScreen={window.innerWidth < 900}
      >
        <DialogTitle sx={{ 
          bgcolor: '#667eea', 
          color: 'white',
          py: 2
        }}>
          <Typography variant="h6" fontWeight="bold">
            {pagina ? '✏️ Editar Página Web' : '🆕 Crear Página Web'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <PaginaFormPro
            open={editPaginaDialog}
            onClose={() => setEditPaginaDialog(false)}
            paginaData={pagina || {
              clienteId: parseInt(clienteId),
              estado: "activa",
              esResponsive: true,
              mostrarServicios: true,
              mostrarContacto: true
            }}
            cliente={cliente}
            onSave={handleSavePagina}
            isClienteMode={true}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Preview */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)}
        maxWidth="xl"
        fullWidth
        fullScreen={true}
      >
        <DialogTitle sx={{ 
          bgcolor: '#667eea', 
          color: 'white',
          py: 2
        }}>
          <Typography variant="h6" fontWeight="bold">
            🔍 Vista Previa - {pagina?.encabezado || 'Mi Página Web'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 'calc(100vh - 64px)' }}>
          <PreviewPagePro
            open={previewDialog}
            onClose={() => setPreviewDialog(false)}
            paginaData={pagina}
            cliente={cliente}
            isPreview={true}
            isClienteMode={true}
          />
        </DialogContent>
      </Dialog>

      {/* Modal WhatsApp */}
      <WhatsAppForm
        open={whatsAppDialog}
        onClose={() => setWhatsAppDialog(false)}
        whatsAppData={cliente?.whatsApp}
        cliente={cliente}
        onSave={handleSaveWhatsApp}
      />

      {/* Modales adicionales */}
      {renderQRDialog()}
      {renderShareDialog()}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}