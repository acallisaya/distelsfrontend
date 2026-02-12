import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, IconButton, CircularProgress, TextField,
  Grid, Chip, TablePagination, InputAdornment, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Stack
} from '@mui/material';
import {
  Add, Search, Edit, Delete, Refresh, QrCode,
  Visibility, CheckCircle, Error, CardGiftcard, Timer, AttachMoney
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';

// Definición de colores
const COLOR_PALETTE = {
  primary: "#764ba2",
  secondary: "#f5576c",
  accent: "#EAB126",
  dark: "#040404",
  success: "#4caf50",
  info: "#667eea"
};

export default function PlanesList() {
  const [planes, setPlanes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filteredPlanes, setFilteredPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('todos');
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGenerarDialog, setOpenGenerarDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planParaGenerar, setPlanParaGenerar] = useState(null);
  const [planParaEliminar, setPlanParaEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    idServicio: '',
    nombre: '',
    duracionDias: 30,
    precioCompra: 0,
    precioVenta: 0
  });
  const [generarData, setGenerarData] = useState({
    cantidad: 10,
    prefijoLote: 'LOTE'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Planes`);
      if (res.ok) {
        const data = await res.json();
        setPlanes(data);
        setFilteredPlanes(data);
      }
    } catch  {
      showSnackbar('Error al cargar planes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicios = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Servicios`);
      if (res.ok) {
        const data = await res.json();
        setServicios(data);
      }
    } catch (err) {
      console.error('Error cargando servicios:', err);
    }
  };

  useEffect(() => {
    fetchPlanes();
    fetchServicios();
  }, []);

  useEffect(() => {
    let filtered = [...planes];
    
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.nombre.toLowerCase().includes(lower) ||
        plan.servicio?.nombre.toLowerCase().includes(lower)
      );
    }
    
    if (selectedServicio !== 'todos') {
      filtered = filtered.filter(plan => 
        plan.idServicio === parseInt(selectedServicio)
      );
    }

    if (selectedEstado !== 'todos') {
      filtered = filtered.filter(plan => 
        plan.estado === selectedEstado
      );
    }
    
    setFilteredPlanes(filtered);
    setPage(0);
  }, [search, selectedServicio, selectedEstado, planes]);

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        idServicio: plan.idServicio,
        nombre: plan.nombre,
        duracionDias: plan.duracionDias,
        precioCompra: plan.precioCompra,
        precioVenta: plan.precioVenta
      });
    } else {
      setEditingPlan(null);
      setFormData({
        idServicio: '',
        nombre: '',
        duracionDias: 30,
        precioCompra: 0,
        precioVenta: 0
      });
    }
    setOpenDialog(true);
  };

  const handleOpenGenerarDialog = (plan) => {
    setPlanParaGenerar(plan);
    setGenerarData({
      cantidad: 10,
      prefijoLote: `LOTE-${plan.servicio?.codigo || 'GEN'}`
    });
    setOpenGenerarDialog(true);
  };

  const handleOpenDeleteDialog = (plan) => {
    setPlanParaEliminar(plan);
    setOpenDeleteDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.idServicio || !formData.nombre || !formData.precioVenta) {
      showSnackbar('Complete todos los campos requeridos', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = editingPlan 
        ? `${API_BASE_URL}/Planes/${editingPlan.idPlan}`
        : `${API_BASE_URL}/Planes`;
      
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showSnackbar(
          editingPlan ? 'Plan actualizado' : 'Plan creado',
          'success'
        );
        fetchPlanes();
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

  const handleGenerarTarjetas = async () => {
    if (!planParaGenerar || !generarData.cantidad || generarData.cantidad < 1) {
      showSnackbar('Ingrese una cantidad válida', 'error');
      return;
    }

    if (generarData.cantidad > 1000) {
      showSnackbar('La cantidad máxima es 1000 tarjetas', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Planes/${planParaGenerar.idPlan}/generar-tarjetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generarData)
      });

      const result = await res.json();
      
      if (result.success) {
        showSnackbar(`Generadas ${result.tarjetasGeneradas} tarjetas`, 'success');
        setOpenGenerarDialog(false);
        fetchPlanes();
      } else {
        showSnackbar(result.message || 'Error al generar', 'error');
      }
    } catch  {
      showSnackbar('Error al generar tarjetas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!planParaEliminar) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Planes/${planParaEliminar.idPlan}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (res.ok) {
        showSnackbar(data.message || 'Plan desactivado correctamente', 'success');
        fetchPlanes();
        setOpenDeleteDialog(false);
      } else {
        showSnackbar(data.message || 'Error al desactivar el plan', 'error');
      }
    } catch {
      showSnackbar('Error de conexión al servidor', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerarChange = (e) => {
    setGenerarData({
      ...generarData,
      [e.target.name]: e.target.value
    });
  };

  const getServicioNombre = (idServicio) => {
    const servicio = servicios.find(s => s.idServicio === idServicio);
    return servicio?.nombre || 'Desconocido';
  };

  const calcularGanancia = (plan) => {
    return plan.precioVenta - plan.precioCompra;
  };

  const canDeletePlan = (plan) => {
    const hasTarjetas = plan.tarjetas?.length > 0;
    return !hasTarjetas;
  };

  const paginatedPlanes = filteredPlanes.slice(
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
            📦 Planes de Servicios
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
            Crea y gestiona planes para cada servicio
          </Typography>
        </Box>
      </Paper>

      {/* Controles Compactos */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={6}>
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
              Nuevo Plan
            </Button>
            <Button
              startIcon={<Refresh sx={{ fontSize: '1rem' }} />}
              onClick={fetchPlanes}
              size="small"
              sx={{ ml: 1, fontSize: '0.8rem' }}
            >
              Actualizar
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar plan o servicio..."
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

      {/* Filtros Adicionales */}
      <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.85rem' }}>Servicio</InputLabel>
              <Select
                value={selectedServicio}
                onChange={(e) => setSelectedServicio(e.target.value)}
                label="Servicio"
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="todos" sx={{ fontSize: '0.85rem' }}>Todos los servicios</MenuItem>
                {servicios.map(servicio => (
                  <MenuItem key={servicio.idServicio} value={servicio.idServicio} sx={{ fontSize: '0.85rem' }}>
                    {servicio.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.85rem' }}>Estado</InputLabel>
              <Select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                label="Estado"
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="todos" sx={{ fontSize: '0.85rem' }}>Todos</MenuItem>
                <MenuItem value="ACTIVO" sx={{ fontSize: '0.85rem' }}>Activos</MenuItem>
                <MenuItem value="INACTIVO" sx={{ fontSize: '0.85rem' }}>Inactivos</MenuItem>
              </Select>
            </FormControl>
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
                      Plan
                    </TableCell>
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
                      Duración
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      Precios
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      Tarjetas
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
                  {paginatedPlanes.map(plan => {
                    const canDelete = canDeletePlan(plan);
                    const servicioNombre = getServicioNombre(plan.idServicio);
                    
                    return (
                      <TableRow
                        key={plan.idPlan}
                        sx={{
                          opacity: plan.estado === 'INACTIVO' ? 0.7 : 1,
                          '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' },
                          '&:hover': { backgroundColor: `${COLOR_PALETTE.primary}10` }
                        }}
                      >
                        <TableCell sx={{ py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.75rem' }}>
                            {plan.nombre}
                          </Typography>
                          {plan.estado === 'INACTIVO' && (
                            <Chip 
                              label="INACTIVO" 
                              size="small"
                              sx={{ 
                                mt: 0.5, 
                                fontSize: '0.6rem',
                                height: 16,
                                backgroundColor: `${COLOR_PALETTE.secondary}15`,
                                color: COLOR_PALETTE.secondary,
                              }}
                            />
                          )}
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Chip 
                            label={servicioNombre}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: `${COLOR_PALETTE.info}15`,
                              color: COLOR_PALETTE.info,
                              border: `1px solid ${COLOR_PALETTE.info}30`
                            }}
                          />
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Timer sx={{ fontSize: '0.7rem', color: COLOR_PALETTE.primary }} />
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {plan.duracionDias} días
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              Compra: <strong>Bs. {plan.precioCompra.toFixed(2)}</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLOR_PALETTE.success }}>
                              Venta: <strong>Bs. {plan.precioVenta.toFixed(2)}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                              Ganancia: Bs. {calcularGanancia(plan).toFixed(2)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip
                              icon={<CardGiftcard sx={{ fontSize: '0.7rem' }} />}
                              label={`${plan.tarjetas?.length || 0}`}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: `${COLOR_PALETTE.secondary}15`,
                                color: COLOR_PALETTE.secondary,
                              }}
                            />
                            {plan.tarjetas?.some(t => t.estado === 'GENERADA') && (
                              <Chip 
                                label="Pendientes"
                                size="small"
                                sx={{
                                  fontSize: '0.6rem',
                                  height: 18,
                                  backgroundColor: `${COLOR_PALETTE.accent}15`,
                                  color: COLOR_PALETTE.accent,
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Chip
                            label={plan.estado}
                            size="small"
                            icon={plan.estado === 'ACTIVO' ? 
                              <CheckCircle sx={{ fontSize: '0.7rem' }} /> : 
                              <Error sx={{ fontSize: '0.7rem' }} />
                            }
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: plan.estado === 'ACTIVO' ? 
                                `${COLOR_PALETTE.success}15` : 
                                `${COLOR_PALETTE.secondary}15`,
                              color: plan.estado === 'ACTIVO' ? 
                                COLOR_PALETTE.success : 
                                COLOR_PALETTE.secondary,
                              border: plan.estado === 'ACTIVO' ? 
                                `1px solid ${COLOR_PALETTE.success}30` : 
                                `1px solid ${COLOR_PALETTE.secondary}30`
                            }}
                          />
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {/* Botón Generar Tarjetas */}
                            <Tooltip title="Generar tarjetas">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenGenerarDialog(plan)}
                                disabled={plan.estado === 'INACTIVO'}
                                sx={{
                                  color: COLOR_PALETTE.info,
                                  backgroundColor: 'transparent',
                                  '&:hover': {
                                    backgroundColor: COLOR_PALETTE.info,
                                    color: 'white',
                                  },
                                  width: 28,
                                  height: 28
                                }}
                              >
                                <QrCode sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>

                            {/* Botón Editar */}
                            <Tooltip title="Editar plan">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(plan)}
                                sx={{
                                  color: plan.estado === 'INACTIVO' ? 
                                    COLOR_PALETTE.dark : 
                                    COLOR_PALETTE.accent,
                                  backgroundColor: 'transparent',
                                  '&:hover': {
                                    backgroundColor: plan.estado === 'INACTIVO' ? 
                                      '#f0f0f0' : 
                                      COLOR_PALETTE.accent,
                                    color: plan.estado === 'INACTIVO' ? 
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

                            {/* Botón Ver Tarjetas */}
                            <Tooltip title="Ver tarjetas">
                              <IconButton
                                size="small"
                                onClick={() => window.location.href = `/planes/${plan.idPlan}/tarjetas`}
                                sx={{
                                  color: COLOR_PALETTE.primary,
                                  backgroundColor: 'transparent',
                                  '&:hover': {
                                    backgroundColor: COLOR_PALETTE.primary,
                                    color: 'white',
                                  },
                                  width: 28,
                                  height: 28
                                }}
                              >
                                <Visibility sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>

                            {/* Botón Desactivar */}
                            <Tooltip title={canDelete ? "Desactivar plan" : "No se puede desactivar"}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeleteDialog(plan)}
                                  disabled={!canDelete || plan.estado === 'INACTIVO'}
                                  sx={{
                                    color: plan.estado === 'INACTIVO' ? 
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
                  {paginatedPlanes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
                        {planes.length === 0 ? 'No hay planes registrados' : 'No se encontraron planes'}
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
              count={filteredPlanes.length}
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

      {/* Diálogo de Crear/Editar Plan */}
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
          {editingPlan ? '✏️ Editar Plan' : '➕ Nuevo Plan'}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ fontSize: '0.85rem' }}>Servicio</InputLabel>
              <Select
                name="idServicio"
                value={formData.idServicio}
                onChange={handleChange}
                label="Servicio"
                sx={{ fontSize: '0.85rem' }}
              >
                {servicios.map(servicio => (
                  <MenuItem key={servicio.idServicio} value={servicio.idServicio} sx={{ fontSize: '0.85rem' }}>
                    {servicio.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Nombre del Plan *"
              name="nombre"
              size="small"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Plan 30 días, 1 Pantalla, etc."
              InputProps={{ style: { fontSize: '0.85rem' } }}
              InputLabelProps={{ style: { fontSize: '0.85rem' } }}
            />
            
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duración (días) *"
                  name="duracionDias"
                  type="number"
                  size="small"
                  value={formData.duracionDias}
                  onChange={handleChange}
                  InputProps={{ 
                    inputProps: { min: 1, max: 365 },
                    style: { fontSize: '0.85rem' }
                  }}
                  InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Precio de Compra *"
                  name="precioCompra"
                  type="number"
                  size="small"
                  value={formData.precioCompra}
                  onChange={handleChange}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.01 },
                    style: { fontSize: '0.85rem' }
                  }}
                  InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Precio de Venta *"
                  name="precioVenta"
                  type="number"
                  size="small"
                  value={formData.precioVenta}
                  onChange={handleChange}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.01 },
                    style: { fontSize: '0.85rem' }
                  }}
                  InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ganancia"
                  size="small"
                  value={(formData.precioVenta - formData.precioCompra).toFixed(2)}
                  InputProps={{
                    readOnly: true,
                    sx: { 
                      color: COLOR_PALETTE.success, 
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }
                  }}
                  InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                />
              </Grid>
            </Grid>
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
            {editingPlan ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Generar Tarjetas */}
      <Dialog 
        open={openGenerarDialog} 
        onClose={() => setOpenGenerarDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle
          sx={{
            background: COLOR_PALETTE.info,
            color: 'white',
            fontWeight: 'bold',
            py: 1.5
          }}
        >
          🎫 Generar Tarjetas
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {planParaGenerar && (
            <Box sx={{ 
              mb: 2, 
              p: 1.5, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                {planParaGenerar.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Servicio: {getServicioNombre(planParaGenerar.idServicio)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Duración: {planParaGenerar.duracionDias} días
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <TextField
              fullWidth
              label="Cantidad de Tarjetas *"
              name="cantidad"
              type="number"
              size="small"
              value={generarData.cantidad}
              onChange={handleGenerarChange}
              InputProps={{ 
                inputProps: { min: 1, max: 1000 },
                style: { fontSize: '0.85rem' }
              }}
              InputLabelProps={{ style: { fontSize: '0.85rem' } }}
              helperText="Máximo 1000 tarjetas por lote"
              FormHelperTextProps={{ style: { fontSize: '0.75rem' } }}
            />
            
            <TextField
              fullWidth
              label="Prefijo del Lote"
              name="prefijoLote"
              size="small"
              value={generarData.prefijoLote}
              onChange={handleGenerarChange}
              placeholder="Ej: LOTE-NETFLIX"
              InputProps={{ style: { fontSize: '0.85rem' } }}
              InputLabelProps={{ style: { fontSize: '0.85rem' } }}
            />
            
            <Alert severity="info" sx={{ mt: 1, py: 0.5, fontSize: '0.85rem' }}>
              Se generarán {generarData.cantidad} tarjetas con códigos únicos de 15 dígitos.
              Cada tarjeta incluirá un código QR para activación.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button 
            onClick={() => setOpenGenerarDialog(false)} 
            disabled={loading}
            size="small"
            sx={{ fontSize: '0.8rem' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerarTarjetas}
            disabled={loading}
            size="small"
            startIcon={loading ? <CircularProgress size={16} /> : <QrCode />}
            sx={{
              background: COLOR_PALETTE.info,
              fontSize: '0.8rem',
              px: 2
            }}
          >
            {loading ? 'Generando...' : 'Generar Tarjetas'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmación de Desactivación */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
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
          🚨 Desactivar Plan
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {planParaEliminar && (
            <>
              <Alert severity="warning" sx={{ mb: 2, py: 0.5, fontSize: '0.85rem' }}>
                Esta acción cambiará el estado del plan a INACTIVO.
              </Alert>
              
              <Typography variant="body1" gutterBottom sx={{ fontSize: '0.85rem' }}>
                ¿Estás seguro que deseas desactivar este plan?
              </Typography>
              
              <Box sx={{ 
                p: 1.5, 
                mt: 1.5, 
                bgcolor: '#fff8e1',
                borderRadius: 1,
                border: '1px solid #ffe082'
              }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                  {planParaEliminar.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Servicio: {getServicioNombre(planParaEliminar.idServicio)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Duración: {planParaEliminar.duracionDias} días
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <Chip 
                    label={`${planParaEliminar.tarjetas?.length || 0} Tarjetas`}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <Chip 
                    label={`$${planParaEliminar.precioVenta.toFixed(2)}`}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 20, color: COLOR_PALETTE.success }}
                  />
                </Box>
              </Box>

              {!canDeletePlan(planParaEliminar) && (
                <Alert severity="error" sx={{ mt: 2, py: 0.5, fontSize: '0.85rem' }}>
                  No se puede desactivar este plan porque tiene tarjetas generadas.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
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
            disabled={deleting || (planParaEliminar && !canDeletePlan(planParaEliminar))}
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