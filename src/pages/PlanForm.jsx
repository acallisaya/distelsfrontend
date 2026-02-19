// PlanForm.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
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
import { Close, Save, Timer, AttachMoney } from "@mui/icons-material";
import { API_BASE_URL } from "../config";

const COLOR_PALETTE = {
  primary: "#764ba2",
  secondary: "#f5576c",
  success: "#4caf50",
  dark: "#040404"
};

export default function PlanForm({ open, onClose, planData, servicios, onSave }) {
  const [formData, setFormData] = useState({
    idServicio: planData?.idServicio || '',
    nombre: planData?.nombre || '',
    duracionDias: planData?.duracionDias || 30,
    precioCompra: planData?.precioCompra || 0,
    precioVenta: planData?.precioVenta || 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!planData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.idServicio || !formData.nombre || !formData.precioVenta) {
      setError("Complete todos los campos requeridos");
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
        const error = await res.json();
        setError(error.message || 'Error al guardar');
      }
    } catch  {
      setError('Error al guardar');
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
      <Paper sx={{ background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`, color: 'white', p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isEditing ? '✏️ Editar Plan' : '➕ Nuevo Plan'}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </Paper>

      <DialogContent sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Servicio</InputLabel>
              <Select
                name="idServicio"
                value={formData.idServicio}
                onChange={handleChange}
                label="Servicio"
              >
                {servicios.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre del Plan"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Duración (días)"
              name="duracionDias"
              type="number"
              value={formData.duracionDias}
              onChange={handleChange}
              size="small"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Precio Compra"
              name="precioCompra"
              type="number"
              value={formData.precioCompra}
              onChange={handleChange}
              size="small"
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Precio Venta"
              name="precioVenta"
              type="number"
              value={formData.precioVenta}
              onChange={handleChange}
              size="small"
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ganancia"
              value={ganancia}
              size="small"
              InputProps={{ readOnly: true, sx: { color: COLOR_PALETTE.success, fontWeight: 'bold' } }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          sx={{ background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})` }}
        >
          {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}