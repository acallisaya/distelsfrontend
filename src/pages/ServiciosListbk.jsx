import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importar esto
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
  Avatar
} from "@mui/material";
import { Edit, Search, Add, Delete, AccountCircle, CreditCard } from "@mui/icons-material";
import ServicioForm from "./ServicioForm";

export default function ServiciosList({ loggedUser }) {
  const navigate = useNavigate(); // ✅ Esto es de React Router, no de tu API
  
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ FUNCIÓN PARA IR A CUENTAS
  const verCuentas = (servicio) => {
  console.log('=== DEBUG NAVEGACIÓN ===');
  console.log('Servicio ID:', servicio.id);
  console.log('Ruta actual (window.location):', window.location.pathname);
  console.log('URL objetivo 1 (absoluta):', `/CuentasList?servicio=${servicio.id}`);
  console.log('URL objetivo 2 (relativa):', `CuentasList?servicio=${servicio.id}`);
  
  // Prueba con URL absoluta
   navigate(`../CuentasList?servicio=${servicio.id}`);
};

  // ✅ FUNCIÓN PARA IR A TARJETAS
  const verTarjetas = (servicio) => {
    navigate(`/tarjetas?servicio=${servicio.id}`);
  };

  // Traer servicios
  const fetchServicios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Servicios`);
      if (!res.ok) throw new Error("Error al cargar servicios");
      const data = await res.json();

      setServicios(data);
      setFilteredServicios(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  // Filtro
  useEffect(() => {
    if (!search) {
      setFilteredServicios(servicios);
    } else {
      const lower = search.toLowerCase();
      const filtered = servicios.filter(serv =>
        serv.nombre?.toLowerCase().includes(lower) ||
        serv.plan?.toLowerCase().includes(lower)
      );
      setFilteredServicios(filtered);
    }
    setPage(0);
  }, [search, servicios]);

  // Acciones Servicios
  const handleAddServicio = () => {
    setEditingServicio(null);
    setOpenForm(true);
  };

  const handleEditServicio = (servicio) => {
    setEditingServicio(servicio);
    setOpenForm(true);
  };

  const handleDeleteServicio = async (id) => {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/Servicios/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar");
      
      await fetchServicios();
    } catch (err) {
      console.error('Error:', err);
      alert("Error al eliminar");
    }
  };

  const handleSaveServicio = async () => {
    await fetchServicios();
    setOpenForm(false);
    setEditingServicio(null);
  };

  const getEstadoColor = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      default: return 'default';
    }
  };

  const paginatedServicios = filteredServicios.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 1, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2, bgcolor: '#667eea', color: 'white' }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            🎬 Servicios Disponibles
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
            Gestiona los servicios de streaming
          </Typography>
        </Box>
      </Paper>

      {/* Controles */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={8}>
            <Button 
              variant="contained" 
              size="small"
              startIcon={<Add />}
              onClick={handleAddServicio}
              sx={{
                bgcolor: '#667eea',
                borderRadius: 1,
                px: 2,
                py: 0.8
              }}
            >
              Nuevo Servicio
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar servicio..."
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Servicio</strong></TableCell>
                    <TableCell><strong>Plan</strong></TableCell>
                    <TableCell><strong>Vigencia</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedServicios.map(servicio => (
                    <TableRow key={servicio.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: getServiceColor(servicio.nombre),
                            color: 'white'
                          }}>
                            {servicio.nombre.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {servicio.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{servicio.plan}</TableCell>
                      <TableCell>{servicio.vigencia}</TableCell>
                      <TableCell>
                        <Chip 
                          label={servicio.estado} 
                          size="small" 
                          color={getEstadoColor(servicio.estado)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {/* ✅ BOTÓN CUENTAS - Llama a verCuentas */}
                          <Button
                            size="small"
                            startIcon={<AccountCircle />}
                            onClick={() => verCuentas(servicio)} // ✅ Aquí usa la función
                            variant="outlined"
                            sx={{ minWidth: '90px' }}
                          >
                            Cuentas
                          </Button>
                          
                          {/* BOTÓN TARJETAS */}
                          <Button
                            size="small"
                            startIcon={<CreditCard />}
                            onClick={() => verTarjetas(servicio)}
                            variant="outlined"
                            sx={{ minWidth: '90px' }}
                          >
                            Tarjetas
                          </Button>
                          
                          <IconButton size="small" onClick={() => handleEditServicio(servicio)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteServicio(servicio.id)} color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={filteredServicios.length}
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

      {/* Formulario Servicio */}
      {openForm && (
        <ServicioForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          servicioData={editingServicio}
          onSave={handleSaveServicio}
          loggedUser={loggedUser}
        />
      )}
    </Box>
  );
}

function getServiceColor(serviceName) {
  const colors = {
    'netflix': '#e50914',
    'disney': '#0063e5',
    'hbo': '#3d3d3d',
    'amazon': '#00a8e1',
    'spotify': '#1db954'
  };
  
  const lower = serviceName?.toLowerCase() || '';
  for (const [key, color] of Object.entries(colors)) {
    if (lower.includes(key)) return color;
  }
  return '#9e9e9e';
}