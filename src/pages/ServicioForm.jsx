import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Paper
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { API_BASE_URL } from "../config";

const COLOR_PALETTE = {
  primary: "#667eea",
  secondary: "#f5576c",
  success: "#4caf50",
  dark: "#040404"
};

export default function ServicioForm({ open, onClose, servicioData, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    maxPerfiles: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      if (servicioData) {
        setIsEditing(true);
        setFormData({
          nombre: servicioData.nombre || '',
          codigo: servicioData.codigo || '',
          maxPerfiles: servicioData.maxPerfiles ?? 0
        });
      } else {
        setIsEditing(false);
        setFormData({
          nombre: '',
          codigo: '',
          maxPerfiles: 0
        });
      }
      setError("");
      setFormErrors({});
    }
  }, [open, servicioData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'maxPerfiles') {
      // Si está vacío, mantener como 0 pero permitir borrar
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          [name]: 0
        }));
        return;
      }
      
      // Solo permitir dígitos
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Si después de limpiar queda vacío, poner 0
      if (numericValue === '') {
        setFormData(prev => ({
          ...prev,
          [name]: 0
        }));
        return;
      }
      
      const numValue = parseInt(numericValue, 10);
      
      // Limitar entre 0 y 99
      if (!isNaN(numValue)) {
        const limitedValue = Math.min(99, Math.max(0, numValue));
        setFormData(prev => ({
          ...prev,
          [name]: limitedValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 50) {
      errors.nombre = 'El nombre no puede exceder 50 caracteres';
    }
    
    if (!formData.codigo.trim()) {
      errors.codigo = 'El código es requerido';
    } else if (formData.codigo.length > 10) {
      errors.codigo = 'El código no puede exceder 10 caracteres';
    }
    
    if (formData.maxPerfiles < 0) {
      errors.maxPerfiles = 'El valor no puede ser negativo';
    } else if (formData.maxPerfiles > 99) {
      errors.maxPerfiles = 'El valor máximo es 99';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${API_BASE_URL}/Servicios/${servicioData.idServicio}`
        : `${API_BASE_URL}/Servicios`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          maxPerfiles: formData.maxPerfiles || 0
        })
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
        setError(errorData.message || 'Error al guardar el servicio');
      }
    } catch {
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

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
              {isEditing ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
              {isEditing ? 'Actualiza los datos del servicio' : 'Crea un nuevo servicio de streaming'}
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
          {/* Nombre del Servicio */}
          <TextField
            fullWidth
            label="Nombre del Servicio *"
            name="nombre"
            size="small"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Netflix, Disney+, HBO Max"
            error={!!formErrors.nombre}
            helperText={formErrors.nombre}
            InputProps={{ style: { fontSize: '0.85rem' } }}
            InputLabelProps={{ style: { fontSize: '0.85rem' } }}
          />

          {/* Código */}
          <TextField
            fullWidth
            label="Código *"
            name="codigo"
            size="small"
            value={formData.codigo}
            onChange={handleChange}
            placeholder="Ej: NETFLIX, DISNEY, HBO"
            error={!!formErrors.codigo}
            helperText={formErrors.codigo}
            InputProps={{ style: { fontSize: '0.85rem' } }}
            InputLabelProps={{ style: { fontSize: '0.85rem' } }}
          />

          {/* Máximo de Perfiles - CORREGIDO: permite borrar el 0 */}
          <TextField
            fullWidth
            label="Máximo de Perfiles"
            name="maxPerfiles"
            type="text"
            size="small"
            // 👇 Clave: muestra vacío si es 0, así se puede borrar
            value={formData.maxPerfiles === 0 ? '' : formData.maxPerfiles}
            onChange={handleChange}
            error={!!formErrors.maxPerfiles}
            helperText={formErrors.maxPerfiles || "0 = no genera PINs ni perfiles en tarjetas"}
            inputProps={{ 
              inputMode: 'numeric',  // Para móviles muestra teclado numérico
              pattern: '[0-9]*'      // Solo permite números
            }}
            InputProps={{ 
              style: { fontSize: '0.85rem' }
            }}
            InputLabelProps={{ style: { fontSize: '0.85rem' } }}
          />
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
          {loading ? 'Guardando...' : (isEditing ? 'Actualizar Servicio' : 'Crear Servicio')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}