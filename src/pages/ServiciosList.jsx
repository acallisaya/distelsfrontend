import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, IconButton, CircularProgress, TextField,
  Grid, Chip, TablePagination, InputAdornment, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar
} from '@mui/material';
import {
  Add, Search, Edit, Delete, Refresh,
  CheckCircle, Error, CardGiftcard
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import ServicioForm from './ServicioForm'; // 👈 Importar el nuevo componente

// Definición de colores
const COLOR_PALETTE = {
  primary: "#667eea",
  secondary: "#f5576c",
  accent: "#EAB126",
  dark: "#040404",
  success: "#4caf50"
};

export default function ServiciosList() {
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  
  // Estados para diálogos (IGUAL QUE EN PLANESLIST)
  const [openServicioForm, setOpenServicioForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [servicioToDelete, setServicioToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ✅ Función para obtener headers con token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  };

  // ✅ Verificar token antes de peticiones
  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showSnackbar('Sesión expirada', 'error');
      window.location.href = '/';
      return false;
    }
    return true;
  };

  // ✅ fetchServicios
  const fetchServicios = async () => {
    if (!checkToken()) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Servicios`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        showSnackbar('Sesión expirada', 'error');
        window.location.href = '/';
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setServicios(data);
        setFilteredServicios(data);
      } else {
        showSnackbar('Error al cargar servicios', 'error');
      }
    } catch (error) {
      console.error('Error en fetchServicios:', error);
      showSnackbar('Error al cargar servicios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  useEffect(() => {
    const filtered = servicios.filter(servicio =>
      servicio.nombre.toLowerCase().includes(search.toLowerCase()) ||
      servicio.codigo.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredServicios(filtered);
    setPage(0);
  }, [search, servicios]);

  const handleOpenServicioForm = (servicio = null) => {
    setEditingServicio(servicio);
    setOpenServicioForm(true);
  };

  const handleOpenDeleteDialog = (servicio) => {
    setServicioToDelete(servicio);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setServicioToDelete(null);
    setDeleting(false);
  };

  // ✅ handleDelete
  const handleDelete = async () => {
    if (!servicioToDelete) return;
    if (!checkToken()) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Servicios/${servicioToDelete.idServicio}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        showSnackbar('Sesión expirada', 'error');
        window.location.href = '/';
        return;
      }

      const data = await res.json();

      if (res.ok) {
        showSnackbar(data.message || 'Servicio desactivado correctamente', 'success');
        await fetchServicios();
        handleCloseDeleteDialog();
      } else {
        showSnackbar(data.message || 'Error al desactivar el servicio', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error de conexión al servidor', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getServicioColor = (nombre) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    if (!nombre) return colors[0];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const canDeleteServicio = (servicio) => {
    const hasPlanesActivos = servicio.planes?.some(p => p.estado === "ACTIVO");
    const hasCuentas = servicio.cuentas?.length > 0;
    return !hasPlanesActivos && !hasCuentas;
  };

  const formatMaxPerfiles = (value) => {
    if (value === 0 || value === '0') {
      return (
        <Chip 
          label="0" 
          size="small" 
          variant="outlined"
          sx={{ 
            fontSize: '0.65rem', 
            height: 20,
            borderColor: COLOR_PALETTE.primary + '30',
            color: COLOR_PALETTE.primary
          }}
        />
      );
    }
    return (
      <Chip 
        label={value} 
        size="small" 
        sx={{ 
          fontSize: '0.7rem', 
          height: 20,
          backgroundColor: `${COLOR_PALETTE.primary}15`,
          color: COLOR_PALETTE.primary,
        }}
      />
    );
  };

  const paginatedServicios = filteredServicios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 1, bgcolor: `${COLOR_PALETTE.dark}05`, minHeight: "100vh" }}>
      {/* Header Compacto */}
      <Paper
        sx={{
          p: 1.5,
          mb: 1.5,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%'
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            🎬 Servicios de Streaming
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
            Administra Netflix, Disney+, HBO Max y más
          </Typography>
        </Box>
      </Paper>

      {/* Controles Compactos */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={8}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add sx={{ fontSize: '1rem' }} />}
              onClick={() => handleOpenServicioForm()}
              sx={{
                background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
                borderRadius: 1,
                px: 2,
                py: 0.8,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              Nuevo Servicio
            </Button>
            <Button
              startIcon={<Refresh sx={{ fontSize: '1rem' }} />}
              onClick={fetchServicios}
              size="small"
              sx={{ ml: 1, fontSize: '0.8rem' }}
            >
              Actualizar
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar servicio o código"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
                style: { fontSize: '0.8rem' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: 'white'
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla Compacta */}
      <Paper
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} sx={{ color: COLOR_PALETTE.primary }} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', py: 0.5, backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                      Servicio
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', py: 0.5, backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                      Código
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', py: 0.5, backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                      Máx. Perfiles
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', py: 0.5, backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                      Planes
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', py: 0.5, backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', py: 0.5, backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedServicios.map(servicio => {
                    const planesActivos = servicio.planes?.filter(p => p.estado === "ACTIVO").length || 0;
                    const canDelete = canDeleteServicio(servicio);
                    
                    return (
                      <TableRow
                        key={servicio.idServicio}
                        sx={{
                          opacity: servicio.estado === 'INACTIVO' ? 0.7 : 1,
                          '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' },
                          '&:hover': { backgroundColor: `${COLOR_PALETTE.primary}10` }
                        }}
                      >
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: getServicioColor(servicio.nombre),
                                fontSize: '0.9rem'
                              }}
                            >
                              {servicio.nombre.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.75rem' }}>
                              {servicio.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5, fontFamily: 'monospace' }}>
                          {servicio.codigo}
                        </TableCell>
                        <TableCell sx={{ py: 0.5, textAlign: 'center' }}>
                          {formatMaxPerfiles(servicio.maxPerfiles)}
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip
                              icon={<CardGiftcard sx={{ fontSize: '0.7rem' }} />}
                              label={`${servicio.planes?.length || 0}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: `${COLOR_PALETTE.primary}15`,
                                color: COLOR_PALETTE.primary,
                              }}
                            />
                            {planesActivos > 0 && (
                              <Chip
                                label={`${planesActivos} act.`}
                                size="small"
                                sx={{
                                  fontSize: '0.6rem',
                                  height: 18,
                                  backgroundColor: `${COLOR_PALETTE.success}15`,
                                  color: COLOR_PALETTE.success,
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Chip
                            label={servicio.estado}
                            size="small"
                            icon={servicio.estado === 'ACTIVO' ? 
                              <CheckCircle sx={{ fontSize: '0.7rem' }} /> : 
                              <Error sx={{ fontSize: '0.7rem' }} />
                            }
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: servicio.estado === 'ACTIVO' ? 
                                `${COLOR_PALETTE.success}15` : 
                                `${COLOR_PALETTE.secondary}15`,
                              color: servicio.estado === 'ACTIVO' ? 
                                COLOR_PALETTE.success : 
                                COLOR_PALETTE.secondary,
                              border: servicio.estado === 'ACTIVO' ? 
                                `1px solid ${COLOR_PALETTE.success}30` : 
                                `1px solid ${COLOR_PALETTE.secondary}30`
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Editar servicio">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenServicioForm(servicio)}
                                disabled={servicio.estado === 'INACTIVO'}
                                sx={{
                                  color: servicio.estado === 'INACTIVO' ? 
                                    COLOR_PALETTE.dark : 
                                    COLOR_PALETTE.accent,
                                  backgroundColor: 'transparent',
                                  '&:hover': {
                                    backgroundColor: servicio.estado === 'INACTIVO' ? 
                                      '#f0f0f0' : 
                                      COLOR_PALETTE.accent,
                                    color: servicio.estado === 'INACTIVO' ? 
                                      COLOR_PALETTE.dark : 
                                      'white',
                                  },
                                  width: 28,
                                  height: 28
                                }}
                              >
                                <Edit sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={canDelete ? "Desactivar servicio" : "No se puede desactivar"}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeleteDialog(servicio)}
                                  disabled={!canDelete || servicio.estado === 'INACTIVO'}
                                  sx={{
                                    color: servicio.estado === 'INACTIVO' ? 
                                      COLOR_PALETTE.dark : 
                                      COLOR_PALETTE.secondary,
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                      backgroundColor: COLOR_PALETTE.secondary,
                                      color: 'white',
                                    },
                                    width: 28,
                                    height: 28
                                  }}
                                >
                                  <Delete sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedServicios.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
                        {servicios.length === 0 ? 'No hay servicios registrados' : 'No se encontraron servicios'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={filteredServicios.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Filas:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.75rem',
                  margin: 0
                },
                '& .MuiTablePagination-toolbar': {
                  minHeight: 40,
                  padding: '0 8px'
                }
              }}
            />
          </>
        )}
      </Paper>

      {/* FORMULARIO DE SERVICIO - IGUAL QUE PLANESLIST */}
      {openServicioForm && (
        <ServicioForm
          open={openServicioForm}
          onClose={() => {
            setOpenServicioForm(false);
            setEditingServicio(null);
          }}
          servicioData={editingServicio}
          onSave={() => {
            fetchServicios();
            showSnackbar(
              editingServicio ? "Servicio actualizado correctamente" : "Servicio creado correctamente",
              "success"
            );
          }}
        />
      )}

      {/* DIÁLOGO DE ELIMINAR */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: COLOR_PALETTE.secondary,
            color: 'white',
            fontWeight: 'bold',
            py: 1.5
          }}
        >
          🚨 Desactivar Servicio
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {servicioToDelete && (
            <>
              <Alert severity="warning" sx={{ mb: 2, py: 0.5, fontSize: '0.85rem' }}>
                Esta acción cambiará el estado del servicio a INACTIVO.
              </Alert>
              
              <Typography variant="body1" gutterBottom sx={{ fontSize: '0.85rem' }}>
                ¿Estás seguro que deseas desactivar el servicio?
              </Typography>
              
              <Box sx={{ 
                p: 1.5, 
                mt: 1.5, 
                bgcolor: '#fff8e1',
                borderRadius: 1,
                border: '1px solid #ffe082'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: getServicioColor(servicioToDelete.nombre),
                      fontSize: '0.9rem'
                    }}
                  >
                    {servicioToDelete.nombre.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                    {servicioToDelete.nombre}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Código: <strong>{servicioToDelete.codigo}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                  Máx. Perfiles: <strong>
                    {servicioToDelete.maxPerfiles === 0 ? '0 (no genera PINs)' : servicioToDelete.maxPerfiles}
                  </strong>
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <Chip 
                    label={`${servicioToDelete.planes?.length || 0} Planes`}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <Chip 
                    label={`${servicioToDelete.cuentas?.length || 0} Cuentas`}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <Chip 
                    label={`${servicioToDelete.planes?.filter(p => p.estado === "ACTIVO").length || 0} Activos`}
                    size="small"
                    color="success"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              </Box>

              {!canDeleteServicio(servicioToDelete) && (
                <Alert severity="error" sx={{ mt: 2, py: 0.5, fontSize: '0.85rem' }}>
                  No se puede desactivar este servicio porque tiene:
                  <ul style={{ margin: '4px 0 0 16px', fontSize: '0.8rem' }}>
                    {servicioToDelete.planes?.some(p => p.estado === "ACTIVO") && (
                      <li>Planes activos asociados</li>
                    )}
                    {servicioToDelete.cuentas?.length > 0 && (
                      <li>Cuentas asociadas</li>
                    )}
                  </ul>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            disabled={deleting}
            size="small"
            sx={{ fontSize: '0.8rem' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting || (servicioToDelete && !canDeleteServicio(servicioToDelete))}
            size="small"
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
            sx={{ fontSize: '0.8rem', px: 2 }}
          >
            {deleting ? 'Desactivando...' : 'Sí, Desactivar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%', fontSize: '0.85rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}