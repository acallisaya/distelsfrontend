import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  TablePagination,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Plus, Info, Search, Settings } from "lucide-react";
import { API_BASE_URL } from "../config";
import ParametrosList from "./ParametrosList";

export default function TiposParametros() {
  const [tipos, setTipos] = useState([]);
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [newId, setNewId] = useState("");
  const [newDetalle, setNewDetalle] = useState("");
  const [selectedTipo, setSelectedTipo] = useState(null);

  // 🔹 Cargar lista de tipos
  const fetchTipos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Parametro/GetDetalleParametros`);
      if (!res.ok) throw new Error("Error al cargar tipos");
      const data = await res.json();
      const tiposData = Array.isArray(data) ? data : [];
      setTipos(tiposData);
      setFilteredTipos(tiposData);
    } catch (err) {
      console.error(err);
      setTipos([]);
      setFilteredTipos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  // 🔹 Filtro de búsqueda
  useEffect(() => {
    if (!search) {
      setFilteredTipos(tipos);
    } else {
      const lower = search.toLowerCase();
      const filtered = tipos.filter(t =>
        t.id_detalle.toLowerCase().includes(lower) ||
        t.detalle.toLowerCase().includes(lower)
      );
      setFilteredTipos(filtered);
    }
    setPage(0);
  }, [search, tipos]);

  // 🔹 Guardar nuevo tipo
  const handleSaveTipo = async () => {
    if (!newId.trim() || !newDetalle.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/Parametro/AddDetalleParametro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_detalle: newId.toUpperCase(),
          detalle: newDetalle,
        }),
      });

      const result = await res.json().catch(() => null);
      console.log("📌 Respuesta backend:", res.status, result);

      if (!res.ok) throw new Error(result?.message || "Error al guardar tipo");

      await fetchTipos();
      setNewId("");
      setNewDetalle("");
      setOpenForm(false);
    } catch (err) {
      console.error("❌ Error guardando tipo:", err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTipos = filteredTipos.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  // 👉 Si ya seleccionaste un tipo, mostramos ParametrosList
  if (selectedTipo) {
    return <ParametrosList tipo={selectedTipo} onBack={() => setSelectedTipo(null)} />;
  }

  return (
    <Box sx={{ p: 1, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header Compacto */}
      <Paper 
        sx={{ 
          p: 1.5, 
          mb: 1.5, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
              ⚙️ Gestión de Tipos de Parámetros
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              Administra los diferentes tipos de parámetros del sistema
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Settings size={20} />
          </Box>
        </Box>
      </Paper>

      {/* Controles Compactos */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => setOpenForm(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 1,
                px: 2,
                py: 0.8,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              Nuevo Tipo
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar tipo de parámetro"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
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

      {/* Banner de ayuda compacto */}
      <Box
        sx={{
          bgcolor: '#e3f2fd',
          border: '1px solid #90caf9',
          color: '#1565c0',
          p: 1,
          borderRadius: 1,
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontStyle: 'italic',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
        }}
      >
        <Info size={16} />
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          Haga doble clic en un tipo de parámetro para ver o crear sus detalles
        </Typography>
      </Box>

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
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["ID", "Detalle", "Acciones"].map(
                      col => (
                        <TableCell 
                          key={col} 
                          sx={{ 
                            fontWeight: "bold",
                            fontSize: '0.75rem',
                            py: 0.5,
                            backgroundColor: '#667eea',
                            color: 'white'
                          }}
                        >
                          {col}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTipos.map((t) => (
                    <TableRow
                      key={t.id_detalle}
                      hover
                      onDoubleClick={() => setSelectedTipo(t.id_detalle)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' },
                        '&:hover': { backgroundColor: '#e3f2fd' }
                      }}
                    >
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip 
                          label={t.id_detalle} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20, fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        {t.detalle}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedTipo(t.id_detalle)}
                          sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 'medium',
                            fontSize: '0.7rem',
                            py: 0.2,
                            px: 1.5
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedTipos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
                        {tipos.length === 0 ? 'No hay tipos de parámetros registrados' : 'No se encontraron tipos de parámetros'}
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
              count={filteredTipos.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
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

      {/* Modal nuevo tipo - Compacto */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 'bold',
          py: 1.5,
          fontSize: '1rem'
        }}>
          Nuevo Tipo de Parámetro
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="ID del Tipo"
                fullWidth
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                variant="outlined"
                size="small"
                helperText="El ID se guardará en mayúsculas"
                sx={{ fontSize: '0.8rem' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Detalle del Tipo"
                fullWidth
                value={newDetalle}
                onChange={(e) => setNewDetalle(e.target.value)}
                variant="outlined"
                size="small"
                multiline
                rows={2}
                sx={{ fontSize: '0.8rem' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 1.5, gap: 1 }}>
          <Button 
            onClick={() => setOpenForm(false)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 1, fontSize: '0.8rem' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveTipo} 
            variant="contained" 
            color="primary"
            size="small"
            disabled={!newId.trim() || !newDetalle.trim()}
            sx={{ 
              borderRadius: 1,
              px: 2,
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}