import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormControlLabel, Switch,
  Typography, Box, Alert, Chip, Stack, Divider,
  IconButton, InputAdornment, LinearProgress,
  FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Paper
} from '@mui/material';
import {
  Close, Add, Delete, Schedule, AccessTime,
  CheckCircle, Error, ContentCopy, Help
} from '@mui/icons-material';

export default function ScriptDialog({ 
  open, 
  onClose, 
  onSave, 
  editingScript,
  vendedorId 
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    horasDespuesActivacion: 24,
    scriptJson: '{}',
    activo: true,
    intentosPermitidos: 3,
    horarioInicio: '09:00',
    horarioFin: '21:00',
    ordenEjecucion: 1
  });

  const [preguntas, setPreguntas] = useState([]);
  const [scriptError, setScriptError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (editingScript) {
      setFormData({
        nombre: editingScript.nombre || '',
        descripcion: editingScript.descripcion || '',
        horasDespuesActivacion: editingScript.horasDespuesActivacion || 24,
        scriptJson: editingScript.scriptJson || '{}',
        activo: editingScript.activo !== false,
        intentosPermitidos: editingScript.intentosPermitidos || 3,
        horarioInicio: editingScript.horarioInicio?.substring(0, 5) || '09:00',
        horarioFin: editingScript.horarioFin?.substring(0, 5) || '21:00',
        ordenEjecucion: editingScript.ordenEjecucion || 1
      });

      try {
        const scriptData = JSON.parse(editingScript.scriptJson || '{}');
        setPreguntas(scriptData.preguntas || []);
      } catch (error) {
        setPreguntas([]);
      }
    } else {
      resetForm();
    }
  }, [editingScript, open]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      horasDespuesActivacion: 24,
      scriptJson: JSON.stringify({
        saludo: "Hola [nombre], soy el asistente de [vendedor]",
        preguntas: [
          {
            id: "p1",
            texto: "¿Recibiste bien tu cuenta de Netflix?",
            tipo: "si_no",
            opciones: [
              { valor: "si", accion: "agradecer", siguiente: "p2" },
              { valor: "no", accion: "transferir_soporte" }
            ]
          },
          {
            id: "p2",
            texto: "¿Tienes alguna sugerencia para mejorar?",
            tipo: "abierta",
            almacenarRespuesta: true
          }
        ],
        despedida: "Gracias por tu tiempo. ¡Que tengas un buen día!"
      }, null, 2),
      activo: true,
      intentosPermitidos: 3,
      horarioInicio: '09:00',
      horarioFin: '21:00',
      ordenEjecucion: 1
    });
    setPreguntas([]);
    setScriptError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateScriptJson = () => {
    try {
      const parsed = JSON.parse(formData.scriptJson);
      if (typeof parsed !== 'object') {
        throw new Error('El script debe ser un objeto JSON');
      }
      setScriptError('');
      return true;
    } catch (error) {
      setScriptError('JSON inválido: ' + error.message);
      return false;
    }
  };

  const handleAddQuestion = () => {
    const newId = `p${preguntas.length + 1}`;
    const nuevaPregunta = {
      id: newId,
      texto: '',
      tipo: 'si_no',
      opciones: [
        { valor: "si", accion: "continuar", siguiente: null },
        { valor: "no", accion: "continuar", siguiente: null }
      ]
    };
    setPreguntas([...preguntas, nuevaPregunta]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...preguntas];
    updated[index][field] = value;
    setPreguntas(updated);
  };

  const handleDeleteQuestion = (index) => {
    setPreguntas(preguntas.filter((_, i) => i !== index));
  };

  const generateScriptFromQuestions = () => {
    const script = {
      saludo: `Hola [nombre], soy el asistente de [vendedor]. ¿Cómo estás?`,
      preguntas: preguntas.map((p, index) => ({
        ...p,
        orden: index + 1
      })),
      despedida: "Gracias por tu tiempo. ¡Que tengas un buen día!",
      config: {
        timeout: 30,
        idioma: "es-ES",
        voz: "alice"
      }
    };
    
    setFormData(prev => ({
      ...prev,
      scriptJson: JSON.stringify(script, null, 2)
    }));
    setScriptError('');
  };

  const handleSave = async () => {
    if (!validateScriptJson()) {
      return;
    }

    setLoading(true);
    try {
      const scriptData = {
        ...formData,
        vendedorId: vendedorId || null,
        scriptJson: formData.scriptJson
      };

      await onSave(scriptData, editingScript?.id);
      onClose();
    } catch (error) {
      console.error('Error guardando script:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    try {
      const script = JSON.parse(formData.scriptJson);
      return (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Vista Previa del Script
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>🤖 Asistente:</strong> {script.saludo}
              </Typography>
            </Box>

            {script.preguntas?.map((pregunta, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>❓ Pregunta {index + 1}:</strong> {pregunta.texto}
                </Typography>
                {pregunta.tipo === 'si_no' && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label="Sí" size="small" color="success" />
                    <Chip label="No" size="small" color="error" />
                  </Stack>
                )}
                {pregunta.tipo === 'opciones' && pregunta.opciones && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    {pregunta.opciones.map((op, idx) => (
                      <Chip key={idx} label={op.valor} size="small" />
                    ))}
                  </Stack>
                )}
              </Box>
            ))}

            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>👋 Despedida:</strong> {script.despedida}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    } catch (error) {
      return (
        <Alert severity="error">
          Error en el formato del script: {error.message}
        </Alert>
      );
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#764ba2', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6">
            {editingScript ? '✏️ Editar Script' : '➕ Nuevo Script'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Configura el flujo de conversación para llamadas automáticas
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        {/* Modo preview/edición */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Chip
            label={previewMode ? 'Vista Previa' : 'Modo Edición'}
            color={previewMode ? 'info' : 'default'}
            onClick={() => setPreviewMode(!previewMode)}
            icon={previewMode ? <Help /> : <Edit />}
          />
          
          {!previewMode && preguntas.length > 0 && (
            <Button
              size="small"
              startIcon={<ContentCopy />}
              onClick={generateScriptFromQuestions}
            >
              Generar JSON desde preguntas
            </Button>
          )}
        </Box>

        {previewMode ? (
          renderPreview()
        ) : (
          <Grid container spacing={3}>
            {/* Columna izquierda - Configuración básica */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    CONFIGURACIÓN BÁSICA
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nombre del Script *"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Post-Activación 24h"
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Descripción"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        placeholder="Describe el propósito de este script..."
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Horas después de activación"
                        name="horasDespuesActivacion"
                        type="number"
                        value={formData.horasDespuesActivacion}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 1, max: 168 } }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Orden de ejecución"
                        name="ordenEjecucion"
                        type="number"
                        value={formData.ordenEjecucion}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 1, max: 10 } }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Horario inicio"
                        name="horarioInicio"
                        type="time"
                        value={formData.horarioInicio}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Horario fin"
                        name="horarioFin"
                        type="time"
                        value={formData.horarioFin}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Intentos permitidos"
                        name="intentosPermitidos"
                        type="number"
                        value={formData.intentosPermitidos}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 1, max: 10 } }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.activo}
                            onChange={handleChange}
                            name="activo"
                          />
                        }
                        label="Script activo"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Constructor de preguntas */}
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      PREGUNTAS DEL SCRIPT ({preguntas.length})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={handleAddQuestion}
                    >
                      Agregar Pregunta
                    </Button>
                  </Box>

                  {preguntas.length === 0 ? (
                    <Alert severity="info">
                      No hay preguntas configuradas. Agrega al menos una.
                    </Alert>
                  ) : (
                    <Stack spacing={2}>
                      {preguntas.map((pregunta, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" fontWeight="medium">
                              Pregunta #{index + 1} ({pregunta.id})
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteQuestion(index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>

                          <TextField
                            fullWidth
                            size="small"
                            label="Texto de la pregunta"
                            value={pregunta.texto}
                            onChange={(e) => handleUpdateQuestion(index, 'texto', e.target.value)}
                            sx={{ mb: 1 }}
                          />

                          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                            <InputLabel>Tipo de pregunta</InputLabel>
                            <Select
                              value={pregunta.tipo}
                              label="Tipo de pregunta"
                              onChange={(e) => handleUpdateQuestion(index, 'tipo', e.target.value)}
                            >
                              <MenuItem value="si_no">Sí/No</MenuItem>
                              <MenuItem value="opciones">Opciones múltiples</MenuItem>
                              <MenuItem value="abierta">Respuesta abierta</MenuItem>
                              <MenuItem value="numerica">Respuesta numérica</MenuItem>
                            </Select>
                          </FormControl>

                          {pregunta.tipo === 'opciones' && (
                            <TextField
                              fullWidth
                              size="small"
                              label="Opciones (separadas por coma)"
                              placeholder="Opción 1, Opción 2, Opción 3"
                              sx={{ mb: 1 }}
                            />
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Columna derecha - Editor JSON */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    EDITOR JSON DEL SCRIPT
                  </Typography>

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Variables disponibles:</strong>
                      <br />
                      • [nombre] - Nombre del cliente
                      <br />
                      • [vendedor] - Nombre del vendedor
                      <br />
                      • [servicio] - Nombre del servicio (Netflix, etc.)
                    </Typography>
                  </Alert>

                  {scriptError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {scriptError}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    rows={20}
                    value={formData.scriptJson}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, scriptJson: e.target.value }));
                      validateScriptJson();
                    }}
                    error={!!scriptError}
                    helperText={scriptError}
                    sx={{ 
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }}
                  />

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          scriptJson: JSON.stringify({
                            saludo: "Hola [nombre], soy el asistente de [vendedor]",
                            preguntas: [
                              {
                                id: "p1",
                                texto: "¿Recibiste bien tu cuenta de [servicio]?",
                                tipo: "si_no",
                                opciones: [
                                  { valor: "si", accion: "agradecer", siguiente: "p2" },
                                  { valor: "no", accion: "transferir_soporte" }
                                ]
                              },
                              {
                                id: "p2",
                                texto: "¿Tienes alguna sugerencia para [vendedor]?",
                                tipo: "abierta",
                                almacenarRespuesta: true
                              }
                            ],
                            despedida: "Gracias por tu tiempo. ¡Que tengas un buen día!"
                          }, null, 2)
                        }));
                        validateScriptJson();
                      }}
                    >
                      Cargar Ejemplo
                    </Button>

                    <Button
                      size="small"
                      onClick={validateScriptJson}
                    >
                      Validar JSON
                    </Button>

                    <Button
                      size="small"
                      onClick={() => {
                        try {
                          const formatted = JSON.stringify(JSON.parse(formData.scriptJson), null, 2);
                          setFormData(prev => ({ ...prev, scriptJson: formatted }));
                        } catch (error) {
                          setScriptError('No se puede formatear: ' + error.message);
                        }
                      }}
                    >
                      Formatear JSON
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !formData.nombre.trim() || !!scriptError}
          startIcon={loading ? <LinearProgress size={20} /> : <CheckCircle />}
        >
          {loading ? 'Guardando...' : (editingScript ? 'Actualizar' : 'Crear Script')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}