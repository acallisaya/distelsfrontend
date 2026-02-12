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
  IconButton,
  Button,
  CircularProgress,
  Grid,
  Chip,
  TablePagination,
} from "@mui/material";
import { Edit, Plus, ArrowLeft, Settings } from "lucide-react";
import { API_BASE_URL } from "../config";
import ParametrosForm from "./ParametrosForm";

export default function ParametrosList({ tipo, onBack }) {
  const [parametros, setParametros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editingParametro, setEditingParametro] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // 🔹 Cargar parámetros según tipo recibido
  const fetchParametros = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Parametro/GetParametro/${tipo}`);
      if (!res.ok) throw new Error("Error al cargar parámetros");
      const data = await res.json();
      setParametros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setParametros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tipo) {
      fetchParametros();
    }
  }, [tipo]);

  const handleCreate = () => {
    setEditingParametro(null);
    setOpenForm(true);
  };

  const handleEdit = (param) => {
    setEditingParametro(param);
    setOpenForm(true);
  };

  const handleSave = async () => {
    await fetchParametros();
    setOpenForm(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedParametros = parametros.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: 1, 
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={18} />
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                ⚙️ Parámetros del Sistema
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                Tipo: <strong>{tipo}</strong> • Gestión de parámetros y configuraciones
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Controles Compactos */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={6}>
            <Button 
              onClick={onBack}
              variant="outlined"
              size="small"
              startIcon={<ArrowLeft size={16} />}
              sx={{
                borderRadius: 1,
                px: 2,
                py: 0.8,
                fontWeight: 'bold',
                fontSize: '0.8rem',
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderColor: '#667eea'
                }
              }}
            >
              Volver a Tipos
            </Button>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleCreate}
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 1,
                px: 2,
                py: 0.8,
                fontWeight: 'bold',
                fontSize: '0.8rem',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Nuevo Parámetro
            </Button>
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
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["ID", "Descripción", "Estado", "Acciones"].map((col) => (
                      <TableCell 
                        key={col} 
                        sx={{ 
                          fontWeight: "bold",
                          fontSize: '0.75rem',
                          py: 0.5,
                          backgroundColor: '#667eea',
                          color: 'white',
                          textAlign: 'center'
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedParametros.map((p, index) => (
                    <TableRow 
                      key={p.idparametro}
                      sx={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        '&:hover': { 
                          backgroundColor: '#f0f4ff',
                        }
                      }}
                    >
                      <TableCell sx={{ 
                        textAlign: 'center', 
                        fontWeight: 'bold', 
                        color: '#667eea',
                        fontSize: '0.75rem',
                        py: 0.5
                      }}>
                        {p.idparametro}
                      </TableCell>
                      <TableCell sx={{ 
                        textAlign: 'center', 
                        color: '#2c3e50',
                        fontSize: '0.75rem',
                        py: 0.5
                      }}>
                        {p.descparametro}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                        <Chip 
                          label={p.estado === "1" ? "Activo" : "Inactivo"} 
                          size="small"
                          sx={{
                            backgroundColor: p.estado === "1" ? '#4caf50' : '#f44336',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 20,
                            minWidth: 70
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(p)}
                          sx={{
                            color: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            '&:hover': {
                              backgroundColor: '#667eea',
                              color: 'white',
                            },
                            width: 28,
                            height: 28
                          }}
                        >
                          <Edit size={14} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedParametros.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          No se encontraron parámetros
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Haz clic en "Nuevo Parámetro" para crear el primero
                        </Typography>
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
              count={parametros.length}
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

      {openForm && (
        <ParametrosForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          parametro={editingParametro}
          tipoparametro={tipo}
          onSave={handleSave}
        />
      )}
    </Box>
  );
}