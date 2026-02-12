import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Switch, FormControlLabel,
  Divider, Stack, LinearProgress, Alert
} from '@mui/material';
import {
  Add, Edit, Delete, PlayArrow, Schedule,
  AccessTime, Settings, CheckCircle, Error
} from '@mui/icons-material';
import { API_BASE_URL } from '../../../config';

export default function ScriptsManager({ vendedorId }) {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScript, setEditingScript] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    horasDespuesActivacion: 24,
    scriptJson: '{}',
    activo: true,
    intentosPermitidos: 3,
    horarioInicio: '09:00',
    horarioFin: '21:00'
  });

  useEffect(() => {
    cargarScripts();
  }, [vendedorId]);

  const cargarScripts = async () => {
    try {
      setLoading(true);
      const url = vendedorId
        ? `${API_BASE_URL}/callcenter/scripts?vendedorId=${vendedorId}`
        : `${API_BASE_URL}/callcenter/scripts`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setScripts(data);
      }
    } catch (error) {
      console.error('Error cargando scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (script = null) => {
    if (script) {
      setEditingScript(script);
      setFormData({
        nombre: script.nombre,
        descripcion: script.descripcion || '',
        horasDespuesActivacion: script.horasDespuesActivacion,
        scriptJson: script.scriptJson,
        activo: script.activo,
        intentosPermitidos: script.intentosPermitidos,
        horarioInicio: script.horarioInicio?.substring(0, 5) || '09:00',
        horarioFin: script.horarioFin?.substring(0, 5) || '21:00'
      });
    } else {
      setEditingScript(null);
      setFormData({
        nombre: '',
        descripcion: '',
        horasDespuesActivacion: 24,
        scriptJson: '{}',
        activo: true,
        intentosPermitidos: 3,
        horarioInicio: '09:00',
        horarioFin: '21:00'
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const url = editingScript
        ? `${API_BASE_URL}/callcenter/scripts/${editingScript.id}`
        : `${API_BASE_URL}/callcenter/scripts`;
      
      const method = editingScript ? 'PUT' : 'POST';

      const scriptData = {
        ...formData,
        vendedorId: vendedorId || null,
        scriptJson: typeof formData.scriptJson === 'string' 
          ? formData.scriptJson 
          : JSON.stringify(formData.scriptJson)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptData)
      });

      if (res.ok) {
        cargarScripts();
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error guardando script:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este script?')) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/callcenter/scripts/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        cargarScripts();
      }
    } catch (error) {
      console.error('Error eliminando script:', error);
    }
  };

  const getScriptExample = () => {
    return JSON.stringify({
      saludo: "Hola [nombre], soy el asistente de [vendedor]",
      preguntas: [
        {
          id: "p1",
          texto: "¿Recibiste bien tu cuenta de Netflix?",
          tipo: "si_no",
          opciones: [
            { valor: "si", accion: "agradecer" },
            { valor: "no", accion: "transferir_soporte" }
          ]
        },
        {
          id: "p2",
          texto: "¿Tienes alguna sugerencia para mejorar?",
          tipo: "abierta"
        }
      ],
      despedida: "Gracias por tu tiempo. ¡Que tengas un buen día!"
    }, null, 2);
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f0f7ff' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              ⚙️ Scripts de Llamadas Automáticas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configura flujos de conversación para las llamadas IA
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Script
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {scripts.map((script) => (
            <Grid item xs={12} md={6} lg={4} key={script.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                {!script.activo && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    zIndex: 1 
                  }}>
                    <Chip
                      label="INACTIVO"
                      size="small"
                      color="error"
                      icon={<Error />}
                    />
                  </Box>
                )}
                
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {script.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {script.descripcion || 'Sin descripción'}
                      </Typography>
                    </Box>
                    
                    <Chip
                      label={`${script.horasDespuesActivacion}h`}
                      size="small"
                      color="primary"
                      icon={<Schedule />}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Horario:
                      </Typography>
                      <Typography variant="body2">
                        {script.horarioInicio?.substring(0, 5)} - {script.horarioFin?.substring(0, 5)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Intentos:
                      </Typography>
                      <Typography variant="body2">
                        {script.intentosPermitidos}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Estado:
                      </Typography>
                      <Chip
                        label={script.activo ? 'ACTIVO' : 'INACTIVO'}
                        size="small"
                        color={script.activo ? 'success' : 'error'}
                        icon={script.activo ? <CheckCircle /> : <Error />}
                      />
                    </Box>
                  </Stack>
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(script)}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => {
                        // Acción para probar script
                        alert(`Probar script: ${script.nombre}`);
                      }}
                    >
                      Probar
                    </Button>
                    
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(script.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para crear/editar script */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingScript ? '✏️ Editar Script' : '➕ Nuevo Script'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Script *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Post-Activación 24h"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                multiline
                rows={2}
                placeholder="Ej: Llamada automática 24 horas después de activación"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Horas después de activación"
                type="number"
                value={formData.horasDespuesActivacion}
                onChange={(e) => setFormData({ ...formData, horasDespuesActivacion: parseInt(e.target.value) })}
                InputProps={{ inputProps: { min: 1, max: 168 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Intentos permitidos"
                type="number"
                value={formData.intentosPermitidos}
                onChange={(e) => setFormData({ ...formData, intentosPermitidos: parseInt(e.target.value) })}
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Horario inicio"
                type="time"
                value={formData.horarioInicio}
                onChange={(e) => setFormData({ ...formData, horarioInicio: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Horario fin"
                type="time"
                value={formData.horarioFin}
                onChange={(e) => setFormData({ ...formData, horarioFin: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  />
                }
                label="Script activo"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Ejemplo de estructura JSON:</strong>
                </Typography>
                <pre style={{ fontSize: '0.8rem', marginTop: 8 }}>
                  {getScriptExample()}
                </pre>
              </Alert>
              
              <TextField
                fullWidth
                label="Script JSON *"
                value={formData.scriptJson}
                onChange={(e) => setFormData({ ...formData, scriptJson: e.target.value })}
                multiline
                rows={10}
                placeholder={getScriptExample()}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            {editingScript ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}