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
  InputAdornment,
  Card,
  CardContent,
  //useTheme,
} from "@mui/material";
import { Edit, Add, Search, Security, CheckCircle, Cancel } from "@mui/icons-material";
import UserForm from "./UserForm";

export default function UserList({ loggedUser }) {
  //const theme = useTheme();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Traer empleados con usuarios
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Usuarios/GetEmpleadosUsuarios`);
      if (!res.ok) throw new Error("Error al cargar empleados");
      const data = await res.json();
      setEmployees(
        data.map(emp => ({
          idempleado: emp.idempleado,
          nombre: emp.nombre,
          apellido: emp.apellido_paterno,
          codusuario: emp.codusuario ?? "",
          tiporol: emp.rol ?? "",
          estado: emp.estado ?? true,
          idusuario: emp.idusuario ?? 0
        }))
      );
    } catch (err) {
      console.error(err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Traer roles (TIPOROL)
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Parametro/GetParametro/TIPOROL`);
      if (!res.ok) throw new Error("Error al cargar roles");
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  // Crear usuario nuevo
  const handleCreateUser = (employee) => {
    setEditingUser({
      idempleado: employee.idempleado,
      codusuario: "",
      password: "",
      tiporol: "",
      estado: true,
      idusuario: 0
    });
    setOpenForm(true);
  };

  // Editar usuario existente
  const handleEditUser = (employee) => {
    setEditingUser({ ...employee });
    setOpenForm(true);
  };

  // Guardar usuario
  const handleSave = async () => {
    await fetchEmployees();
    setOpenForm(false);
  };

  // Filtrar empleados basado en la búsqueda
  const filteredEmployees = employees.filter(emp => 
    emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
    emp.apellido.toLowerCase().includes(search.toLowerCase()) ||
    emp.codusuario.toLowerCase().includes(search.toLowerCase())
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
              👤 Gestión de Usuarios
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              Administra los usuarios y permisos del sistema
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Security sx={{ fontSize: '1.2rem' }} />
          </Box>
        </Box>
      </Paper>

      {/* Controles Compactos */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.9rem' }}>
              Lista de Empleados/Usuarios
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar empleado o usuario"
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
                    {["ID", "Nombre", "Apellido", "Usuario", "Rol", "Estado", "Acciones"].map(
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
                      key={emp.idempleado}
                      sx={{ 
                        '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' },
                        '&:hover': { backgroundColor: '#e3f2fd' }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        {emp.idempleado}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 'medium' }}>
                        {emp.nombre}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        {emp.apellido}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        {emp.codusuario ? (
                          <Chip 
                            label={emp.codusuario} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ fontSize: '0.7rem' }}>
                            Sin usuario
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        {emp.tiporol ? (
                          <Chip 
                            label={
                              roles.find(r => String(r.idparametro) === String(emp.tiporol))
                                ?.descparametro || emp.tiporol
                            } 
                            size="small" 
                            color="secondary"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ fontSize: '0.7rem' }}>
                            Sin rol
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip 
                          icon={emp.estado ? <CheckCircle sx={{ fontSize: '0.8rem' }} /> : <Cancel sx={{ fontSize: '0.8rem' }} />}
                          label={emp.estado ? "Activo" : "Inactivo"} 
                          size="small" 
                          color={emp.estado ? "success" : "error"}
                          variant={emp.estado ? "filled" : "outlined"}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        {emp.idusuario && emp.idusuario !== 0 ? (
                          <IconButton 
                            size="small"
                            onClick={() => handleEditUser(emp)}
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
                        ) : (
                          <IconButton 
                            size="small"
                            onClick={() => handleCreateUser(emp)}
                            sx={{
                              color: '#4caf50',
                              backgroundColor: 'transparent',
                              '&:hover': {
                                backgroundColor: '#4caf50',
                                color: 'white',
                              },
                              width: 28,
                              height: 28
                            }}
                          >
                            <Add sx={{ fontSize: '0.9rem' }} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
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

      {/* Formulario de Usuario */}
      {openForm && (
        <UserForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          userData={editingUser}
          onSave={handleSave}
          loggedUser={loggedUser}
        />
      )}
    </Box>
  );
}