import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, IconButton, CircularProgress, TextField,
  Grid, Chip, TablePagination, InputAdornment, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, FormControl, InputLabel, Select, MenuItem,
  Stack, Switch, FormControlLabel, Badge, Collapse,
  alpha, LinearProgress
} from '@mui/material';
import {
  Search, Refresh, Print, Download,
  ContentCopy, Visibility, PersonPin, CalendarToday,
  ExpandMore, ExpandLess, TableChart, Description,
  CheckCircle, Error, Warning
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { API_BASE_URL } from '../config';
import { differenceInDays, format, isBefore, addDays, parseISO } from 'date-fns';

// Definición de colores
const COLOR_PALETTE = {
  primary: "#667eea",
  secondary: "#f5576c",
  accent: "#EAB126",
  dark: "#040404",
  success: "#4caf50",
  info: "#2196f3",
  warning: "#ff9800",
  error: "#f44336"
};

export default function TarjetasList() {
  const [tarjetas, setTarjetas] = useState([]);
  const [filteredTarjetas, setFilteredTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [selectedLote, setSelectedLote] = useState('todos');
  const [selectedServicio, setSelectedServicio] = useState('todos');
  const [selectedVendedor, setSelectedVendedor] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [lotes, setLotes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [selectedTarjetas, setSelectedTarjetas] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportRange, setExportRange] = useState('filtered');
  const [showOnlyNearExpiration, setShowOnlyNearExpiration] = useState(false);
  const [diasParaVencimiento, setDiasParaVencimiento] = useState(7);
  const [cantidadVencidos, setCantidadVencidos] = useState(0);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [cargaCompleta, setCargaCompleta] = useState(false);
  
  // Nuevo estado para estadísticas
  const [stats, setStats] = useState({
    total: 0,
    generadas: 0,
    asignadas: 0,
    activadas: 0,
    vencidas: 0,
    utilizadas: 0,
    inconsistencias: 0
  });

  const estados = [
    { value: 'GENERADA', label: 'Generada', color: 'default', icon: '🔄', description: 'Creada pero no asignada a nadie' },
    { value: 'ASIGNADA', label: 'Asignada', color: 'info', icon: '👤', description: 'Asignada a vendedor o cliente, no activada' },
    { value: 'ACTIVADA', label: 'Activada', color: 'success', icon: '✅', description: 'Activada por el cliente - En uso' },
    { value: 'VENCIDA', label: 'Vencida', color: 'error', icon: '⏰', description: 'No activada antes de fecha de vencimiento' },
    { value: 'UTILIZADA', label: 'Utilizada', color: 'warning', icon: '🎬', description: 'Tiempo completamente consumido' }
  ];

  // =================== FUNCIONES DE AUTENTICACIÓN ===================
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const checkAuth = () => {
    const token = getToken();
    if (!token) {
      showSnackbar('No hay sesión activa', 'error');
      window.location.href = '/';
      return false;
    }
    return true;
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  };

  // =================== FUNCIONES AUXILIARES ===================
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const getEstadoLabel = (estado) => {
    const estadoObj = estados.find(e => e.value === estado);
    return estadoObj?.label || estado;
  };

  const getEstadoColor = (estado) => {
    const estadoObj = estados.find(e => e.value === estado);
    return estadoObj?.color || 'default';
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

  // Función CORREGIDA para calcular estado real
  const calcularEstadoReal = useCallback((tarjeta) => {
    try {
      const ahora = new Date();
      
      // Parsear fechas de forma segura
      const fechaVenc = tarjeta.fechaVencimiento ? parseISO(tarjeta.fechaVencimiento) : null;
      const fechaAct = tarjeta.fechaActivacion ? parseISO(tarjeta.fechaActivacion) : null;
      
      console.log('📅 Calculando estado para tarjeta:', {
        id: tarjeta.idTarjeta,
        fechaVenc: tarjeta.fechaVencimiento,
        fechaAct: tarjeta.fechaActivacion,
        estadoOriginal: tarjeta.estado,
        vendedor: tarjeta.vendedor,
        clienteFinal: tarjeta.clienteFinal
      });
      
      // 1. Si está activada
      if (fechaAct) {
        const duracionDias = tarjeta.plan?.duracionDias || 30;
        const fechaFinUso = addDays(fechaAct, duracionDias);
        
        if (isBefore(fechaFinUso, ahora)) {
          console.log('🔄 Estado: UTILIZADA (tiempo agotado)');
          return 'UTILIZADA';
        }
        console.log('✅ Estado: ACTIVADA (en uso)');
        return 'ACTIVADA';
      }
      
      // 2. Si no está activada y está vencida
      if (fechaVenc && isBefore(fechaVenc, ahora)) {
        console.log('⏰ Estado: VENCIDA (no activada a tiempo)');
        return 'VENCIDA';
      }
      
      // 3. Si está asignada
      if (tarjeta.vendedor || tarjeta.clienteFinal) {
        console.log('👤 Estado: ASIGNADA (tiene asignación)');
        return 'ASIGNADA';
      }
      
      // 4. Por defecto, generada
      console.log('🔄 Estado: GENERADA (sin asignar)');
      return 'GENERADA';
      
    } catch (error) {
      console.error('❌ Error calculando estado:', error);
      return tarjeta.estado || 'GENERADA';
    }
  }, []);

  const calcularDiasRestantes = (fechaVencimiento, fechaActivacion = null) => {
    try {
      if (!fechaVencimiento) return null;
      
      const ahora = new Date();
      const fechaVenc = parseISO(fechaVencimiento);
      
      // Si está activada, calcular días desde activación
      if (fechaActivacion) {
        const fechaAct = parseISO(fechaActivacion);
        const fechaFinUso = addDays(fechaAct, 30);
        return differenceInDays(fechaFinUso, ahora);
      }
      
      // Si no está activada, calcular días hasta vencimiento
      return differenceInDays(fechaVenc, ahora);
    } catch (error) {
      console.error('Error calculando días:', error);
      return null;
    }
  };

  const getColorDiasRestantes = (dias) => {
    if (dias === null || dias === undefined) return COLOR_PALETTE.info;
    if (dias < 0) return COLOR_PALETTE.error;
    if (dias <= 3) return COLOR_PALETTE.warning;
    if (dias <= 7) return COLOR_PALETTE.accent;
    return COLOR_PALETTE.success;
  };

  const isSeleccionable = (tarjeta) => {
    return tarjeta.estadoReal === 'GENERADA' || tarjeta.estadoReal === 'ASIGNADA';
  };

  const toggleSeleccion = (tarjetaId) => {
    if (selectedTarjetas.includes(tarjetaId)) {
      setSelectedTarjetas(selectedTarjetas.filter(id => id !== tarjetaId));
    } else {
      const tarjeta = tarjetas.find(t => t.idTarjeta === tarjetaId);
      if (tarjeta && isSeleccionable(tarjeta)) {
        setSelectedTarjetas([...selectedTarjetas, tarjetaId]);
      }
    }
  };

  const seleccionarTodas = () => {
    const seleccionables = filteredTarjetas
      .filter(t => isSeleccionable(t))
      .map(t => t.idTarjeta);
    setSelectedTarjetas(seleccionables);
  };

  const limpiarSeleccion = () => {
    setSelectedTarjetas([]);
  };

  const handleCopyCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    showSnackbar('Código copiado al portapapeles', 'info');
  };

  const handleCopyCredenciales = (tarjeta) => {
    if (tarjeta.credenciales?.cuenta) {
      const credenciales = `Usuario: ${tarjeta.credenciales.cuenta.usuario}\nContraseña: ${tarjeta.credenciales.cuenta.contrasena}${tarjeta.credenciales.perfil?.nombre ? `\nPerfil: ${tarjeta.credenciales.perfil.nombre}` : ''}${tarjeta.credenciales.perfil?.pin ? `\nPIN: ${tarjeta.credenciales.perfil.pin}` : ''}`;
      navigator.clipboard.writeText(credenciales);
      showSnackbar('Credenciales copiadas al portapapeles', 'info');
    }
  };

  // =================== FUNCIONES DE DATOS ===================
  const fetchTarjetasDetalladas = async () => {
    try {
      if (!checkAuth()) return;
      
      setLoading(true);
      setCargaCompleta(false);
      console.log('🔍 Iniciando carga de tarjetas...');
      
      let allTarjetas = [];
      let currentPage = 1;
      let totalPages = 1;
      let totalItems = 0;
      
      // Cargar todas las páginas
      do {
        console.log(`📄 Cargando página ${currentPage}...`);
        
        const res = await fetch(`${API_BASE_URL}/Tarjetas/detalladas?page=${currentPage}&pageSize=100`, {
          method: 'GET',
          headers: getHeaders()
        });
        
        if (res.status === 401) {
          showSnackbar('Sesión expirada, inicia sesión nuevamente', 'error');
          window.location.href = '/';
          return;
        }
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log(`📊 Respuesta página ${currentPage}:`, {
          success: data.success,
          cantidad: data.data?.length,
          pagination: data.pagination
        });
        
        if (data.success && data.data) {
          allTarjetas = [...allTarjetas, ...data.data];
          
          if (data.pagination) {
            totalPages = data.pagination.totalPages || 1;
            totalItems = data.pagination.totalItems || data.data.length;
          } else {
            // Si no hay paginación en la respuesta
            if (data.data.length < 100) {
              totalPages = currentPage; // Última página
            }
          }
        } else {
          console.error('❌ Error en respuesta:', data.message);
          break;
        }
        
        currentPage++;
        
        // Pequeño delay para no saturar
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } while (currentPage <= totalPages);
      
      console.log('✅ Carga completada. Total tarjetas:', allTarjetas.length);
      
      // Procesar tarjetas
      const tarjetasProcesadas = allTarjetas.map(tarjeta => {
        const estadoReal = calcularEstadoReal(tarjeta);
        const diasParaVencimiento = calcularDiasRestantes(tarjeta.fechaVencimiento, tarjeta.fechaActivacion);
        const estadoInconsistente = tarjeta.estado !== estadoReal;
        
        return {
          ...tarjeta,
          estadoReal,
          estadoOriginal: tarjeta.estado,
          diasParaVencimiento,
          estadoInconsistente,
          estaVencidaReal: estadoReal === 'VENCIDA'
        };
      });
      
      setTarjetas(tarjetasProcesadas);
      setFilteredTarjetas(tarjetasProcesadas);
      setCargaCompleta(true);
      
      // Calcular estadísticas
      const estadisticas = {
        total: tarjetasProcesadas.length,
        generadas: tarjetasProcesadas.filter(t => t.estadoReal === 'GENERADA').length,
        asignadas: tarjetasProcesadas.filter(t => t.estadoReal === 'ASIGNADA').length,
        activadas: tarjetasProcesadas.filter(t => t.estadoReal === 'ACTIVADA').length,
        vencidas: tarjetasProcesadas.filter(t => t.estadoReal === 'VENCIDA').length,
        utilizadas: tarjetasProcesadas.filter(t => t.estadoReal === 'UTILIZADA').length,
        inconsistencias: tarjetasProcesadas.filter(t => t.estadoInconsistente).length,
        asignadasConVendedor: tarjetasProcesadas.filter(t => 
          t.estadoReal === 'ASIGNADA' && t.vendedor
        ).length,
        asignadasConCliente: tarjetasProcesadas.filter(t => 
          t.estadoReal === 'ASIGNADA' && t.clienteFinal
        ).length
      };
      
      setStats(estadisticas);
      setCantidadVencidos(estadisticas.vencidas);
      
      // Calcular lotes únicos
      const lotesUnicos = [...new Set(tarjetasProcesadas.map(t => t.lote))].filter(Boolean);
      setLotes(lotesUnicos);
      
      if (estadisticas.inconsistencias > 0) {
        showSnackbar(
          `⚠️ Se encontraron ${estadisticas.inconsistencias} tarjetas con estado inconsistente. Se muestra el estado corregido.`,
          'warning'
        );
      }
      
      showSnackbar(`✅ Cargadas ${tarjetasProcesadas.length} tarjetas`, 'success');
      
    } catch (error) {
      console.error('❌ Error crítico al cargar tarjetas:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicios = async () => {
    try {
      if (!checkAuth()) return;
      
      console.log('🔄 Cargando servicios...');
      const res = await fetch(`${API_BASE_URL}/Servicios`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (res.status === 401) {
        showSnackbar('Sesión expirada, inicia sesión nuevamente', 'error');
        window.location.href = '/';
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setServicios(data);
        console.log('✅ Servicios cargados:', data.length);
      }
    } catch (err) {
      console.error('Error cargando servicios:', err);
    }
  };

  const fetchVendedores = async () => {
    try {
      if (!checkAuth()) return;
      
      console.log('🔄 Cargando vendedores...');
      const res = await fetch(`${API_BASE_URL}/Clientes/tipo/VENDEDOR`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (res.status === 401) {
        showSnackbar('Sesión expirada, inicia sesión nuevamente', 'error');
        window.location.href = '/';
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setVendedores(data.data || []);
        console.log('✅ Vendedores cargados:', (data.data || []).length);
      }
    } catch (err) {
      console.error('Error cargando vendedores:', err);
    }
  };

  // =================== FUNCIONES DE FILTRADO ===================
  const aplicarFiltros = useCallback(() => {
    let filtered = [...tarjetas];
    
    console.log('🔍 Aplicando filtros...', {
      total: tarjetas.length,
      filtros: {
        search,
        selectedEstado,
        selectedLote,
        selectedServicio,
        selectedVendedor,
        showOnlyNearExpiration,
        diasParaVencimiento
      }
    });
    
    // Filtro de búsqueda
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(tarjeta =>
        tarjeta.codigo?.toLowerCase().includes(lower) ||
        tarjeta.serie?.toLowerCase().includes(lower) ||
        tarjeta.plan?.servicio?.nombre?.toLowerCase().includes(lower) ||
        tarjeta.plan?.nombre?.toLowerCase().includes(lower) ||
        tarjeta.clienteFinal?.nombre?.toLowerCase().includes(lower) ||
        tarjeta.clienteFinal?.celular?.toLowerCase().includes(lower) ||
        tarjeta.credenciales?.cuenta?.usuario?.toLowerCase().includes(lower) ||
        tarjeta.vendedor?.nombre?.toLowerCase().includes(lower)
      );
    }
    
    // Filtro de estado
    if (selectedEstado !== 'todos') {
      filtered = filtered.filter(t => t.estadoReal === selectedEstado);
    }
    
    // Filtro de lote
    if (selectedLote !== 'todos') {
      filtered = filtered.filter(t => t.lote === selectedLote);
    }
    
    // Filtro de servicio
    if (selectedServicio !== 'todos') {
      filtered = filtered.filter(t => t.plan?.servicio?.idServicio === parseInt(selectedServicio));
    }
    
    // Filtro de vendedor
    if (selectedVendedor !== 'todos') {
      filtered = filtered.filter(t => t.vendedor?.id === parseInt(selectedVendedor));
    }
    
    // Filtro de próximas a vencer
    if (showOnlyNearExpiration) {
      filtered = filtered.filter(t => {
        const diasRestantes = t.diasParaVencimiento;
        return diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= diasParaVencimiento;
      });
    }
    
    console.log('✅ Filtros aplicados. Resultados:', filtered.length);
    setFilteredTarjetas(filtered);
    setPage(0);
  }, [tarjetas, search, selectedEstado, selectedLote, selectedServicio, 
      selectedVendedor, showOnlyNearExpiration, diasParaVencimiento]);

  // =================== FUNCIONES DE EXPORTACIÓN ===================
  const exportToExcel = () => {
    const dataToExport = getDataToExport();
    
    if (dataToExport.length === 0) {
      showSnackbar('No hay datos para exportar', 'warning');
      return;
    }

    const excelData = dataToExport.map(tarjeta => {
      const fechaGen = tarjeta.fechaCreacion ? parseISO(tarjeta.fechaCreacion) : null;
      const fechaAct = tarjeta.fechaActivacion ? parseISO(tarjeta.fechaActivacion) : null;
      const fechaVenc = tarjeta.fechaVencimiento ? parseISO(tarjeta.fechaVencimiento) : null;
      const diasRestantes = tarjeta.diasParaVencimiento;
      
      return {
        'ID': tarjeta.idTarjeta,
        'Código': tarjeta.codigo,
        'Serie': tarjeta.serie,
        'Lote': tarjeta.lote || '',
        'Estado (Corregido)': getEstadoLabel(tarjeta.estadoReal),
        'Estado (Original)': getEstadoLabel(tarjeta.estadoOriginal),
        'Servicio': tarjeta.plan?.servicio?.nombre || 'N/A',
        'Plan': tarjeta.plan?.nombre || 'N/A',
        'Usuario': tarjeta.credenciales?.cuenta?.usuario || '',
        'Contraseña': tarjeta.credenciales?.cuenta?.contrasena || '',
        'Perfil': tarjeta.credenciales?.perfil?.nombre || '',
        'PIN': tarjeta.credenciales?.perfil?.pin || '',
        'Cliente Final': tarjeta.clienteFinal?.nombre || '',
        'Celular Cliente': tarjeta.clienteFinal?.celular || '',
        'Email Cliente': tarjeta.clienteFinal?.email || '',
        'Vendedor': tarjeta.vendedor?.nombre || '',
        'Celular Vendedor': tarjeta.vendedor?.celular || '',
        'Email Vendedor': tarjeta.vendedor?.email || '',
        'Fecha Generación': fechaGen ? format(fechaGen, 'dd/MM/yyyy HH:mm:ss') : '',
        'Fecha Activación': fechaAct ? format(fechaAct, 'dd/MM/yyyy HH:mm:ss') : '',
        'Fecha Vencimiento': fechaVenc ? format(fechaVenc, 'dd/MM/yyyy') : '',
        'Días Restantes': diasRestantes !== null ? diasRestantes : 'N/A',
        'Estado Vencimiento': diasRestantes < 0 ? 'Vencida' : diasRestantes <= 7 ? 'Por Vencer' : 'Vigente',
        'Precio Compra': tarjeta.plan?.precioCompra || 0,
        'Precio Venta': tarjeta.plan?.precioVenta || 0,
        'Duración (días)': tarjeta.plan?.duracionDias || 0,
        'Estado Inconsistente': tarjeta.estadoInconsistente ? 'Sí' : 'No'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const colWidths = [
      { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 25 },
      { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Tarjetas');

    const statsData = [
      ['ESTADÍSTICAS GENERALES', ''],
      ['Total de Tarjetas', stats.total],
      ['Generadas', stats.generadas],
      ['Asignadas', stats.asignadas],
      ['Activadas', stats.activadas],
      ['Vencidas', stats.vencidas],
      ['Utilizadas', stats.utilizadas],
      ['Inconsistencias', stats.inconsistencias],
      ['', ''],
      ['INFORMACIÓN DE EXPORTACIÓN', ''],
      ['Fecha de exportación', format(new Date(), 'dd/MM/yyyy HH:mm:ss')],
      ['Total registros exportados', dataToExport.length]
    ];

    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    wsStats['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
    
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const date = new Date().toISOString().split('T')[0];
    const filename = `tarjetas_${date}.xlsx`;
    
    saveAs(blob, filename);
    
    showSnackbar(`Exportado ${dataToExport.length} registros a Excel`, 'success');
    setOpenExportDialog(false);
  };

  const exportToCSV = () => {
    const dataToExport = getDataToExport();
    
    if (dataToExport.length === 0) {
      showSnackbar('No hay datos para exportar', 'warning');
      return;
    }
    
    const headers = [
      'ID', 'Código', 'Serie', 'Lote', 'Estado (Corregido)', 'Estado (Original)', 'Servicio', 'Plan',
      'Usuario', 'Contraseña', 'Perfil', 'PIN', 'Cliente Final',
      'Celular Cliente', 'Email Cliente', 'Vendedor', 'Celular Vendedor',
      'Email Vendedor', 'Fecha Generación', 'Fecha Activación',
      'Fecha Vencimiento', 'Días Restantes', 'Estado Vencimiento',
      'Precio Compra', 'Precio Venta', 'Duración (días)', 'Estado Inconsistente'
    ];
    
    const rows = dataToExport.map(tarjeta => {
      const fechaGen = tarjeta.fechaCreacion ? parseISO(tarjeta.fechaCreacion) : null;
      const fechaAct = tarjeta.fechaActivacion ? parseISO(tarjeta.fechaActivacion) : null;
      const fechaVenc = tarjeta.fechaVencimiento ? parseISO(tarjeta.fechaVencimiento) : null;
      const diasRestantes = tarjeta.diasParaVencimiento;
      
      return [
        tarjeta.idTarjeta,
        `"${tarjeta.codigo}"`,
        `"${tarjeta.serie}"`,
        `"${tarjeta.lote || ''}"`,
        `"${getEstadoLabel(tarjeta.estadoReal)}"`,
        `"${getEstadoLabel(tarjeta.estadoOriginal)}"`,
        `"${tarjeta.plan?.servicio?.nombre || 'N/A'}"`,
        `"${tarjeta.plan?.nombre || 'N/A'}"`,
        `"${tarjeta.credenciales?.cuenta?.usuario || ''}"`,
        `"${tarjeta.credenciales?.cuenta?.contrasena || ''}"`,
        `"${tarjeta.credenciales?.perfil?.nombre || ''}"`,
        `"${tarjeta.credenciales?.perfil?.pin || ''}"`,
        `"${tarjeta.clienteFinal?.nombre || ''}"`,
        `"${tarjeta.clienteFinal?.celular || ''}"`,
        `"${tarjeta.clienteFinal?.email || ''}"`,
        `"${tarjeta.vendedor?.nombre || ''}"`,
        `"${tarjeta.vendedor?.celular || ''}"`,
        `"${tarjeta.vendedor?.email || ''}"`,
        fechaGen ? `"${format(fechaGen, 'dd/MM/yyyy HH:mm:ss')}"` : '""',
        fechaAct ? `"${format(fechaAct, 'dd/MM/yyyy HH:mm:ss')}"` : '""',
        fechaVenc ? `"${format(fechaVenc, 'dd/MM/yyyy')}"` : '""',
        diasRestantes !== null ? diasRestantes : 'N/A',
        diasRestantes < 0 ? '"Vencida"' : diasRestantes <= 7 ? '"Por Vencer"' : '"Vigente"',
        tarjeta.plan?.precioCompra || 0,
        tarjeta.plan?.precioVenta || 0,
        tarjeta.plan?.duracionDias || 0,
        tarjeta.estadoInconsistente ? '"Sí"' : '"No"'
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `tarjetas_${date}.csv`;
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSnackbar(`Exportado ${dataToExport.length} registros a CSV`, 'success');
    setOpenExportDialog(false);
  };

  const getDataToExport = () => {
    switch (exportRange) {
      case 'filtered': return filteredTarjetas;
      case 'all': return tarjetas;
      case 'selected': return tarjetas.filter(t => selectedTarjetas.includes(t.idTarjeta));
      case 'vencidos': return tarjetas.filter(t => t.estadoReal === 'VENCIDA');
      case 'activadas': return tarjetas.filter(t => t.estadoReal === 'ACTIVADA');
      case 'asignadas': return tarjetas.filter(t => t.estadoReal === 'ASIGNADA');
      default: return filteredTarjetas;
    }
  };

  // =================== EFFECTS ===================
  useEffect(() => {
    fetchTarjetasDetalladas();
    fetchServicios();
    fetchVendedores();
  }, []);

  useEffect(() => {
    if (tarjetas.length > 0 && cargaCompleta) {
      aplicarFiltros();
    }
  }, [tarjetas, search, selectedEstado, selectedLote, selectedServicio, 
      selectedVendedor, showOnlyNearExpiration, diasParaVencimiento, cargaCompleta, aplicarFiltros]);

  // =================== RENDER ===================
  if (loading && tarjetas.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: COLOR_PALETTE.primary, mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, color: COLOR_PALETTE.primary }}>
          Cargando tarjetas...
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Por favor espera mientras se cargan todos los datos.
        </Typography>
        <LinearProgress sx={{ mt: 3, borderRadius: 2, height: 6 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, bgcolor: `${COLOR_PALETTE.dark}05`, minHeight: "100vh" }}>
      {/* Header */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎫 Gestión de Tarjetas
              {cantidadVencidos > 0 && (
                <Chip
                  label={`${cantidadVencidos} vencidas`}
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: COLOR_PALETTE.error,
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total: {stats.total} tarjetas • Mostrando: {filteredTarjetas.length}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setOpenExportDialog(true)}
            sx={{
              backgroundColor: 'white',
              color: COLOR_PALETTE.primary,
              '&:hover': {
                backgroundColor: alpha('#fff', 0.9)
              }
            }}
          >
            Exportar
          </Button>
        </Box>
      </Paper>

      {/* Controles de búsqueda y filtros */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Búsqueda principal */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar tarjetas..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Botones de control */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
              <Button
                startIcon={<Refresh />}
                onClick={fetchTarjetasDetalladas}
                size="small"
              >
                Actualizar
              </Button>
              
              <Button
                startIcon={expandedFilters ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setExpandedFilters(!expandedFilters)}
                size="small"
              >
                Filtros
              </Button>
              
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showOnlyNearExpiration}
                    onChange={(e) => setShowOnlyNearExpiration(e.target.checked)}
                  />
                }
                label="Próximas a vencer"
              />
            </Box>
          </Grid>

          {/* Filtros expandidos */}
          <Collapse in={expandedFilters} sx={{ width: '100%' }}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: COLOR_PALETTE.primary }}>
                  🎯 Filtros Avanzados
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={selectedEstado}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                        label="Estado"
                      >
                        <MenuItem value="todos">Todos los estados</MenuItem>
                        {estados.map(estado => (
                          <MenuItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Lote</InputLabel>
                      <Select
                        value={selectedLote}
                        onChange={(e) => setSelectedLote(e.target.value)}
                        label="Lote"
                      >
                        <MenuItem value="todos">Todos los lotes</MenuItem>
                        {lotes.map(lote => (
                          <MenuItem key={lote} value={lote}>
                            {lote}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Servicio</InputLabel>
                      <Select
                        value={selectedServicio}
                        onChange={(e) => setSelectedServicio(e.target.value)}
                        label="Servicio"
                      >
                        <MenuItem value="todos">Todos los servicios</MenuItem>
                        {servicios.map(servicio => (
                          <MenuItem key={servicio.idServicio} value={servicio.idServicio}>
                            {servicio.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Vendedor</InputLabel>
                      <Select
                        value={selectedVendedor}
                        onChange={(e) => setSelectedVendedor(e.target.value)}
                        label="Vendedor"
                      >
                        <MenuItem value="todos">Todos los vendedores</MenuItem>
                        {vendedores.map(vendedor => (
                          <MenuItem key={vendedor.id} value={vendedor.id}>
                            {vendedor.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                {showOnlyNearExpiration && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Mostrar tarjetas que vencen en:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={diasParaVencimiento}
                        onChange={(e) => setDiasParaVencimiento(e.target.value)}
                      >
                        <MenuItem value={3}>3 días</MenuItem>
                        <MenuItem value={7}>7 días</MenuItem>
                        <MenuItem value={15}>15 días</MenuItem>
                        <MenuItem value={30}>30 días</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedEstado('todos');
                      setSelectedLote('todos');
                      setSelectedServicio('todos');
                      setSelectedVendedor('todos');
                      setShowOnlyNearExpiration(false);
                      setSearch('');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Collapse>
        </Grid>
      </Paper>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: stats.total, color: COLOR_PALETTE.primary, icon: '📊' },
          { label: 'Generadas', value: stats.generadas, color: COLOR_PALETTE.info, icon: '🔄' },
          { label: 'Asignadas', value: stats.asignadas, color: '#9c27b0', icon: '👤' },
          { label: 'Activadas', value: stats.activadas, color: COLOR_PALETTE.success, icon: '✅' },
          { label: 'Vencidas', value: stats.vencidas, color: COLOR_PALETTE.error, icon: '⏰' },
          { label: 'Utilizadas', value: stats.utilizadas, color: COLOR_PALETTE.warning, icon: '🎬' }
        ].map((stat, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                backgroundColor: alpha(stat.color, 0.1),
                borderLeft: `4px solid ${stat.color}`,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => {
                if (stat.label !== 'Total') {
                  setSelectedEstado(estados.find(e => e.label === stat.label)?.value || 'todos');
                  setExpandedFilters(true);
                }
              }}
            >
              <Typography variant="h4" sx={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: stat.color,
                mb: 0.5
              }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ 
                fontSize: '0.8rem',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5
              }}>
                <span>{stat.icon}</span>
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabla principal */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: COLOR_PALETTE.primary, color: 'white', width: 50 }}>
                  #
                </TableCell>
                <TableCell sx={{ backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                  Código / Serie
                </TableCell>
                <TableCell sx={{ backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                  Servicio
                </TableCell>
                <TableCell sx={{ backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                  Estado
                </TableCell>
                <TableCell sx={{ backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                  Asignación
                </TableCell>
                <TableCell sx={{ backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
                  Vencimiento
                </TableCell>
                <TableCell sx={{ backgroundColor: COLOR_PALETTE.primary, color: 'white', textAlign: 'center' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTarjetas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {tarjetas.length === 0 ? 'No hay tarjetas registradas' : 'No se encontraron tarjetas con los filtros aplicados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTarjetas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tarjeta, index) => (
                    <TableRow 
                      key={tarjeta.idTarjeta}
                      sx={{
                        '&:hover': { backgroundColor: `${COLOR_PALETTE.primary}05` }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {page * rowsPerPage + index + 1}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {tarjeta.codigo}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Serie: {tarjeta.serie} • Lote: {tarjeta.lote || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: getServicioColor(tarjeta.plan?.servicio?.nombre),
                              fontSize: '0.75rem'
                            }}
                          >
                            {tarjeta.plan?.servicio?.nombre?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {tarjeta.plan?.servicio?.nombre || 'Desconocido'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {tarjeta.plan?.nombre || 'Plan no especificado'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={getEstadoLabel(tarjeta.estadoReal)}
                            size="small"
                            sx={{
                              backgroundColor: `${COLOR_PALETTE[getEstadoColor(tarjeta.estadoReal)]}15`,
                              color: COLOR_PALETTE[getEstadoColor(tarjeta.estadoReal)],
                              border: `1px solid ${COLOR_PALETTE[getEstadoColor(tarjeta.estadoReal)]}30`
                            }}
                          />
                          {tarjeta.estadoInconsistente && (
                            <Tooltip title={`Estado original: ${getEstadoLabel(tarjeta.estadoOriginal)}`}>
                              <Chip 
                                label="!"
                                size="small"
                                sx={{
                                  backgroundColor: COLOR_PALETTE.warning,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        {tarjeta.vendedor ? (
                          <Typography variant="body2">
                            Vendedor: {tarjeta.vendedor.nombre}
                          </Typography>
                        ) : tarjeta.clienteFinal ? (
                          <Typography variant="body2">
                            Cliente: {tarjeta.clienteFinal.nombre}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            Sin asignar
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {tarjeta.fechaVencimiento ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ 
                              fontSize: '0.8rem', 
                              color: getColorDiasRestantes(tarjeta.diasParaVencimiento) 
                            }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: getColorDiasRestantes(tarjeta.diasParaVencimiento),
                                fontWeight: 'bold'
                              }}
                            >
                              {tarjeta.diasParaVencimiento < 0 
                                ? `Vencida hace ${Math.abs(tarjeta.diasParaVencimiento)} días` 
                                : `${tarjeta.diasParaVencimiento} días restantes`}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Sin fecha
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Copiar código">
                            <IconButton 
                              size="small"
                              onClick={() => handleCopyCodigo(tarjeta.codigo)}
                              sx={{ color: COLOR_PALETTE.primary }}
                            >
                              <ContentCopy sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Copiar credenciales">
                            <IconButton 
                              size="small"
                              onClick={() => handleCopyCredenciales(tarjeta)}
                              disabled={!tarjeta.credenciales?.cuenta}
                              sx={{ 
                                color: tarjeta.credenciales?.cuenta ? COLOR_PALETTE.success : 'disabled'
                              }}
                            >
                              <PersonPin sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        {filteredTarjetas.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={filteredTarjetas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
          />
        )}
      </Paper>

      {/* Diálogo de exportación */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: COLOR_PALETTE.primary, color: 'white' }}>
          📊 Exportar Tarjetas
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <FormControl fullWidth sx={{ mt: 2 ,mb: 3 }}>
            <InputLabel>Formato</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Formato"
            >
              <MenuItem value="excel">
                <TableChart sx={{ mr: 1 }} /> Excel
              </MenuItem>
              <MenuItem value="csv">
                <Description sx={{ mr: 1 }} /> CSV
              </MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Rango</InputLabel>
            <Select
              value={exportRange}
              onChange={(e) => setExportRange(e.target.value)}
              label="Rango"
            >
              <MenuItem value="filtered">Datos filtrados ({filteredTarjetas.length})</MenuItem>
              <MenuItem value="all">Todos los datos ({tarjetas.length})</MenuItem>
              <MenuItem value="selected">Seleccionadas ({selectedTarjetas.length})</MenuItem>
              <MenuItem value="vencidos">Solo vencidas ({stats.vencidas})</MenuItem>
              <MenuItem value="activadas">Solo activadas ({stats.activadas})</MenuItem>
              <MenuItem value="asignadas">Solo asignadas ({stats.asignadas})</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenExportDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={exportFormat === 'excel' ? exportToExcel : exportToCSV}
            startIcon={<Download />}
            sx={{ backgroundColor: COLOR_PALETTE.primary }}
          >
            Exportar
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
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}