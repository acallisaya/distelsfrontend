import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton,
  TextField, InputAdornment, Button, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Avatar, Tooltip, LinearProgress,
  TablePagination, Card, CardContent, Grid, Stack,
  Divider, Alert
} from '@mui/material';
import {
  Search, MoreVert, Phone, PlayArrow, Schedule,
  CheckCircle, Error, Warning, ContentCopy,
  VolumeUp, Chat, Person, AccessTime, Visibility,
  Download, Refresh, FilterList, VisibilityOff
} from '@mui/icons-material';
import { API_BASE_URL } from '../../../config';

// Importar el diálogo (asegúrate de tenerlo en la misma carpeta)
import LlamadaDetailsDialog from '../dialogs/LlamadaDetailsDialog';

export default function LlamadasList({ vendedorId }) {
  const [llamadas, setLlamadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLlamada, setSelectedLlamada] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedLlamadaId, setSelectedLlamadaId] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: '',
    resultado: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  useEffect(() => {
    cargarLlamadas();
  }, [vendedorId, page, rowsPerPage]);

  const cargarLlamadas = async () => {
    try {
      setLoading(true);
      
      // Construir URL con filtros
      let url = `${API_BASE_URL}/callcenter?page=${page + 1}&pageSize=${rowsPerPage}`;
      
      if (vendedorId) {
        url += `&vendedorId=${vendedorId}`;
      }
      
      // Agregar filtros
      if (filtros.estado) url += `&estado=${filtros.estado}`;
      if (filtros.resultado) url += `&resultado=${filtros.resultado}`;
      if (filtros.fechaDesde) url += `&fechaDesde=${filtros.fechaDesde}`;
      if (filtros.fechaHasta) url += `&fechaHasta=${filtros.fechaHasta}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLlamadas(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando llamadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, llamada) => {
    setAnchorEl(event.currentTarget);
    setSelectedLlamada(llamada);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLlamada(null);
  };

  const handleViewDetails = (llamada) => {
    setSelectedLlamadaId(llamada.id);
    setOpenDetailsDialog(true);
    handleMenuClose();
  };

  const handleExecute = async () => {
    if (!selectedLlamada) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/callcenter/ejecutar/${selectedLlamada.id}`, {
        method: 'POST'
      });
      
      if (res.ok) {
        cargarLlamadas();
      }
    } catch (error) {
      console.error('Error ejecutando llamada:', error);
    }
    handleMenuClose();
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return 'success';
      case 'EN_CURSO': return 'warning';
      case 'FALLIDA': return 'error';
      case 'PROGRAMADA': return 'info';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return <CheckCircle />;
      case 'EN_CURSO': return <PlayArrow />;
      case 'FALLIDA': return <Error />;
      case 'PROGRAMADA': return <Schedule />;
      default: return null;
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuracion = (segundos) => {
    if (!segundos) return '00:00';
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const filteredLlamadas = llamadas.filter(llamada =>
    llamada.clienteFinal?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    llamada.clienteFinal?.celular?.includes(search) ||
    llamada.vendedor?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = async () => {
    try {
      let url = `${API_BASE_URL}/callcenter/exportar-csv`;
      if (vendedorId) url += `?vendedorId=${vendedorId}`;
      
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exportando CSV:', error);
    }
  };

  const handleResetFilters = () => {
    setFiltros({
      estado: '',
      resultado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setPage(0);
  };

  return (
    <Box>
      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              placeholder="Buscar por cliente, teléfono o vendedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
              }}
              sx={{ width: '100%' }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Actualizar">
                <IconButton onClick={cargarLlamadas}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {/* Aquí podrías abrir un diálogo de filtros avanzados */}}
              >
                Filtros
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportCSV}
              >
                Exportar
              </Button>
            </Stack>
          </Grid>

          {/* Filtros rápidos */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label="Todas"
                variant={filtros.estado === '' ? 'filled' : 'outlined'}
                onClick={() => setFiltros({ ...filtros, estado: '' })}
                size="small"
              />
              <Chip
                label="Programadas"
                variant={filtros.estado === 'PROGRAMADA' ? 'filled' : 'outlined'}
                onClick={() => setFiltros({ ...filtros, estado: 'PROGRAMADA' })}
                color="info"
                size="small"
              />
              <Chip
                label="Completadas"
                variant={filtros.estado === 'COMPLETADA' ? 'filled' : 'outlined'}
                onClick={() => setFiltros({ ...filtros, estado: 'COMPLETADA' })}
                color="success"
                size="small"
              />
              <Chip
                label="Fallidas"
                variant={filtros.estado === 'FALLIDA' ? 'filled' : 'outlined'}
                onClick={() => setFiltros({ ...filtros, estado: 'FALLIDA' })}
                color="error"
                size="small"
              />
              
              {(filtros.estado || filtros.resultado || filtros.fechaDesde || filtros.fechaHasta) && (
                <Chip
                  label="Limpiar filtros"
                  onClick={handleResetFilters}
                  onDelete={handleResetFilters}
                  color="default"
                  size="small"
                  deleteIcon={<Close />}
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Tabla de llamadas */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <LinearProgress />
            <Typography sx={{ mt: 2 }}>Cargando llamadas...</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha Programada</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Resultado</TableCell>
                  <TableCell>Sentimiento</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLlamadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Alert severity="info">
                        No se encontraron llamadas con los filtros actuales
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLlamadas.map((llamada) => (
                    <TableRow 
                      key={llamada.id}
                      hover
                      sx={{ 
                        opacity: llamada.estado === 'CANCELADA' ? 0.6 : 1,
                        bgcolor: llamada.estado === 'EN_CURSO' ? '#fff8e1' : 'inherit',
                        '&:hover': {
                          bgcolor: '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1, 
                            bgcolor: '#667eea',
                            fontSize: '0.8rem'
                          }}>
                            {llamada.clienteFinal?.nombre?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {llamada.clienteFinal?.nombre || 'Sin nombre'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Vendedor: {llamada.vendedor?.nombre || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {llamada.clienteFinal?.celular || 'Sin teléfono'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getEstadoIcon(llamada.estado)}
                          label={llamada.estado}
                          size="small"
                          color={getEstadoColor(llamada.estado)}
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" noWrap>
                            {formatFecha(llamada.fechaProgramada)}
                          </Typography>
                          {llamada.fechaEjecucion && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Ejecutada: {formatFecha(llamada.fechaEjecucion)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        {llamada.duracionSegundos ? (
                          <Typography variant="body2" fontWeight="medium">
                            {formatDuracion(llamada.duracionSegundos)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={llamada.resultado || 'PENDIENTE'}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            bgcolor: llamada.resultado === 'CONTESTO' ? '#e8f5e9' : 
                                    llamada.resultado === 'NO_CONTESTO' ? '#fff3e0' : 
                                    llamada.resultado === 'OCUPADO' ? '#ffebee' : '#f5f5f5',
                            color: llamada.resultado === 'CONTESTO' ? '#2e7d32' :
                                  llamada.resultado === 'NO_CONTESTO' ? '#f57c00' :
                                  llamada.resultado === 'OCUPADO' ? '#c62828' : 'inherit'
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        {llamada.sentimiento ? (
                          <Chip
                            label={llamada.sentimiento}
                            size="small"
                            sx={{
                              bgcolor: llamada.sentimiento === 'POSITIVO' ? '#e8f5e9' : 
                                      llamada.sentimiento === 'NEGATIVO' ? '#ffebee' : '#f5f5f5',
                              color: llamada.sentimiento === 'POSITIVO' ? '#2e7d32' :
                                    llamada.sentimiento === 'NEGATIVO' ? '#c62828' : 'inherit'
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1} alignItems="center">
                          {/* BOTÓN VER DETALLES - TU CÓDIGO */}
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedLlamadaId(llamada.id);
                                setOpenDetailsDialog(true);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {llamada.estado === 'PROGRAMADA' && (
                            <Tooltip title="Ejecutar ahora">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={handleExecute}
                              >
                                <PlayArrow fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {llamada.grabacionUrl && (
                            <Tooltip title="Escuchar grabación">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => window.open(llamada.grabacionUrl, '_blank')}
                              >
                                <VolumeUp fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, llamada)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}
      </TableContainer>

      {/* Paginación */}
      {!loading && (
        <TablePagination
          component="div"
          count={filteredLlamadas.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedLlamada && handleViewDetails(selectedLlamada)}>
          <Visibility sx={{ mr: 1, fontSize: 16 }} /> Ver detalles completos
        </MenuItem>
        
        {selectedLlamada?.estado === 'PROGRAMADA' && (
          <MenuItem onClick={handleExecute}>
            <PlayArrow sx={{ mr: 1, fontSize: 16 }} /> Ejecutar ahora
          </MenuItem>
        )}
        
        {selectedLlamada?.grabacionUrl && (
          <MenuItem onClick={() => window.open(selectedLlamada.grabacionUrl, '_blank')}>
            <VolumeUp sx={{ mr: 1, fontSize: 16 }} /> Escuchar grabación
          </MenuItem>
        )}
        
        {selectedLlamada?.clienteFinal?.celular && (
          <MenuItem onClick={() => navigator.clipboard.writeText(selectedLlamada.clienteFinal.celular)}>
            <ContentCopy sx={{ mr: 1, fontSize: 16 }} /> Copiar teléfono
          </MenuItem>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem onClick={() => {
          // Acción adicional: Reprogramar llamada
          handleMenuClose();
        }}>
          <Schedule sx={{ mr: 1, fontSize: 16 }} /> Reprogramar
        </MenuItem>
      </Menu>

      {/* DIÁLOGO DE DETALLES - TU CÓDIGO */}
      <LlamadaDetailsDialog
        open={openDetailsDialog}
        onClose={() => {
          setOpenDetailsDialog(false);
          setSelectedLlamadaId(null);
        }}
        llamadaId={selectedLlamadaId}
        onUpdate={cargarLlamadas} // Para refrescar después de acciones
      />

      {/* Estadísticas rápidas */}
      {!loading && llamadas.length > 0 && (
        <Card sx={{ mt: 3, p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            📊 Resumen de llamadas mostradas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h5">{filteredLlamadas.length}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h5" color="success.main">
                  {filteredLlamadas.filter(l => l.estado === 'COMPLETADA').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Completadas</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h5" color="error.main">
                  {filteredLlamadas.filter(l => l.estado === 'FALLIDA').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Fallidas</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h5" color="info.main">
                  {filteredLlamadas.filter(l => l.estado === 'PROGRAMADA').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Programadas</Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  );
}

// Componente para el icono Close (si no lo tienes importado)
function Close(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}