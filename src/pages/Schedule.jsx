import React, { useState, useEffect, useMemo } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../hooks/useAuth";
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
  CircularProgress,
  Grid,
  Chip,
  //useTheme,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import {
  AccessTime as ClockIcon,
  PauseCircle as PauseCircleIcon,
  PlayCircle as PlayCircleIcon,
  Cancel as XCircleIcon,
  Cached as RefreshCwIcon
} from "@mui/icons-material";

const API_ADD_URL = `${API_BASE_URL}/Horario/AddHorario/`;
const API_GET_URL = `${API_BASE_URL}/Horario/GetHorarioEmpleado/`;

const Schedule = () => {
 // const theme = useTheme();
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });
  const [hasEntered, setHasEntered] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [workStartTime, setWorkStartTime] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [lastAction, setLastAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // ⏱ Actualizar cada segundo
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) seconds = 0;
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const showAlert = (severity, message) =>
    setAlert({ open: true, severity, message });
  const handleCloseAlert = () =>
    setAlert((prev) => ({ ...prev, open: false }));

  // 🔹 Obtener datos del servidor y determinar estado de botones
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.idempleado) return;
      try {
        setLoading(true);
        const response = await fetch(`${API_GET_URL}${user.idempleado}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!response.ok) {
          showAlert("error", "Error al obtener horarios del servidor");
          return;
        }

        const data = await response.json();
        const mappedLogs = data.map((item) => {
          const todayDate = new Date().toISOString().split("T")[0];
          const entrada = item.hora_ingreso ? new Date(`${todayDate}T${item.hora_ingreso}`) : null;
          const inicioDescanso = item.hora_descanso_inicio ? new Date(`${todayDate}T${item.hora_descanso_inicio}`) : null;
          const finDescanso = item.hora_descanso_final ? new Date(`${todayDate}T${item.hora_descanso_final}`) : null;
          const salida = item.hora_salida ? new Date(`${todayDate}T${item.hora_salida}`) : null;

          let trabajoSeconds = 0;
          let descansoSeconds = 0;

          if (entrada && salida) {
            trabajoSeconds = Math.floor((salida - entrada) / 1000);
          }
          if (inicioDescanso && finDescanso) {
            descansoSeconds = Math.floor((finDescanso - inicioDescanso) / 1000);
            if (trabajoSeconds > 0) trabajoSeconds -= descansoSeconds;
          }

          return { 
            entrada, 
            inicioDescanso, 
            finDescanso, 
            salida, 
            trabajoSeconds, 
            descansoSeconds 
          };
        });

        setLogs(mappedLogs);

        // 🔹 DETERMINAR ESTADO ACTUAL BASADO EN EL ÚLTIMO REGISTRO
        const lastLog = mappedLogs[mappedLogs.length - 1];
        if (lastLog) {
          // Si hay entrada pero no salida
          if (lastLog.entrada && !lastLog.salida) {
            setHasEntered(true);
            setWorkStartTime(lastLog.entrada);
            
            // Si hay inicio de descanso pero no fin de descanso
            if (lastLog.inicioDescanso && !lastLog.finDescanso) {
              setOnBreak(true);
              setBreakStartTime(lastLog.inicioDescanso);
            } else {
              setOnBreak(false);
            }
          } else {
            // Jornada terminada o sin empezar
            setHasEntered(false);
            setOnBreak(false);
            setWorkStartTime(null);
            setBreakStartTime(null);
          }
        } else {
          // No hay registros
          setHasEntered(false);
          setOnBreak(false);
          setWorkStartTime(null);
          setBreakStartTime(null);
        }
      } catch (err) {
        console.error("Error GET:", err);
        showAlert("error", "Error de conexión al cargar horarios");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  // 🔹 Enviar acción al API
  useEffect(() => {
    if (!lastAction) return;
    if (!user || !user.idusuario || !user.idempleado)
      return showAlert("error", "Usuario no autenticado correctamente");

    const send = async () => {
      try {
        const response = await fetch(`${API_ADD_URL}${lastAction}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({ idempleado: user.idempleado, idusuario: user.idusuario }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Error API:", text);
          showAlert("error", `Error al registrar ${lastAction}`);
        } else {
          showAlert("success", `${lastAction} registrado en servidor`);
        }
      } catch (error) {
        console.error("Error conexión:", error);
        showAlert("error", `Error de conexión al registrar ${lastAction}`);
      } finally {
        setLastAction(null);
      }
    };

    send();
  }, [lastAction, user, token]);

  // 🔹 Registrar acción en memoria - CORREGIDO
  const addLog = (type) => {
    const now = new Date();
    setLogs((prevLogs) => {
      const lastLogIndex = prevLogs.length - 1;
      const lastLog = prevLogs[lastLogIndex] || {};
      let newLogs = [...prevLogs];

      if (type === "Entrada") {
        if (hasEntered) return prevLogs;
        setHasEntered(true);
        setWorkStartTime(now);
        newLogs.push({ 
          entrada: now, 
          inicioDescanso: null, 
          finDescanso: null, 
          salida: null, 
          trabajoSeconds: 0, 
          descansoSeconds: 0 
        });
        setLastAction("HI");
      }

      if (type === "Inicio Descanso") {
        if (!hasEntered || onBreak || !lastLog || lastLog.inicioDescanso) return prevLogs;
        setOnBreak(true);
        setBreakStartTime(now);
        newLogs[lastLogIndex] = { 
          ...lastLog, 
          inicioDescanso: now 
        };
        setLastAction("DI");
      }

      if (type === "Fin Descanso") {
        if (!onBreak || !lastLog || !lastLog.inicioDescanso) return prevLogs;
        const descansoSeconds = Math.floor((now - breakStartTime) / 1000);
        setOnBreak(false);
        newLogs[lastLogIndex] = {
          ...lastLog,
          finDescanso: now,
          descansoSeconds: (lastLog.descansoSeconds || 0) + descansoSeconds,
        };
        setLastAction("DF");
      }

      if (type === "Salida") {
        if (!hasEntered || onBreak || !lastLog) return prevLogs;
        const trabajoSeconds = Math.floor((now - workStartTime) / 1000) - (lastLog.descansoSeconds || 0);
        setHasEntered(false);
        setWorkStartTime(null);
        setBreakStartTime(null);
        setOnBreak(false);
        newLogs[lastLogIndex] = { 
          ...lastLog, 
          salida: now, 
          trabajoSeconds 
        };
        setLastAction("HF");
      }

      return newLogs;
    });
  };

  const resetDay = () => {
    setLogs([]);
    setHasEntered(false);
    setOnBreak(false);
    setWorkStartTime(null);
    setBreakStartTime(null);
    showAlert("info", "Jornada reiniciada");
  };

  // 🔹 Calcular tiempos de fila actual - CORREGIDO
  const getCurrentRowTimes = useMemo(() => {
    const lastLog = logs[logs.length - 1];
    if (!lastLog) return { trabajo: 0, descanso: 0 };

    let trabajoSeconds = lastLog.trabajoSeconds || 0;
    let descansoSeconds = lastLog.descansoSeconds || 0;

    if (lastLog.entrada && !lastLog.salida && workStartTime) {
      trabajoSeconds = Math.floor((Date.now() - workStartTime.getTime()) / 1000) - descansoSeconds;
    }

    if (lastLog.inicioDescanso && !lastLog.finDescanso && breakStartTime) {
      descansoSeconds += Math.floor((Date.now() - breakStartTime.getTime()) / 1000);
    }

    if (trabajoSeconds < 0) trabajoSeconds = 0;
    if (descansoSeconds < 0) descansoSeconds = 0;

    return { trabajo: trabajoSeconds, descanso: descansoSeconds };
  }, [logs, currentTime, workStartTime, breakStartTime]);

  // 🔹 Calcular totales - CORREGIDO
  const { totalTrabajo, totalDescanso } = useMemo(() => {
    let totalT = 0;
    let totalD = 0;

    logs.forEach((log, index) => {
      if (index === logs.length - 1) {
        // Usar los tiempos calculados en getCurrentRowTimes para la última fila
        totalT += getCurrentRowTimes.trabajo;
        totalD += getCurrentRowTimes.descanso;
      } else {
        totalT += log.trabajoSeconds || 0;
        totalD += log.descansoSeconds || 0;
      }
    });

    return { totalTrabajo: totalT, totalDescanso: totalD };
  }, [logs, getCurrentRowTimes]);

  const getStatusColor = () => {
    if (!hasEntered) return "default";
    if (onBreak) return "warning";
    return "success";
  };

  const getStatusText = () => {
    if (!hasEntered) return "Fuera de servicio";
    if (onBreak) return "En descanso";
    return "Trabajando activamente";
  };

  // 🔹 DETERMINAR ESTADO DE BOTONES BASADO EN EL ÚLTIMO REGISTRO
  const getButtonStates = () => {
    const lastLog = logs[logs.length - 1];
    
    if (!lastLog) {
      // No hay registros - solo puede Entrada
      return {
        entrada: true,
        descanso: false,
        continuar: false,
        salida: false
      };
    }

    if (lastLog.entrada && !lastLog.salida) {
      // Jornada iniciada pero no terminada
      if (lastLog.inicioDescanso && !lastLog.finDescanso) {
        // En descanso - puede Continuar o Salida
        return {
          entrada: false,
          descanso: false,
          continuar: true,
          salida: true
        };
      } else {
        // Trabajando - puede Descanso o Salida
        return {
          entrada: false,
          descanso: true,
          continuar: false,
          salida: true
        };
      }
    }

    // Jornada terminada o sin estado claro
    return {
      entrada: true,
      descanso: false,
      continuar: false,
      salida: false
    };
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLogs = logs.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  const buttonStates = getButtonStates();

  return (
    <Box sx={{ p: 1, minHeight: '100vh', bgcolor: "#f8f9fa" }}>
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
              ⏱ Control de Horarios
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              Registro de jornada laboral en tiempo real • {user?.nombre} {user?.apellido_paterno}
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <ClockIcon sx={{ fontSize: '1.2rem' }} />
          </Box>
        </Box>
      </Paper>

      {/* CONTENIDO PRINCIPAL */}
      <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', lg: 'row' }, width: '100%' }}>
        
        {/* CONTENEDOR PRINCIPAL */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          
          {/* Botones de control compactos */}
          <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.9rem' }}>
              🎯 Acciones de Jornada
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<ClockIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => addLog("Entrada")} 
                disabled={!buttonStates.entrada}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  borderRadius: 1,
                  px: 2,
                  py: 0.8,
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                Entrada
              </Button>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<PauseCircleIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => addLog("Inicio Descanso")} 
                disabled={!buttonStates.descanso}
                sx={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  borderRadius: 1,
                  px: 2,
                  py: 0.8,
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                Descanso
              </Button>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<PlayCircleIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => addLog("Fin Descanso")} 
                disabled={!buttonStates.continuar}
                sx={{
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  borderRadius: 1,
                  px: 2,
                  py: 0.8,
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                Continuar
              </Button>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<XCircleIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => addLog("Salida")} 
                disabled={!buttonStates.salida}
                sx={{
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  borderRadius: 1,
                  px: 2,
                  py: 0.8,
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                Salida
              </Button>
             
            </Box>
          </Paper>

          {/* Tabla compacta */}
          <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', flex: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {["#", "Entrada", "Inicio Descanso", "Fin Descanso", "Salida", "Trabajo", "Descanso", "Total"].map(
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
                      {paginatedLogs.map((row, index) => {
                        const globalIndex = page * rowsPerPage + index;
                        const isCurrentRow = globalIndex === logs.length - 1;
                        let trabajoSeconds = row.trabajoSeconds || 0;
                        let descansoSeconds = row.descansoSeconds || 0;

                        if (isCurrentRow) {
                          trabajoSeconds = getCurrentRowTimes.trabajo;
                          descansoSeconds = getCurrentRowTimes.descanso;
                        }

                        const totalSeconds = trabajoSeconds + descansoSeconds;

                        return (
                          <TableRow 
                            key={globalIndex}
                            sx={{ 
                              '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' },
                              '&:hover': { backgroundColor: '#e3f2fd' }
                            }}
                          >
                            <TableCell sx={{ py: 0.5 }}>
                              <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
                                {globalIndex + 1}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <Typography variant="body2" fontWeight={row.entrada ? "medium" : "normal"} sx={{ fontSize: '0.75rem' }}>
                                {formatTime(row.entrada)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                {formatTime(row.inicioDescanso)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                {formatTime(row.finDescanso)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <Typography variant="body2" fontWeight={row.salida ? "medium" : "normal"} sx={{ fontSize: '0.75rem' }}>
                                {formatTime(row.salida)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <Chip 
                                label={formatDuration(trabajoSeconds)} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.6rem' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <Chip 
                                label={formatDuration(descansoSeconds)} 
                                size="small" 
                                color="secondary"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.6rem' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <Chip 
                                label={formatDuration(totalSeconds)} 
                                size="small" 
                                color="primary"
                                sx={{ fontSize: '0.6rem' }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {paginatedLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 3, fontSize: '0.8rem' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              No hay registros para hoy
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Haz clic en "Entrada" para comenzar tu jornada
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Paginación */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  component="div"
                  count={logs.length}
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
        </Box>

        {/* PANEL LATERAL COMPACTO */}
        <Box sx={{ width: { lg: 250 }, minWidth: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Estado actual */}
          <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.8rem' }}>
              Estado Actual
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Chip 
                label={getStatusText()}
                color={getStatusColor()}
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '0.65rem',
                  height: 20
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Hora actual:</Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                  {formatTime(new Date())}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Registros:</Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                  {logs.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Fecha:</Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                  {today}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Resumen del día */}
          <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main', fontSize: '0.8rem' }}>
              Resumen del Día
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                  {formatDuration(totalTrabajo)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.6rem' }}>
                  Horas Trabajadas
                </Typography>
              </Box>

              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                  {formatDuration(totalDescanso)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.6rem' }}>
                  Horas de Descanso
                </Typography>
              </Box>

              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                  {formatDuration(totalTrabajo + totalDescanso)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.6rem' }}>
                  Tiempo Total
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar 
        open={alert.open} 
        autoHideDuration={4000} 
        onClose={handleCloseAlert} 
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ 
            borderRadius: 1,
            fontWeight: 'bold',
            fontSize: '0.8rem'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Schedule;