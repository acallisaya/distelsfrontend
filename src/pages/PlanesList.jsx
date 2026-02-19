import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, IconButton, CircularProgress, TextField,
  Grid, Chip, TablePagination, InputAdornment, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Add, Search, Edit, Delete, Refresh, CardGiftcard, Timer, AttachMoney,
  CheckCircle, Error
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import PlanForm from './PlanForm'; // 👈 Importamos el nuevo componente

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
  const [filteredPlanes, setFilteredPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('todos');
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  
  // Estados para diálogos (IGUAL QUE EN ClientesListPro)
  const [openPlanForm, setOpenPlanForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planParaEliminar, setPlanParaEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Función para obtener headers con token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showSnackbar('Sesión expirada', 'error');
      window.location.href = '/';
      return false;
    }
    return true;
  };

  const fetchPlanes = async () => {
    if (!checkToken()) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Planes?includeDetails=true`, {
        headers: getAuthHeaders()
      });
      
      if (res.status === 401) {
        showSnackbar('Sesión expirada', 'error');
        window.location.href = '/';
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setPlanes(data);
        setFilteredPlanes(data);
      } else {
        showSnackbar('Error al cargar planes', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al cargar planes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    if (!planes.length) return;
    
    let filtered = [...planes];
    
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.nombre.toLowerCase().includes(lower) ||
        plan.servicio?.nombre?.toLowerCase().includes(lower)
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

  const handleOpenPlanForm = (plan = null) => {
    setEditingPlan(plan);
    setOpenPlanForm(true);
  };

  const handleOpenDeleteDialog = (plan) => {
    setPlanParaEliminar(plan);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!planParaEliminar) return;
    if (!checkToken()) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Planes/${planParaEliminar.idPlan}`, {
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
        showSnackbar(data.message || 'Plan desactivado correctamente', 'success');
        await fetchPlanes();
        setOpenDeleteDialog(false);
        setPlanParaEliminar(null);
      } else {
        showSnackbar(data.message || 'Error al desactivar el plan', 'error');
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

  const canDeletePlan = (plan) => {
    const hasTarjetas = plan.tarjetas?.length > 0;
    return !hasTarjetas;
  };

  // Obtener servicios únicos para filtros
  const serviciosUnicos = [];
  const serviciosMap = new Map();
  planes.forEach(plan => {
    if (plan.servicio && !serviciosMap.has(plan.servicio.idServicio)) {
      serviciosMap.set(plan.servicio.idServicio, true);
      serviciosUnicos.push({
        id: plan.servicio.idServicio,
        nombre: plan.servicio.nombre
      });
    }
  });

  const paginatedPlanes = filteredPlanes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 1, bgcolor: `${COLOR_PALETTE.dark}05`, minHeight: "100vh" }}>
      {/* Header */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2, background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`, color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          📦 Planes de Servicios
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
          Crea y gestiona planes para cada servicio
        </Typography>
      </Paper>

      {/* Controles */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add sx={{ fontSize: '1rem' }} />}
              onClick={() => handleOpenPlanForm()}
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
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: '1rem' }} /></InputAdornment>,
                style: { fontSize: '0.8rem' }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Filtros */}
      <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.85rem' }}>Servicio</InputLabel>
              <Select
                value={selectedServicio}
                onChange={(e) => setSelectedServicio(e.target.value)}
                label="Servicio"
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="todos">Todos los servicios</MenuItem>
                {serviciosUnicos.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
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
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ACTIVO">Activos</MenuItem>
                <MenuItem value="INACTIVO">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>Servicio</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>Duración</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>Precios</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>Tarjetas</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '0.75rem', backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPlanes.map(plan => (
                    <TableRow key={plan.idPlan} hover>
                      <TableCell sx={{ py: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 'medium' }}>{plan.nombre}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip label={plan.servicio?.nombre || 'Desconocido'} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Timer sx={{ fontSize: '0.7rem' }} />
                          <Typography sx={{ fontSize: '0.75rem' }}>{plan.duracionDias} días</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem' }}>Bs. {plan.precioVenta?.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip icon={<CardGiftcard sx={{ fontSize: '0.7rem' }} />} label={plan.tarjetas?.length || 0} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip
                          label={plan.estado}
                          size="small"
                          icon={plan.estado === 'ACTIVO' ? <CheckCircle sx={{ fontSize: '0.7rem' }} /> : <Error sx={{ fontSize: '0.7rem' }} />}
                          sx={{
                            fontSize: '0.7rem',
                            height: 20,
                            backgroundColor: plan.estado === 'ACTIVO' ? `${COLOR_PALETTE.success}15` : `${COLOR_PALETTE.secondary}15`,
                            color: plan.estado === 'ACTIVO' ? COLOR_PALETTE.success : COLOR_PALETTE.secondary
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenPlanForm(plan)} disabled={plan.estado === 'INACTIVO'}>
                              <Edit sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={canDeletePlan(plan) ? "Desactivar" : "No se puede desactivar"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(plan)}
                                disabled={!canDeletePlan(plan) || plan.estado === 'INACTIVO'}
                              >
                                <Delete sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedPlanes.length === 0 && (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No hay planes</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={filteredPlanes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </Paper>

      {/* FORMULARIO DE PLAN - IGUAL QUE ClientesListPro */}
      {openPlanForm && (
        <PlanForm
          open={openPlanForm}
          onClose={() => {
            setOpenPlanForm(false);
            setEditingPlan(null);
          }}
          planData={editingPlan}
          servicios={serviciosUnicos}
          onSave={() => {
            fetchPlanes();
            showSnackbar(
              editingPlan ? "Plan actualizado correctamente" : "Plan creado correctamente",
              "success"
            );
          }}
        />
      )}

      {/* DIÁLOGO DE ELIMINAR */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: COLOR_PALETTE.secondary, color: 'white' }}>
          🚨 Desactivar Plan
        </DialogTitle>
        <DialogContent>
          {planParaEliminar && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>Esta acción cambiará el estado del plan a INACTIVO.</Alert>
              <Typography>¿Estás seguro que deseas desactivar el plan?</Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
                <Typography variant="subtitle2">{planParaEliminar.nombre}</Typography>
                <Typography variant="body2">Servicio: {planParaEliminar.servicio?.nombre}</Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={deleting}>Cancelar</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Desactivando...' : 'Sí, Desactivar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}