import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, IconButton, CircularProgress, TextField,
  Grid, Chip, TablePagination, InputAdornment, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar
} from '@mui/material';
import {
  Add, Search, Edit, Delete, Visibility, Refresh,
  CheckCircle, Error, CardGiftcard, People
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';

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
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [servicioToDelete, setServicioToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    maxPerfiles: 0  // CAMBIO: Valor inicial 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

 const fetchServicios = async () => {
  try {
    setLoading(true);
    
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      showSnackbar('No hay sesión activa', 'error');
      return;
    }

    const res = await fetch(`${API_BASE_URL}/Servicios`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (res.ok) {
      const data = await res.json();
      setServicios(data);
      setFilteredServicios(data);
    } else if (res.status === 401) {
      showSnackbar('Sesión expirada, inicia sesión nuevamente', 'error');
      // Redirigir al login
      window.location.href = '/';
    } else {
      const error = await res.text();
      showSnackbar(`Error ${res.status}: ${error}`, 'error');
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

  const handleOpenDialog = (servicio = null) => {
    if (servicio) {
      setEditingServicio(servicio);
      setFormData({
        nombre: servicio.nombre,
        codigo: servicio.codigo,
        maxPerfiles: servicio.maxPerfiles ?? 0  // CAMBIO: Usar 0 como valor por defecto
      });
    } else {
      setEditingServicio(null);
      setFormData({
        nombre: '',
        codigo: '',
        maxPerfiles: 0  // CAMBIO: Valor inicial 0
      });
    }
    setFormErrors({});
    setOpenDialog(true);
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

  const handleDelete = async () => {
    if (!servicioToDelete) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Servicios/${servicioToDelete.idServicio}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (res.ok) {
        showSnackbar(data.message || 'Servicio desactivado correctamente', 'success');
        fetchServicios();
        handleCloseDeleteDialog();
      } else {
        showSnackbar(data.message || 'Error al desactivar el servicio', 'error');
      }
    } catch  {
      showSnackbar('Error de conexión al servidor', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 50) {
      errors.nombre = 'El nombre no puede exceder 50 caracteres';
    }
    
    if (!formData.codigo.trim()) {
      errors.codigo = 'El código es requerido';
    } else if (formData.codigo.length > 10) {
      errors.codigo = 'El código no puede exceder 10 caracteres';
    }
    
    if (formData.maxPerfiles < 0) {
      errors.maxPerfiles = 'El valor no puede ser negativo';
    } else if (formData.maxPerfiles > 99) {
      errors.maxPerfiles = 'El valor máximo es 99';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = editingServicio 
        ? `${API_BASE_URL}/Servicios/${editingServicio.idServicio}`
        : `${API_BASE_URL}/Servicios`;
      
      const method = editingServicio ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxPerfiles: formData.maxPerfiles || 0  // Asegurar que sea 0 si está vacío
        })
      });

      if (res.ok) {
        showSnackbar(
          editingServicio ? 'Servicio actualizado' : 'Servicio creado',
          'success'
        );
        fetchServicios();
        setOpenDialog(false);
      } else {
        const error = await res.json();
        showSnackbar(error.message || 'Error al guardar', 'error');
      }
    } catch  {
      showSnackbar('Error al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Para maxPerfiles, convertir a número o 0
    if (name === 'maxPerfiles') {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0 : numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const paginatedServicios = filteredServicios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
              onClick={() => handleOpenDialog()}
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
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      Servicio
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      Código
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      Máx. Perfiles
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      Planes
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
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
                                onClick={() => handleOpenDialog(servicio)}
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
                      <TableCell colSpan={7} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
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

      {/* Diálogo de Crear/Editar */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
            color: 'white',
            fontWeight: 'bold',
            py: 1.5
          }}
        >
          {editingServicio ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Servicio *"
              name="nombre"
              size="small"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Netflix, Disney+, HBO Max"
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              InputProps={{ style: { fontSize: '0.85rem' } }}
              InputLabelProps={{ style: { fontSize: '0.85rem' } }}
              FormHelperTextProps={{ style: { fontSize: '0.75rem' } }}
            />
            <TextField
              fullWidth
              label="Código *"
              name="codigo"
              size="small"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Ej: NETFLIX, DISNEY, HBO"
              error={!!formErrors.codigo}
              helperText={formErrors.codigo}
              InputProps={{ style: { fontSize: '0.85rem' } }}
              InputLabelProps={{ style: { fontSize: '0.85rem' } }}
              FormHelperTextProps={{ style: { fontSize: '0.75rem' } }}
            />
            <TextField
              fullWidth
              label="Máximo de Perfiles"
              name="maxPerfiles"
              type="number"
              size="small"
              value={formData.maxPerfiles}
              onChange={handleChange}
              error={!!formErrors.maxPerfiles}
              helperText={formErrors.maxPerfiles || "0 = no genera PINs ni perfiles en tarjetas"}
              InputProps={{ 
                inputProps: { min: 0, max: 99 }, // CAMBIO: min: 0
                style: { fontSize: '0.85rem' }
              }}
              InputLabelProps={{ style: { fontSize: '0.85rem' } }}
              FormHelperTextProps={{ style: { fontSize: '0.75rem' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            disabled={loading}
            size="small"
            sx={{ fontSize: '0.8rem' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            size="small"
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{
              background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
              fontSize: '0.8rem',
              px: 2
            }}
          >
            {editingServicio ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmación de Desactivación */}
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