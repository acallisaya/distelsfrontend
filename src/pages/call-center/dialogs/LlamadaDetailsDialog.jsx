import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Grid, Card, CardContent,
  Chip, Divider, Stack, IconButton, LinearProgress,
  Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  TextField, Alert, Avatar
} from '@mui/material';
import {
  Close, VolumeUp, Phone, Person, AccessTime,
  Chat, CheckCircle, Error, Warning,
  ContentCopy, PlayArrow, Refresh, Download
} from '@mui/icons-material';
import { API_BASE_URL } from '../../../config';

export default function LlamadaDetailsDialog({ open, onClose, llamadaId }) {
  const [llamada, setLlamada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && llamadaId) {
      cargarDetallesLlamada();
    }
  }, [open, llamadaId]);

  const cargarDetallesLlamada = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/callcenter/${llamadaId}`);
      if (res.ok) {
        const data = await res.json();
        setLlamada(data);
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarNota = async () => {
    if (!nota.trim()) return;
    
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/callcenter/${llamadaId}/nota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota })
      });
      
      if (res.ok) {
        cargarDetallesLlamada();
        setNota('');
      }
    } catch (error) {
      console.error('Error agregando nota:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEjecutarLlamada = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/callcenter/ejecutar/${llamadaId}`, {
        method: 'POST'
      });
      
      if (res.ok) {
        cargarDetallesLlamada();
      }
    } catch (error) {
      console.error('Error ejecutando llamada:', error);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return 'success';
      case 'EN_CURSO': return 'warning';
      case 'FALLIDA': return 'error';
      case 'PROGRAMADA': return 'info';
      default: return 'default';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuracion = (segundos) => {
    if (!segundos) return '00:00';
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Cargando detalles...</DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (!llamada) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Alert severity="error">No se pudo cargar la información de la llamada</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const tabs = [
    { label: '📋 Información', value: 0 },
    { label: '💬 Transcripción', value: 1 },
    { label: '📝 Respuestas', value: 2 },
    { label: '📌 Notas', value: 3 }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        bgcolor: '#667eea', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6">📞 Detalles de Llamada</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            ID: {llamada.id} • {formatFecha(llamada.fechaCreacion)}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ pt: 3 }}>
        {/* Información básica */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Columna izquierda - Información general */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ESTADO DE LA LLAMADA
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip
                      label={llamada.estado}
                      color={getEstadoColor(llamada.estado)}
                      sx={{ mr: 2 }}
                      size="medium"
                    />
                    <Typography variant="body2">
                      Intento {llamada.intentoNumero} de {llamada.maxIntentos}
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center">
                      <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2">
                          <strong>Programada:</strong> {formatFecha(llamada.fechaProgramada)}
                        </Typography>
                        {llamada.fechaEjecucion && (
                          <Typography variant="body2">
                            <strong>Ejecutada:</strong> {formatFecha(llamada.fechaEjecucion)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Duración:</strong> {formatDuracion(llamada.duracionSegundos)}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Chat sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Resultado:</strong> {llamada.resultado || 'PENDIENTE'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Información del cliente */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    INFORMACIÓN DEL CLIENTE
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: '#764ba2' }}>
                      {llamada.clienteFinal?.nombre?.charAt(0) || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {llamada.clienteFinal?.nombre || 'Cliente'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {llamada.clienteFinal?.celular || 'Sin teléfono'}
                      </Typography>
                    </Box>
                  </Box>

                  {llamada.clienteFinal?.email && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong> {llamada.clienteFinal.email}
                    </Typography>
                  )}

                  <Typography variant="body2">
                    <strong>Vendedor:</strong> {llamada.vendedor?.nombre || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Columna derecha - Detalles técnicos */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ANÁLISIS DE LA LLAMADA
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Sentimiento
                        </Typography>
                        <Chip
                          label={llamada.sentimiento || 'NEUTRAL'}
                          sx={{
                            bgcolor: llamada.sentimiento === 'POSITIVO' ? '#e8f5e9' : 
                                    llamada.sentimiento === 'NEGATIVO' ? '#ffebee' : '#f5f5f5',
                            color: llamada.sentimiento === 'POSITIVO' ? '#2e7d32' :
                                  llamada.sentimiento === 'NEGATIVO' ? '#c62828' : 'inherit'
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Satisfacción
                        </Typography>
                        <Typography variant="h5">
                          {llamada.satisfaccion || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /10
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {llamada.grabacionUrl && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          GRABACIÓN
                        </Typography>
                        <audio 
                          controls 
                          style={{ width: '100%' }}
                          src={llamada.grabacionUrl}
                        />
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={() => window.open(llamada.grabacionUrl, '_blank')}
                          sx={{ mt: 1 }}
                        >
                          Descargar Grabación
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Acciones */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ACCIONES
                  </Typography>
                  
                  <Stack spacing={1}>
                    {llamada.estado === 'PROGRAMADA' && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={handleEjecutarLlamada}
                      >
                        Ejecutar Llamada Ahora
                      </Button>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={cargarDetallesLlamada}
                    >
                      Actualizar Información
                    </Button>

                    {llamada.clienteFinal?.celular && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        onClick={() => navigator.clipboard.writeText(llamada.clienteFinal.celular)}
                      >
                        Copiar Teléfono
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Transcripción */}
        {tabValue === 1 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                TRANSCRIPCIÓN COMPLETA
              </Typography>
              
              {llamada.transcripcionCompleta ? (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  maxHeight: 400,
                  overflow: 'auto'
                }}>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                    {llamada.transcripcionCompleta}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">
                  No hay transcripción disponible para esta llamada
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Respuestas */}
        {tabValue === 2 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                RESPUESTAS REGISTRADAS
              </Typography>
              
              {llamada.respuestas && llamada.respuestas.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Pregunta</TableCell>
                        <TableCell>Respuesta</TableCell>
                        <TableCell>Sentimiento</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell>Fecha</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {llamada.respuestas.map((respuesta, index) => (
                        <TableRow key={index}>
                          <TableCell>{respuesta.preguntaTexto}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {respuesta.respuestaCliente}
                            </Typography>
                            {respuesta.requiereSeguimiento && (
                              <Chip 
                                label="Requiere seguimiento" 
                                size="small" 
                                color="error"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={respuesta.sentimiento || 'NEUTRAL'}
                              size="small"
                              sx={{
                                bgcolor: respuesta.sentimiento === 'POSITIVO' ? '#e8f5e9' : 
                                        respuesta.sentimiento === 'NEGATIVO' ? '#ffebee' : '#f5f5f5'
                              }}
                            />
                          </TableCell>
                          <TableCell>{respuesta.categoriaRespuesta}</TableCell>
                          <TableCell>
                            {formatFecha(respuesta.fechaRegistro)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No hay respuestas registradas para esta llamada
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notas */}
        {tabValue === 3 && (
          <Box>
            {/* Formulario para agregar nota */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  AGREGAR NUEVA NOTA
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Escribe aquí tus observaciones o comentarios sobre esta llamada..."
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="contained"
                  onClick={handleAgregarNota}
                  disabled={saving || !nota.trim()}
                  startIcon={saving ? <LinearProgress size={20} /> : <Chat />}
                >
                  {saving ? 'Guardando...' : 'Agregar Nota'}
                </Button>
              </CardContent>
            </Card>

            {/* Notas existentes */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  NOTAS REGISTRADAS
                </Typography>
                
                {llamada.transcripcionCompleta?.includes('[NOTA:') ? (
                  <Box>
                    {llamada.transcripcionCompleta
                      .split('\n')
                      .filter(line => line.includes('[NOTA:'))
                      .map((notaLine, index) => {
                        const match = notaLine.match(/\[NOTA: (.*?)\](.*)/);
                        if (match) {
                          const [, fecha, contenido] = match;
                          return (
                            <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {fecha}
                              </Typography>
                              <Typography variant="body2">
                                {contenido.trim()}
                              </Typography>
                            </Card>
                          );
                        }
                        return null;
                      })}
                  </Box>
                ) : (
                  <Alert severity="info">
                    No hay notas registradas para esta llamada
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cerrar</Button>
        {llamada.grabacionUrl && (
          <Button
            variant="contained"
            startIcon={<VolumeUp />}
            onClick={() => window.open(llamada.grabacionUrl, '_blank')}
          >
            Escuchar Grabación
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}