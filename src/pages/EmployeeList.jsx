import React, { useState, useEffect } from "react";
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
  InputAdornment
} from "@mui/material";
import { Edit, Search, Add } from "@mui/icons-material";
import EmployeeForm from "./EmployeeForm";

export default function EmployeeList({ loggedUser }) {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Traer empleados
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Empleado/GetEmpleados`);
      if (!res.ok) throw new Error("Error al cargar empleados");
      const data = await res.json();

      console.log('Datos recibidos de la API:', data); // Para debug

      // Mapear los datos de la API al formato que espera el formulario (con prefijo re_)
      const normalized = data.map(emp => ({
        re_id_empleado: emp.id_empleado,
        re_nombre: emp.nombre,
        re_apellido_paterno: emp.apellido_paterno,
        re_apellido_materno: emp.apellido_materno,
        re_ci: emp.ci,
        re_fecha_nacimiento: emp.fecha_nacimiento,
        re_par_genero: emp.genero,
        re_par_pais: emp.pais,
        re_par_ciudad: emp.ciudad,
        re_email: emp.email,
        re_celular: emp.celular,
        re_direccion: emp.direccion,
        re_fecha_ingreso: emp.fecha_ingreso,
        re_par_turno: emp.turno,
      }));

      setEmployees(normalized);
      setFilteredEmployees(normalized);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filtro de búsqueda
  useEffect(() => {
    if (!search) {
      setFilteredEmployees(employees);
    } else {
      const lower = search.toLowerCase();
      const filtered = employees.filter(emp =>
        emp.re_nombre?.toLowerCase().includes(lower) ||
        emp.re_apellido_paterno?.toLowerCase().includes(lower) ||
        emp.re_apellido_materno?.toLowerCase().includes(lower) ||
        emp.re_email?.toLowerCase().includes(lower) ||
        emp.re_ci?.toLowerCase().includes(lower)
      );
      setFilteredEmployees(filtered);
    }
    setPage(0);
  }, [search, employees]);

  const handleAdd = () => {
    setEditingEmployee(null);
    setOpenForm(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setOpenForm(true);
  };

  const handleSave = async () => {
    await fetchEmployees();
    setOpenForm(false);
    setEditingEmployee(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedEmployees = filteredEmployees.slice(
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
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            👥 Gestión de Empleados
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
            Administra la información de los empleados
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
              onClick={handleAdd}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 1,
                px: 2,
                py: 0.8,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              Nuevo Empleado
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar empleado"
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
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["ID", "Nombre", "Apellidos", "CI", "Género", "Correo", "Turno", "Acciones"].map(
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
                  {paginatedEmployees.map(emp => (
                    <TableRow 
                      key={emp.re_id_empleado}
                      sx={{ 
                        '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' },
                        '&:hover': { backgroundColor: '#e3f2fd' }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        {emp.re_id_empleado}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 'medium' }}>
                        {emp.re_nombre}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        {emp.re_apellido_paterno} {emp.re_apellido_materno}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        {emp.re_ci}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip 
                          label={emp.re_par_genero === 'M' ? 'Masculino' : 'Femenino'} 
                          size="small" 
                          color={emp.re_par_genero === 'M' ? 'primary' : 'secondary'} 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5, maxWidth: 150 }}>
                        <Typography noWrap sx={{ fontSize: '0.75rem' }}>
                          {emp.re_email}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip 
                          label={emp.re_par_turno} 
                          size="small" 
                          color="default"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(emp)}
                          sx={{
                            color: '#2196f3',
                            backgroundColor: 'transparent',
                            '&:hover': {
                              backgroundColor: '#2196f3',
                              color: 'white',
                            },
                            width: 28,
                            height: 28
                          }}
                        >
                          <Edit sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
                        {employees.length === 0 ? 'No hay empleados registrados' : 'No se encontraron empleados'}
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
              count={filteredEmployees.length}
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
        <EmployeeForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          employeeData={editingEmployee}
          onSave={handleSave}
          loggedUser={loggedUser}
        />
      )}
    </Box>
  );
}