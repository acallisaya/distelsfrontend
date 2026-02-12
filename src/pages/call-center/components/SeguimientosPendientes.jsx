import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button,
  Typography, Avatar, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  Card, CardContent, Stack, LinearProgress
} from '@mui/material';
import {
  Warning, Person, Phone, AccessTime, CheckCircle,
  Comment, Refresh, ArrowForward, Chat
} from '@mui/icons-material';
import { API_BASE_URL } from '../../../config';

export default function SeguimientosPendientes({ vendedorId }) {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState(null);
  const [nota, setNota] = useState('');

  useEffect(() => {
    cargarSeguimientos();
  }, [vendedorId]);

  const cargarSeguimientos = async () => {
    try {
      setLoading(true);
      const url = vendedorId
        ? `${API_BASE_URL}/callcenter/seguimientos-pendientes?vendedorId=${vendedorId}`
        : `${API_BASE_URL}/callcenter/seguimientos-pendientes`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSeguimientos(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando seguimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolver = async (seguimiento) => {
    setSelectedSeguimiento(seguimiento);
    setOpenDialog(true);
  };

  const confirmarResolucion = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/callcenter/seguimientos/${selectedSeguimiento.respuestaId}/resolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota })
      });
      
      if (res.ok) {
        cargarSeguimientos();
        setOpenDialog(false);
        setNota('');
      }
    } catch (error) {
      console.error('Error resolviendo seguimiento:', error);
    }
  };

  const getSentimientoColor = (sentimiento) => {
    switch (sentimiento) {
      case 'POSITIVO': return 'success';
      case 'NEGATIVO': return 'error';
      case 'NEUTRAL': return 'default';
      default: return 'default';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const llamarCliente = (telefono) => {
    if (telefono) {
      window.open(`tel:${telefono}`, '_blank');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3, p: 3, bgcolor: '#fff8e1', borderLeft: '4px solid #ff9800' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" gutterBottom>
              ⚠️ Seguimientos Pendientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clientes que requieren atención especial
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={cargarSeguimientos}
          >
            Actualizar
          </Button>
        </Box>
      </Card>

      {loading ? (
        <LinearProgress />
      ) : seguimientos.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            ¡Todo bajo control!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay seguimientos pendientes en este momento.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Respuesta</TableCell>
                <TableCell>Sentimiento</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {seguimientos.map((seg) => (
                <TableRow key={seg.respuestaId} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#f44336' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {seg.clienteFinal?.nombre || 'Cliente'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vendedor: {seg.vendedor?.nombre}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {seg.clienteFinal?.telefono || 'Sin teléfono'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                      {seg.respuesta?.substring(0, 50)}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Pregunta: {seg.pregunta}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={seg.sentimiento || 'NEUTRAL'}
                      size="small"
                      color={getSentimientoColor(seg.sentimiento)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatFecha(seg.fechaRespuesta)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {seg.tags?.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => llamarCliente(seg.clienteFinal?.telefono)}
                        disabled={!seg.clienteFinal?.telefono}
                      >
                        <Phone fontSize="small" />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => {
                          // Ver detalles de la llamada
                          window.location.href = `/call-center/llamadas/${seg.llamadaId}`;
                        }}
                      >
                        <Chat fontSize="small" />
                      </IconButton>
                      
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={() => handleResolver(seg)}
                      >
                        Resolver
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo para resolver seguimiento */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSeguimiento && (
          <>
            <DialogTitle>
              ✅ Resolver Seguimiento
            </DialogTitle>
            
            <DialogContent dividers>
              <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  INFORMACIÓN DEL CLIENTE
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Nombre:</strong> {selectedSeguimiento.clienteFinal?.nombre}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Teléfono:</strong> {selectedSeguimiento.clienteFinal?.telefono}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Respuesta:</strong> {selectedSeguimiento.respuesta}
                </Typography>
                <Typography variant="body1">
                  <strong>Sentimiento:</strong> {selectedSeguimiento.sentimiento}
                </Typography>
              </Card>
              
              <TextField
                fullWidth
                label="Nota de resolución *"
                multiline
                rows={4}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Describe cómo resolviste el problema del cliente..."
              />
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={confirmarResolucion}
                disabled={!nota.trim()}
              >
                Marcar como Resuelto
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}