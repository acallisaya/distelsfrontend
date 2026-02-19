import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { API_BASE_URL } from "../config";

const COLOR_PALETTE = {
  primary: "#764ba2",
  secondary: "#f5576c",
  success: "#4caf50",
  dark: "#040404"
};

export default function PlanForm({ open, onClose, planData, servicios, onSave }) {
  const [formData, setFormData] = useState({
    idServicio: '',
    nombre: '',
    duracionDias: 30,
    precioCompra: 0,
    precioVenta: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      if (planData) {
        setIsEditing(true);
        setFormData({
          idServicio: planData.idServicio || '',
          nombre: planData.nombre || '',
          duracionDias: planData.duracionDias || 30,
          precioCompra: planData.precioCompra || 0,
          precioVenta: planData.precioVenta || 0
        });
      } else {
        setIsEditing(false);
        setFormData({
          idServicio: '',
          nombre: '',
          duracionDias: 30,
          precioCompra: 0,
          precioVenta: 0
        });
      }
      setError("");
    }
  }, [open, planData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.idServicio) {
      setError("Debe seleccionar un servicio");
      return;
    }
    if (!formData.nombre.trim()) {
      setError("El nombre del plan es requerido");
      return;
    }
    if (!formData.duracionDias || formData.duracionDias < 1) {
      setError("La duración debe ser al menos 1 día");
      return;
    }
    if (formData.precioVenta <= 0) {
      setError("El precio de venta debe ser mayor a 0");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${API_BASE_URL}/Planes/${planData.idPlan}`
        : `${API_BASE_URL}/Planes`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.status === 401) {
        window.location.href = '/';
        return;
      }

      if (res.ok) {
        onSave();
        onClose();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Error al guardar el plan');
      }
    } catch  {
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const ganancia = (formData.precioVenta - formData.precioCompra).toFixed(2);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      {/* Header con gradiente */}
      <Paper
        sx={{
          background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
          color: 'white',
          p: 2,
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              {isEditing ? '✏️ Editar Plan' : '➕ Nuevo Plan'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
              {isEditing ? 'Actualiza los datos del plan' : 'Crea un nuevo plan para el servicio'}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Paper>

      <DialogContent sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1, fontSize: '0.85rem' }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          {/* Selector de Servicio - CORREGIDO */}
          <FormControl fullWidth size="small" required>
            <InputLabel sx={{ fontSize: '0.85rem' }}>Servicio</InputLabel>
            <Select
              name="idServicio"
              value={formData.idServicio}
              onChange={handleChange}
              label="Servicio"
              sx={{ fontSize: '0.85rem' }}
            >
              {servicios.map(servicio => (
                <MenuItem 
                  key={servicio.idServicio || servicio.id} 
                  value={servicio.idServicio || servicio.id} 
                  sx={{ fontSize: '0.85rem' }}
                >
                  {servicio.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Nombre del Plan */}
          <TextField
            fullWidth
            label="Nombre del Plan *"
            name="nombre"
            size="small"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Plan 30 días, 1 Pantalla, etc."
            InputProps={{ style: { fontSize: '0.85rem' } }}
            InputLabelProps={{ style: { fontSize: '0.85rem' } }}
          />

          {/* Grid para campos numéricos */}
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duración (días) *"
                name="duracionDias"
                type="number"
                size="small"
                value={formData.duracionDias}
                onChange={handleChange}
                InputProps={{ 
                  inputProps: { min: 1, max: 365 },
                  style: { fontSize: '0.85rem' }
                }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de Compra *"
                name="precioCompra"
                type="number"
                size="small"
                value={formData.precioCompra}
                onChange={handleChange}
                InputProps={{ 
                  inputProps: { min: 0, step: 0.01 },
                  style: { fontSize: '0.85rem' }
                }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de Venta *"
                name="precioVenta"
                type="number"
                size="small"
                value={formData.precioVenta}
                onChange={handleChange}
                InputProps={{ 
                  inputProps: { min: 0, step: 0.01 },
                  style: { fontSize: '0.85rem' }
                }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ganancia"
                size="small"
                value={ganancia}
                InputProps={{
                  readOnly: true,
                  sx: { 
                    color: COLOR_PALETTE.success, 
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }
                }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLOR_PALETTE.dark}10` }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{
            borderRadius: 1,
            px: 3,
            fontSize: '0.85rem',
            color: COLOR_PALETTE.dark,
            border: `1px solid ${COLOR_PALETTE.dark}20`,
            '&:hover': { backgroundColor: `${COLOR_PALETTE.dark}05` }
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Save />}
          sx={{ 
            background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
            borderRadius: 1,
            px: 3,
            fontSize: '0.85rem',
            '&:hover': { boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)' }
          }}
        >
          {loading ? 'Guardando...' : (isEditing ? 'Actualizar Plan' : 'Crear Plan')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}