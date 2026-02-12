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
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Stack,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import {
  Edit,
  Search,
  Add,
  Delete,
  Person,
  Phone,
  WhatsApp,
  MoreVert,
  QrCode,
  Send,
  Visibility,
  Refresh,
  CheckCircle,
  Warning,
  Error,
  Language,
  Preview,
  Star,
  StarBorder,
  Business,
  Email,
  AccountCircle,
  FilterList,
  Sort
} from "@mui/icons-material";
import ClienteForm from "./ClienteForm";
import WhatsAppForm from "./WhatsAppForm";
import PaginaFormPro from "./PaginaFormPro";
import PreviewPagePro from "./PreviewPagePro";
import EnvioForm from "./EnvioForm";

// Definición de colores
const COLOR_PALETTE = {
  primary: "#667eea",
  secondary: "#f5576c",
  accent: "#EAB126",
  dark: "#040404",
  success: "#4caf50",
  warning: "#FF9800",
  info: "#2196F3"
};

export default function ClientesListPro() {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  
  // Estados para formularios
  const [openClienteForm, setOpenClienteForm] = useState(false);
  const [openWhatsAppForm, setOpenWhatsAppForm] = useState(false);
  const [openPaginaForm, setOpenPaginaForm] = useState(false);
  const [openEnvioForm, setOpenEnvioForm] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  
  // Estados para edición
  const [editingCliente, setEditingCliente] = useState(null);
  const [editingPagina, setEditingPagina] = useState({
  clienteId: null,
  estado: "activo",
  esResponsive: true,
  velocidadCarga: "normal",
  modalImageUrl: "" // ← NUEVO CAMPO AQUÍ
});

  const [previewData, setPreviewData] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Estados específicos para WhatsApp
  const [clienteParaWhatsApp, setClienteParaWhatsApp] = useState(null);
  const [whatsAppDataParaForm, setWhatsAppDataParaForm] = useState(null);
  
  // Estados para acciones
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    estado: 'todos',
    tieneWhatsApp: 'todos',
    tienePagina: 'todos',
    esPremium: 'todos'
  });
  
  // Notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Traer clientes
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/Clientes?includeDetails=true`);
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      
      setClientes(data);
      applyFiltersAndSort(data);
    } catch (err) {
      showSnackbar("Error al cargar clientes", "error");
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Aplicar filtros y ordenamiento
  const applyFiltersAndSort = (data) => {
    let filtered = [...data];
    
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(cliente =>
        cliente.nombre?.toLowerCase().includes(lower) ||
        cliente.usuario?.toLowerCase().includes(lower) ||
        cliente.empresa?.toLowerCase().includes(lower) ||
        cliente.celular?.toLowerCase().includes(lower) ||
        cliente.email?.toLowerCase().includes(lower)
      );
    }
    
    if (filters.estado !== 'todos') {
      filtered = filtered.filter(c => c.estado === filters.estado);
    }
    
    if (filters.tieneWhatsApp !== 'todos') {
      const tiene = filters.tieneWhatsApp === 'si';
      filtered = filtered.filter(c => !!c.whatsApp === tiene);
    }
    
    if (filters.tienePagina !== 'todos') {
      const tiene = filters.tienePagina === 'si';
      filtered = filtered.filter(c => !!c.pagina === tiene);
    }
    
    if (filters.esPremium !== 'todos') {
      const premium = filters.esPremium === 'si';
      filtered = filtered.filter(c => !!c.esPremium === premium);
    }
    
    setFilteredClientes(filtered);
  };

  useEffect(() => {
    applyFiltersAndSort(clientes);
  }, [search, filters, clientes]);

  // Funciones de utilidad
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleActionMenuOpen = (event, cliente) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedCliente(cliente);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  };

  // Acciones para clientes
  const handleAddCliente = () => {
    setEditingCliente(null);
    setOpenClienteForm(true);
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setOpenClienteForm(true);
  };

  const handleDeleteCliente = async (id) => {
    if (!window.confirm("¿Eliminar este cliente y todos sus datos asociados?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/Clientes/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar");
      
      await fetchClientes();
      showSnackbar("Cliente eliminado correctamente");
    } catch (err) {
      showSnackbar("Error al eliminar cliente", "error");
      console.error('Error:', err);
    }
  };

  // Acciones para WhatsApp
  const handleAddWhatsApp = (cliente) => {
    if (!cliente || !cliente.id) {
      showSnackbar("Error: No se ha seleccionado un cliente válido", "error");
      return;
    }
    
    setClienteParaWhatsApp(cliente);
    setWhatsAppDataParaForm(null);
    setOpenWhatsAppForm(true);
    handleActionMenuClose();
  };

  const handleEditWhatsApp = (cliente) => {
    if (!cliente || !cliente.id) {
      showSnackbar("Error: No se ha seleccionado un cliente válido", "error");
      return;
    }
    
    setClienteParaWhatsApp(cliente);
    setWhatsAppDataParaForm(cliente.whatsApp || null);
    setOpenWhatsAppForm(true);
    handleActionMenuClose();
  };

  // Acciones para Páginas
 // Reemplaza TODA la función handleEditPagina con esto:
const handleEditPagina = async (cliente) => {
  if (!cliente) {
    showSnackbar("No se ha seleccionado un cliente", "warning");
    return;
  }
  
  setSelectedCliente(cliente);
  
  try {
    let paginaData = null;
    
    // Si el cliente tiene página, obtener los datos COMPLETOS
    if (cliente.pagina?.id) {
      console.log("🔍 Obteniendo datos completos de la página ID:", cliente.pagina.id);
      
      const response = await fetch(`${API_BASE_URL}/ClientePaginas/${cliente.pagina.id}`);
      if (response.ok) {
        paginaData = await response.json();
        console.log("📥 Datos COMPLETOS obtenidos:", {
          id: paginaData.id,
          modalImageUrl: paginaData.modalImageUrl, // ← AQUÍ SE OBTIENE
          servicios: paginaData.serviciosPersonalizados?.length || 0,
          testimonios: paginaData.testimoniosPersonalizados?.length || 0
        });
      } else {
        console.warn("⚠️ No se pudieron obtener datos completos de la página");
        // Usar los datos básicos si falla
        paginaData = cliente.pagina;
      }
    }
    
    if (paginaData) {
      // Asegurarse de que modalImageUrl exista (aunque sea null o undefined)
      setEditingPagina({
        ...paginaData,
        modalImageUrl: paginaData.modalImageUrl || "" // ← AQUÍ SE ASEGURA
      });
    } else {
      // Crear nueva página CON EL CAMPO modalImageUrl
      setEditingPagina({
        clienteId: cliente.id,
        encabezado: `Bienvenido a ${cliente.empresa || cliente.nombre}`,
        subtitulo: "Tu éxito es nuestro compromiso",
        descripcionCorta: cliente.empresa ? `Somos ${cliente.empresa}` : "",
        cuerpo: "",
        telefono: cliente.telefono || "",
        email: cliente.email || "",
        direccion: "",
        horarioAtencion: "",
        colorFondo: "#ffffff",
        colorTexto: "#333333",
        colorPrimario: "#667eea",
        colorSecundario: "#764ba2",
        colorAcento: "#4caf50",
        tema: "claro",
        logoUrl: "",
        bannerUrl: "",
        banner2Url: "",
        banner3Url: "",
        faviconUrl: "",
        mostrarTestimonios: true,
        mostrarServicios: true,
        mostrarEquipo: false,
        mostrarBlog: false,
        mostrarContacto: false,
        mostrarMapa: false,
        mostrarAnimaciones: true,
        mostrarGalerias: true,
        mostrarVideos: true,
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
        linkedinUrl: "",
        youtubeUrl: "",
        whatsappUrl: "",
        metaTitulo: `${cliente.empresa || cliente.nombre} - Página Oficial`,
        metaDescripcion: "",
        metaKeywords: "",
        codigoAnalytics: "",
        codigoHeader: "",
        codigoFooter: "",
        estado: "activo",
        esResponsive: true,
        velocidadCarga: "normal",
        modalImageUrl: "" // ← NUEVO CAMPO INICIALIZADO AQUÍ
      });
    }
    
    setOpenPaginaForm(true);
  } catch (error) {
    console.error("❌ Error obteniendo datos de página:", error);
    // Fallback a datos básicos
    if (cliente.pagina) {
      setEditingPagina({
        ...cliente.pagina,
        modalImageUrl: cliente.pagina.modalImageUrl || "" // ← AQUÍ TAMBIÉN
      });
    } else {
      setEditingPagina({
        clienteId: cliente.id,
        estado: "activo",
        esResponsive: true,
        velocidadCarga: "normal",
        modalImageUrl: "" // ← AQUÍ TAMBIÉN
      });
    }
    setOpenPaginaForm(true);
  }
};

  // Preview de página
  const handlePreviewPagina = (cliente, paginaData = null) => {
    if (!cliente) {
      showSnackbar("No se ha seleccionado un cliente", "warning");
      return;
    }
    
    setSelectedCliente(cliente);
    
    if (paginaData) {
      setPreviewData(paginaData);
    } else if (cliente.pagina) {
      setPreviewData(cliente.pagina);
    } else {
      showSnackbar("Este cliente no tiene página configurada", "warning");
      return;
    }
    
    setOpenPreview(true);
  };

  // Ver página pública
  const handleVerPaginaPublica = (cliente) => {
    if (cliente?.pagina?.estado === "activo") {
      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}/pagina/${cliente.id}`;
      window.open(publicUrl, '_blank', 'noopener,noreferrer');
    } else {
      showSnackbar("La página no está activa o no existe", "warning");
    }
  };

  // Toggle premium status
  const handleTogglePremium = async (cliente) => {
    try {
      const updatedCliente = {
        ...cliente,
        esPremium: !cliente.esPremium
      };
      
      const res = await fetch(`${API_BASE_URL}/Clientes/${cliente.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCliente)
      });
      
      if (res.ok) {
        await fetchClientes();
        showSnackbar(
          `Cliente ${updatedCliente.esPremium ? 'ahora es Premium' : 'ya no es Premium'}`,
          'success'
        );
      }
    } catch (err) {
      showSnackbar("Error al cambiar estado premium", "error");
      console.error('Error:', err);
    }
  };

  // Obtener estado del cliente
  const getClienteStatus = (cliente) => {
    if (!cliente.estado) return { label: 'No definido', color: 'default', icon: <Warning /> };
    
    switch(cliente.estado.toLowerCase()) {
      case 'activo': return { label: 'Activo', color: 'success', icon: <CheckCircle /> };
      case 'inactivo': return { label: 'Inactivo', color: 'error', icon: <Error /> };
      case 'pendiente': return { label: 'Pendiente', color: 'warning', icon: <Warning /> };
      default: return { label: cliente.estado, color: 'default', icon: <Warning /> };
    }
  };

  // Obtener color del avatar
  const getAvatarColor = (nombre) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    if (!nombre) return colors[0];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const paginatedClientes = filteredClientes.slice(
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
            👥 Gestión de Clientes
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
            Administra todos tus clientes y sus servicios
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
              onClick={handleAddCliente}
              sx={{
                background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
                borderRadius: 1,
                px: 2,
                py: 0.8,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              Nuevo Cliente
            </Button>
            <Button
              startIcon={<Refresh sx={{ fontSize: '1rem' }} />}
              onClick={fetchClientes}
              size="small"
              sx={{ ml: 1, fontSize: '0.8rem' }}
            >
              Actualizar
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar cliente..."
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.85rem' }}>Estado</InputLabel>
              <Select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                label="Estado"
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="todos" sx={{ fontSize: '0.85rem' }}>Todos</MenuItem>
                <MenuItem value="activo" sx={{ fontSize: '0.85rem' }}>Activos</MenuItem>
                <MenuItem value="inactivo" sx={{ fontSize: '0.85rem' }}>Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.85rem' }}>WhatsApp</InputLabel>
              <Select
                value={filters.tieneWhatsApp}
                onChange={(e) => handleFilterChange('tieneWhatsApp', e.target.value)}
                label="WhatsApp"
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="todos" sx={{ fontSize: '0.85rem' }}>Todos</MenuItem>
                <MenuItem value="si" sx={{ fontSize: '0.85rem' }}>Con WhatsApp</MenuItem>
                <MenuItem value="no" sx={{ fontSize: '0.85rem' }}>Sin WhatsApp</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.85rem' }}>Página Web</InputLabel>
              <Select
                value={filters.tienePagina}
                onChange={(e) => handleFilterChange('tienePagina', e.target.value)}
                label="Página Web"
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="todos" sx={{ fontSize: '0.85rem' }}>Todos</MenuItem>
                <MenuItem value="si" sx={{ fontSize: '0.85rem' }}>Con Página</MenuItem>
                <MenuItem value="no" sx={{ fontSize: '0.85rem' }}>Sin Página</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.85rem' }}>Premium</InputLabel>
              <Select
                value={filters.esPremium}
                onChange={(e) => handleFilterChange('esPremium', e.target.value)}
                label="Premium"
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="todos" sx={{ fontSize: '0.85rem' }}>Todos</MenuItem>
                <MenuItem value="si" sx={{ fontSize: '0.85rem' }}>Premium</MenuItem>
                <MenuItem value="no" sx={{ fontSize: '0.85rem' }}>No Premium</MenuItem>
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
                      Cliente
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
                      Contacto
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      WhatsApp
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: "bold",
                      fontSize: '0.75rem',
                      py: 0.5,
                      backgroundColor: COLOR_PALETTE.primary,
                      color: 'white'
                    }}>
                      Página Web
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
                  {paginatedClientes.map(cliente => {
                    const status = getClienteStatus(cliente);
                    
                    return (
                      <TableRow
                        key={cliente.id}
                        sx={{
                          opacity: cliente.estado === 'INACTIVO' ? 0.7 : 1,
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
                                bgcolor: getAvatarColor(cliente.nombre),
                                fontSize: '0.9rem'
                              }}
                            >
                              {cliente.nombre?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.75rem' }}>
                                {cliente.nombre}
                                {cliente.esPremium && (
                                  <Star sx={{ fontSize: '0.7rem', color: '#FFD700', ml: 0.5 }} />
                                )}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                {cliente.usuario}
                              </Typography>
                              {cliente.empresa && (
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block' }}>
                                  {cliente.empresa}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Chip
                            label={status.label}
                            size="small"
                            icon={status.icon}
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: status.color === 'success' ? 
                                `${COLOR_PALETTE.success}15` : 
                                status.color === 'error' ?
                                  `${COLOR_PALETTE.secondary}15` :
                                  `${COLOR_PALETTE.warning}15`,
                              color: status.color === 'success' ? 
                                COLOR_PALETTE.success : 
                                status.color === 'error' ?
                                  COLOR_PALETTE.secondary :
                                  COLOR_PALETTE.warning,
                              border: status.color === 'success' ? 
                                `1px solid ${COLOR_PALETTE.success}30` : 
                                status.color === 'error' ?
                                  `1px solid ${COLOR_PALETTE.secondary}30` :
                                  `1px solid ${COLOR_PALETTE.warning}30`
                            }}
                          />
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ fontSize: '0.75rem' }}>
                            {cliente.celular && (
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Phone sx={{ fontSize: '0.7rem' }} />
                                {cliente.celular}
                              </Typography>
                            )}
                            {cliente.email && (
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Email sx={{ fontSize: '0.7rem' }} />
                                <Box component="span" sx={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 150
                                }}>
                                  {cliente.email}
                                </Box>
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          {cliente.whatsApp ? (
                            <Chip
                              icon={<WhatsApp sx={{ fontSize: '0.7rem' }} />}
                              label={cliente.whatsApp.estado || "activo"}
                              size="small"
                              onClick={() => handleEditWhatsApp(cliente)}
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: `${COLOR_PALETTE.success}15`,
                                color: COLOR_PALETTE.success,
                                border: `1px solid ${COLOR_PALETTE.success}30`,
                                cursor: 'pointer'
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<WhatsApp sx={{ fontSize: '0.7rem' }} />}
                              label="Agregar"
                              size="small"
                              onClick={() => handleAddWhatsApp(cliente)}
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: `${COLOR_PALETTE.dark}10`,
                                color: COLOR_PALETTE.dark,
                                border: `1px solid ${COLOR_PALETTE.dark}30`,
                                cursor: 'pointer'
                              }}
                            />
                          )}
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          {cliente.pagina ? (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Chip
                                icon={<Language sx={{ fontSize: '0.7rem' }} />}
                                label={cliente.pagina.estado || "activo"}
                                size="small"
                                onClick={() => handleEditPagina(cliente)}
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  backgroundColor: cliente.pagina.estado === "activo" ? 
                                    `${COLOR_PALETTE.success}15` : 
                                    `${COLOR_PALETTE.warning}15`,
                                  color: cliente.pagina.estado === "activo" ? 
                                    COLOR_PALETTE.success : 
                                    COLOR_PALETTE.warning,
                                  border: cliente.pagina.estado === "activo" ? 
                                    `1px solid ${COLOR_PALETTE.success}30` : 
                                    `1px solid ${COLOR_PALETTE.warning}30`,
                                  cursor: 'pointer'
                                }}
                              />
                              <Tooltip title="Ver página">
                                <IconButton
                                  size="small"
                                  onClick={() => handleVerPaginaPublica(cliente)}
                                  disabled={cliente.pagina.estado !== "activo"}
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    color: cliente.pagina.estado === "activo" ? COLOR_PALETTE.info : COLOR_PALETTE.dark
                                  }}
                                >
                                  <Visibility sx={{ fontSize: '0.7rem' }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Chip
                              icon={<Language sx={{ fontSize: '0.7rem' }} />}
                              label="Crear"
                              size="small"
                              onClick={() => handleEditPagina(cliente)}
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: `${COLOR_PALETTE.dark}10`,
                                color: COLOR_PALETTE.dark,
                                border: `1px solid ${COLOR_PALETTE.dark}30`,
                                cursor: 'pointer'
                              }}
                            />
                          )}
                        </TableCell>
                        
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {/* Botón Editar Cliente */}
                            <Tooltip title="Editar cliente">
                              <IconButton
                                size="small"
                                onClick={() => handleEditCliente(cliente)}
                                sx={{
                                  color: COLOR_PALETTE.accent,
                                  backgroundColor: 'transparent',
                                  '&:hover': {
                                    backgroundColor: COLOR_PALETTE.accent,
                                    color: 'white',
                                  },
                                  width: 28,
                                  height: 28
                                }}
                              >
                                <Edit sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>

                            {/* Botón Toggle Premium */}
                            <Tooltip title={cliente.esPremium ? "Quitar premium" : "Marcar como premium"}>
                              <IconButton
                                size="small"
                                onClick={() => handleTogglePremium(cliente)}
                                sx={{
                                  color: cliente.esPremium ? '#FFD700' : COLOR_PALETTE.dark,
                                  backgroundColor: 'transparent',
                                  '&:hover': {
                                    backgroundColor: cliente.esPremium ? '#FFD700' : COLOR_PALETTE.dark,
                                    color: 'white',
                                  },
                                  width: 28,
                                  height: 28
                                }}
                              >
                                {cliente.esPremium ? (
                                  <Star sx={{ fontSize: '0.9rem' }} />
                                ) : (
                                  <StarBorder sx={{ fontSize: '0.9rem' }} />
                                )}
                              </IconButton>
                            </Tooltip>

                            {/* Botón Más Acciones */}
                            <Tooltip title="Más acciones">
                              <IconButton
                                size="small"
                                onClick={(e) => handleActionMenuOpen(e, cliente)}
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
                                <MoreVert sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedClientes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
                        {clientes.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes'}
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
              count={filteredClientes.length}
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

      {/* Menu de Acciones */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: { 
            width: 200,
            fontSize: '0.85rem'
          }
        }}
      >
        <MenuItem onClick={() => handleEditCliente(selectedCliente)} sx={{ fontSize: '0.85rem' }}>
          <Edit fontSize="small" sx={{ mr: 1, fontSize: '0.85rem' }} /> Editar Cliente
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (!selectedCliente || !selectedCliente.id) return;
          if (selectedCliente?.whatsApp) {
            handleEditWhatsApp(selectedCliente);
          } else {
            handleAddWhatsApp(selectedCliente);
          }
        }} sx={{ fontSize: '0.85rem' }}>
          <WhatsApp fontSize="small" sx={{ mr: 1, fontSize: '0.85rem' }} />
          {selectedCliente?.whatsApp ? 'Editar WhatsApp' : 'Agregar WhatsApp'}
        </MenuItem>
        
        <MenuItem onClick={() => handleEditPagina(selectedCliente)} sx={{ fontSize: '0.85rem' }}>
          <Language fontSize="small" sx={{ mr: 1, fontSize: '0.85rem' }} />
          {selectedCliente?.pagina ? 'Editar Página' : 'Crear Página'}
        </MenuItem>
        
        <MenuItem onClick={() => handlePreviewPagina(selectedCliente)} sx={{ fontSize: '0.85rem' }}>
          <Preview fontSize="small" sx={{ mr: 1, fontSize: '0.85rem' }} /> Preview
        </MenuItem>
        
        <MenuItem onClick={() => {
          setSelectedCliente(selectedCliente);
          setOpenEnvioForm(true);
          handleActionMenuClose();
        }} sx={{ fontSize: '0.85rem' }}>
          <Send fontSize="small" sx={{ mr: 1, fontSize: '0.85rem' }} /> Enviar Credenciales
        </MenuItem>
        
        <MenuItem onClick={() => handleTogglePremium(selectedCliente)} sx={{ fontSize: '0.85rem' }}>
          <Star fontSize="small" sx={{ mr: 1, fontSize: '0.85rem' }} />
          {selectedCliente?.esPremium ? 'Quitar Premium' : 'Premium'}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleDeleteCliente(selectedCliente?.id)} 
          sx={{ fontSize: '0.85rem', color: COLOR_PALETTE.secondary }}
        >
          <Delete fontSize="small" sx={{ mr: 1, fontSize: '0.85rem' }} /> Eliminar
        </MenuItem>
      </Menu>

      {/* FORMULARIO DE CLIENTE */}
      {openClienteForm && (
        <ClienteForm
          open={openClienteForm}
          onClose={() => setOpenClienteForm(false)}
          clienteData={editingCliente}
          onSave={() => {
            fetchClientes();
            setOpenClienteForm(false);
            showSnackbar(
              editingCliente ? "Cliente actualizado correctamente" : "Cliente creado correctamente",
              "success"
            );
          }}
        />
      )}

      {/* FORMULARIO DE WHATSAPP */}
      {openWhatsAppForm && clienteParaWhatsApp && (
        <WhatsAppForm
          key={`whatsapp-${clienteParaWhatsApp.id}-${Date.now()}`}
          open={openWhatsAppForm}
          onClose={() => {
            setOpenWhatsAppForm(false);
            setClienteParaWhatsApp(null);
            setWhatsAppDataParaForm(null);
          }}
          whatsAppData={whatsAppDataParaForm}
          cliente={clienteParaWhatsApp}
          onSave={() => {
            fetchClientes();
            setOpenWhatsAppForm(false);
            setClienteParaWhatsApp(null);
            setWhatsAppDataParaForm(null);
            showSnackbar("WhatsApp configurado correctamente", "success");
          }}
        />
      )}

      {/* FORMULARIO DE PÁGINA PRO */}
      {openPaginaForm && (
        <PaginaFormPro
          open={openPaginaForm}
          onClose={() => setOpenPaginaForm(false)}
          paginaData={editingPagina}
          cliente={selectedCliente}
          onSave={() => {
            fetchClientes();
            setOpenPaginaForm(false);
            showSnackbar(editingPagina ? "Página actualizada" : "Página creada");
          }}
          onPreview={(paginaData) => handlePreviewPagina(selectedCliente, paginaData)}
        />
      )}

      {/* PREVIEW DE PÁGINA */}
      {openPreview && (
        <PreviewPagePro
          open={openPreview}
          onClose={() => setOpenPreview(false)}
          paginaData={previewData}
          cliente={selectedCliente}
          isPreview={true}
        />
      )}

      {/* FORMULARIO DE ENVÍO DE CREDENCIALES */}
      {openEnvioForm && selectedCliente && (
        <EnvioForm
          open={openEnvioForm}
          onClose={() => {
            setOpenEnvioForm(false);
            setSelectedCliente(null);
          }}
          cliente={selectedCliente}
          onEnviar={() => {
            fetchClientes();
            showSnackbar("Credenciales enviadas correctamente", "success");
          }}
        />
      )}

      {/* Snackbar para notificaciones */}
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