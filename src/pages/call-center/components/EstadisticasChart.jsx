import React from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  LinearProgress, Chip, Divider, Stack
} from '@mui/material';
import {
  TrendingUp, People, Timer, CheckCircle,
  Error, Warning, AccessTime
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell, LineChart, Line
} from 'recharts';

export default function EstadisticasChart({ estadisticas }) {
  if (!estadisticas) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando estadísticas...</Typography>
      </Box>
    );
  }

  // Preparar datos para gráficos
  const dataPorResultado = estadisticas.distribucion?.PorResultado || [];
  const dataPorSentimiento = estadisticas.distribucion?.PorSentimiento || [];
  const dataUltimos7Dias = estadisticas.tendencia?.Ultimos7Dias || [];
  const dataPorHora = estadisticas.tendencia?.PorHora || [];

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp sx={{ color: '#667eea', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Tasa de Éxito
                </Typography>
              </Box>
              <Typography variant="h3" color="#667eea">
                {estadisticas.totales?.TasaExito || 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={estadisticas.totales?.TasaExito || 0}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Timer sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Duración Promedio
                </Typography>
              </Box>
              <Typography variant="h3" color="#ff9800">
                {Math.round(estadisticas.tiempos?.PromedioDuracion || 0)}s
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Por llamada
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Positivas
                </Typography>
              </Box>
              <Typography variant="h3" color="#4caf50">
                {dataPorSentimiento.find(s => s.Sentimiento === 'POSITIVO')?.Cantidad || 0}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label="Positivo" size="small" color="success" />
                <Chip label="Neutral" size="small" />
                <Chip label="Negativo" size="small" color="error" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTime sx={{ color: '#9c27b0', mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Llamadas Hoy
                </Typography>
              </Box>
              <Typography variant="h3" color="#9c27b0">
                {estadisticas.totales?.LlamadasHoy || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Últimas 24 horas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de tendencia últimos 7 días */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              📈 Tendencia (Últimos 7 días)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataUltimos7Dias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cantidad" 
                    stroke="#667eea" 
                    name="Llamadas"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico por sentimiento */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              😊 Sentimiento de Clientes
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPorSentimiento}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {dataPorSentimiento.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico por resultado */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              📞 Resultados de Llamadas
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataPorResultado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="resultado" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cantidad" name="Cantidad" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico por hora del día */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              🕐 Llamadas por Hora
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataPorHora}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hora" 
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => `${value}:00 - ${parseInt(value) + 1}:00`}
                  />
                  <Bar dataKey="cantidad" name="Llamadas" fill="#4facfe" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Distribución detallada */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Distribución Detallada
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Por Resultado:
            </Typography>
            {dataPorResultado.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">{item.resultado}</Typography>
                  <Typography variant="body2" fontWeight="bold">{item.cantidad}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(item.cantidad / dataPorResultado.reduce((a, b) => a + b.cantidad, 0)) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Por Sentimiento:
            </Typography>
            {dataPorSentimiento.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">{item.sentimiento}</Typography>
                  <Typography variant="body2" fontWeight="bold">{item.cantidad}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(item.cantidad / dataPorSentimiento.reduce((a, b) => a + b.cantidad, 0)) * 100}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: item.sentimiento === 'POSITIVO' ? '#e8f5e9' :
                                    item.sentimiento === 'NEGATIVO' ? '#ffebee' : '#f5f5f5',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: item.sentimiento === 'POSITIVO' ? '#4caf50' :
                                      item.sentimiento === 'NEGATIVO' ? '#f44336' : '#9e9e9e'
                    }
                  }}
                />
              </Box>
            ))}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}