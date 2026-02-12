import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Tabs, Tab, Chip, CircularProgress, IconButton, Tooltip,
  Alert, Snackbar, LinearProgress, Divider, Stack
} from '@mui/material';
import {
  Phone, PhoneCallback, PhoneInTalk, PhoneMissed,
  TrendingUp, People, Schedule, CheckCircle, Error,
  Refresh, FilterList, Download, Settings, 
  Analytics, Chat, History, Warning
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config';

// Importar componentes
import LlamadasList from './components/LlamadasList';
import ScriptsManager from './components/ScriptsManager';
import SeguimientosPendientes from './components/SeguimientosPendientes';
import EstadisticasChart from './components/EstadisticasChart';

export default function CallCenterDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [vendedorId, setVendedorId] = useState(null); // Obtener del contexto/auth

  useEffect(() => {
    cargarEstadisticas();
    // Cargar vendedorId del usuario logueado
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.tipoCliente === 'VENDEDOR') {
      setVendedorId(userData.id);
    }
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const url = vendedorId 
        ? `${API_BASE_URL}/callcenter/estadisticas?vendedorId=${vendedorId}`
        : `${API_BASE_URL}/callcenter/estadisticas`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEstadisticas(data);
      }
    } catch (error) {
      showSnackbar('Error cargando estadísticas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const ejecutarLlamadasPendientes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/callcenter/ejecutar-masivo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vendedorId: vendedorId || 0,
          cantidadMaxima: 10 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        showSnackbar(`Ejecutadas ${data.exitosas} llamadas de ${data.total}`, 'success');
        cargarEstadisticas();
      }
    } catch (error) {
      showSnackbar('Error ejecutando llamadas', 'error');
    }
  };

  const exportarReporte = async () => {
    try {
      const url = vendedorId
        ? `${API_BASE_URL}/callcenter/exportar-csv?vendedorId=${vendedorId}`
        : `${API_BASE_URL}/callcenter/exportar-csv`;
      
      window.open(url, '_blank');
      showSnackbar('Reporte exportado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error exportando reporte', 'error');
    }
  };

  const tabs = [
    { label: '📞 Llamadas', icon: <Phone />, component: <LlamadasList vendedorId={vendedorId} /> },
    { label: '📊 Estadísticas', icon: <Analytics />, component: <EstadisticasChart estadisticas={estadisticas} /> },
    { label: '⚙️ Scripts', icon: <Chat />, component: <ScriptsManager vendedorId={vendedorId} /> },
    { label: '⚠️ Seguimientos', icon: <Warning />, component: <SeguimientosPendientes vendedorId={vendedorId} /> },
    { label: '🕐 Historial', icon: <History />, component: <div>Historial completo de llamadas</div> }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header con estadísticas */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h3" gutterBottom>
              📞 Call Center IA
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Sistema automatizado de llamadas con inteligencia artificial
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Ejecutar llamadas pendientes">
              <Button
                variant="contained"
                startIcon={<Phone />}
                onClick={ejecutarLlamadasPendientes}
                sx={{ bgcolor: 'white', color: '#667eea' }}
              >
                Ejecutar Ahora
              </Button>
            </Tooltip>
            
            <Tooltip title="Exportar reporte">
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={exportarReporte}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Exportar
              </Button>
            </Tooltip>
          </Stack>
        </Box>

        {/* Cards de estadísticas */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : estadisticas ? (
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)' }}>
                <Typography variant="h2">{estadisticas.totales?.TotalLlamadas || 0}</Typography>
                <Typography variant="body2">Total Llamadas</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)' }}>
                <Typography variant="h2" color="#4caf50">
                  {estadisticas.totales?.Completadas || 0}
                </Typography>
                <Typography variant="body2">Completadas</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)' }}>
                <Typography variant="h2" color="#f44336">
                  {estadisticas.totales?.Fallidas || 0}
                </Typography>
                <Typography variant="body2">Fallidas</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)' }}>
                <Typography variant="h2">
                  {estadisticas.totales?.TasaExito || 0}%
                </Typography>
                <Typography variant="body2">Tasa de Éxito</Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : null}
      </Paper>

      {/* Tarjetas de estado rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PhoneCallback sx={{ color: '#2196f3', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Programadas
                </Typography>
              </Box>
              <Typography variant="h4" color="#2196f3">
                {estadisticas?.totales?.Programadas || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Para ejecutar próximamente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PhoneInTalk sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  En Curso
                </Typography>
              </Box>
              <Typography variant="h4" color="#ff9800">
                {estadisticas?.totales?.EnCurso || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Llamadas activas ahora
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Positivas
                </Typography>
              </Box>
              <Typography variant="h4" color="#4caf50">
                {estadisticas?.distribucion?.PorSentimiento?.find(s => s.Sentimiento === 'POSITIVO')?.Cantidad || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Clientes satisfechos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #f44336' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Error sx={{ color: '#f44336', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Seguimientos
                </Typography>
              </Box>
              <Typography variant="h4" color="#f44336">
                {estadisticas?.seguimientosPendientes || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requieren atención
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs de navegación */}
      <Paper sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { py: 2, minHeight: 60 }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{ fontSize: '0.9rem' }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabs[tabValue].component}
        </Box>
      </Paper>

      {/* Panel de acciones rápidas */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          ⚡ Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Phone />}
              onClick={() => setTabValue(0)}
            >
              Ver Llamadas
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Chat />}
              onClick={() => setTabValue(2)}
            >
              Configurar Scripts
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Warning />}
              onClick={() => setTabValue(3)}
            >
              Ver Seguimientos
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              onClick={cargarEstadisticas}
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}