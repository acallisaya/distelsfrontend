import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Avatar,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  CardMedia,
  CardActions,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  Phone,
  Email,
  Edit,
  LocationOn,
  Schedule,
  Business,
  WhatsApp,
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  YouTube,
  Share,
  QrCode,
  Refresh,
  Close,
  Settings,
  Star,
  ContentCopy,
  Computer,
  Store,
  TrendingUp,
  Palette,
  Security,
  PlayArrow,
  InsertPhoto,
  VideoLibrary,
  ExpandMore,
  Favorite,
  Visibility,
  Download,
  Chat,
  ThumbUp,
  Warning
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '../config';

// Mapeo de iconos
const iconosMap = {
  'Computer': <Computer />,
  'Store': <Store />,
  'TrendingUp': <TrendingUp />,
  'Palette': <Palette />,
  'Settings': <Settings />,
  'Security': <Security />,
  'Phone': <Phone />,
  'Email': <Email />,
  'Business': <Business />,
  'Default': <Settings />
};

// Función para extraer ID de video de YouTube
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function PreviewPagePro() {
  const { clienteId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [pagina, setPagina] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    console.log('🔍 PreviewPagePro iniciado');
    console.log('📌 Cliente ID:', clienteId);
    
    const loadData = async () => {
      if (!clienteId) {
        setError('ID de cliente no proporcionado');
        return;
      }

      // PRIMERO: Intentar obtener datos del formulario (para preview)
      const encodedData = searchParams.get('data');
      
      if (encodedData) {
        try {
          const decodedData = atob(encodedData);
          const paginaData = JSON.parse(decodedData);
          
          console.log('✅ Datos del formulario recibidos:', paginaData);
          setPagina(paginaData);
          
          // Intentar cargar datos del cliente
          await fetchClienteData(clienteId);
          return;
        } catch (err) {
          console.error('❌ Error decodificando datos:', err);
        }
      }
      
      // SEGUNDO: Intentar obtener datos guardados (página ya creada)
      await fetchPaginaGuardada(clienteId);
    };

    loadData();
  }, [clienteId, searchParams]);

  const fetchClienteData = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/Clientes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCliente(data);
        console.log('✅ Cliente cargado:', data);
      }
    } catch (err) {
      console.error('Error cargando cliente:', err);
    }
  };

  const fetchPaginaGuardada = async (clienteId) => {
    try {
      setLoading(true);
      
      // Intentar obtener la página del cliente
      const res = await fetch(`${API_BASE_URL}/ClientePaginas/cliente/${clienteId}`);
      
      if (res.ok) {
        const paginaData = await res.json();
        console.log('✅ Página cargada desde API:', paginaData);
        setPagina(paginaData);
        
        // Cargar también datos del cliente
        await fetchClienteData(clienteId);
      } else if (res.status === 404) {
        // No hay página guardada, verificar en localStorage
        const previewData = localStorage.getItem(`preview_${clienteId}`);
        if (previewData) {
          try {
            const paginaData = JSON.parse(previewData);
            console.log('✅ Datos de localStorage:', paginaData);
            setPagina(paginaData);
          } catch (err) {
            console.error('Error parseando localStorage:', err);
            setError('No hay página configurada para este cliente');
          }
        } else {
          setError('No hay página configurada para este cliente');
        }
      }
    } catch (err) {
      console.error('Error cargando página:', err);
      setError('Error al cargar la página');
    } finally {
      setLoading(false);
    }
  };

  // Generar URL de la página
  const getPageUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/pagina/${clienteId}`;
  };

  // Función para volver al formulario de edición - CORREGIDA
  const handleVolverAlEditor = () => {
    console.log('🔙 Confirmando salida del preview...');
    setConfirmExitOpen(true);
  };

  // Función para confirmar salida
  const handleConfirmExit = () => {
    console.log('🚪 Saliendo del preview...');
    
    // Guardar datos actuales para posible recuperación
    if (pagina && clienteId) {
      const datosParaRecuperar = {
        ...pagina,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(`lastPreview_${clienteId}`, JSON.stringify(datosParaRecuperar));
    }
    
    // Limpiar datos temporales
    localStorage.removeItem(`preview_${clienteId}`);
    
    // Navegar de regreso a ClientesListPro
    navigate('/ClientesListPro', { 
      state: { 
        fromPreview: true,
        clienteId: clienteId,
        message: 'Has salido de la vista previa' 
      } 
    });
  };

  

  // Función para abrir el formulario en nueva pestaña
  const handleAbrirEditorEnNuevaPestana = () => {
    if (pagina && clienteId) {
      const datosParaFormulario = {
        ...pagina,
        clienteId: clienteId
      };
      
      const formDataKey = `pagina_newtab_${clienteId}_${new Date().getTime()}`;
      localStorage.setItem(formDataKey, JSON.stringify(datosParaFormulario));
      
      const baseUrl = window.location.origin;
      const editUrl = `${baseUrl}/clientes/${clienteId}/pagina/editar?source=preview&newtab=true&key=${formDataKey}`;
      
      window.open(editUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Mostrar snackbar
  const handleShowSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Renderizar íconos de redes sociales
  const renderRedesSociales = () => {
    if (!pagina) return null;

    const redes = [];
    
    if (pagina.whatsappUrl) {
      redes.push({
        icon: <WhatsApp />,
        url: pagina.whatsappUrl,
        color: '#25D366',
        label: 'WhatsApp'
      });
    }
    
    if (pagina.facebookUrl) {
      redes.push({
        icon: <Facebook />,
        url: pagina.facebookUrl,
        color: '#1877F2',
        label: 'Facebook'
      });
    }
    
    if (pagina.instagramUrl) {
      redes.push({
        icon: <Instagram />,
        url: pagina.instagramUrl,
        color: '#E4405F',
        label: 'Instagram'
      });
    }
    
    if (pagina.twitterUrl) {
      redes.push({
        icon: <Twitter />,
        url: pagina.twitterUrl,
        color: '#1DA1F2',
        label: 'Twitter'
      });
    }
    
    if (pagina.linkedinUrl) {
      redes.push({
        icon: <LinkedIn />,
        url: pagina.linkedinUrl,
        color: '#0A66C2',
        label: 'LinkedIn'
      });
    }
    
    if (pagina.youtubeUrl) {
      redes.push({
        icon: <YouTube />,
        url: pagina.youtubeUrl,
        color: '#FF0000',
        label: 'YouTube'
      });
    }

    if (redes.length === 0) return null;

    return (
      <Box key="redes" sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Síguenos en Redes Sociales
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          {redes.map((red, index) => (
            <IconButton
              key={index}
              component="a"
              href={red.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: red.color,
                color: 'white',
                '&:hover': { bgcolor: red.color, opacity: 0.9 },
                width: 56,
                height: 56
              }}
              title={red.label}
            >
              {red.icon}
            </IconButton>
          ))}
        </Stack>
      </Box>
    );
  };

  // Renderizar testimonios personalizados
  const renderTestimoniosPersonalizados = () => {
    if (!pagina?.testimoniosPersonalizados || pagina.testimoniosPersonalizados.length === 0) {
      return null;
    }

    const testimoniosActivos = pagina.testimoniosPersonalizados.filter(t => t.activo !== false);
    if (testimoniosActivos.length === 0) return null;

    return (
      <Box key="testimonios" sx={{ mb: 6, py: 6, bgcolor: '#f8f9fa', borderRadius: 3 }}>
        <Typography variant="h2" gutterBottom sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
          Lo Que Dicen Nuestros Clientes
        </Typography>
        
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 6, color: 'text.secondary', maxWidth: '800px', mx: 'auto' }}>
          Descubre la experiencia de quienes ya han confiado en nosotros
        </Typography>
        
        <Grid container spacing={4}>
          {testimoniosActivos.map((testimonio, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Calificación */}
                  <Box sx={{ display: 'flex', mb: 3, justifyContent: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        sx={{ 
                          color: i < (testimonio.calificacion || 5) ? '#FFD700' : '#e0e0e0', 
                          fontSize: '1.8rem',
                          mx: 0.5
                        }} 
                      />
                    ))}
                  </Box>
                  
                  {/* Comentario */}
                  <Typography variant="body1" sx={{ 
                    fontStyle: 'italic', 
                    mb: 3, 
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    textAlign: 'center',
                    position: 'relative',
                    '&:before, &:after': {
                      content: '"\\201C"',
                      fontSize: '3rem',
                      color: pagina?.colorPrimario || '#667eea',
                      opacity: 0.3,
                      position: 'absolute',
                      top: '-10px',
                      left: '-15px'
                    },
                    '&:after': {
                      content: '"\\201D"',
                      left: 'auto',
                      right: '-15px',
                      top: 'auto',
                      bottom: '-30px'
                    }
                  }}>
                    {testimonio.comentario}
                  </Typography>
                  
                  {/* Información del cliente */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Avatar sx={{ 
                      mr: 2, 
                      bgcolor: pagina?.colorPrimario || '#667eea',
                      width: 60,
                      height: 60,
                      fontSize: '1.5rem'
                    }}>
                      {testimonio.nombre?.charAt(0) || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {testimonio.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {testimonio.cargo}
                      </Typography>
                      <Chip 
                        label="Cliente Verificado" 
                        size="small" 
                        sx={{ 
                          bgcolor: '#e8f5e9', 
                          color: '#2e7d32',
                          fontSize: '0.7rem'
                        }} 
                      />
                    </Box>
                  </Box>
                </CardContent>
                
                {/* Acciones */}
                <CardActions sx={{ p: 2, bgcolor: '#f5f5f5', justifyContent: 'center' }}>
                  <IconButton size="small" color="primary">
                    <ThumbUp />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <Chat />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <Share />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Estadísticas */}
        <Box sx={{ textAlign: 'center', mt: 6, pt: 4, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: pagina?.colorPrimario || '#667eea' }}>
                {testimoniosActivos.length}+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clientes Satisfechos
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: pagina?.colorPrimario || '#667eea' }}>
                {testimoniosActivos.reduce((acc, t) => acc + (t.calificacion || 5), 0) / testimoniosActivos.length}/5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calificación Promedio
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: pagina?.colorPrimario || '#667eea' }}>
                100%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tasa de Recomendación
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  // Renderizar galerías de imágenes
  const renderGaleriasImagenes = () => {
    if (!pagina?.galeriasImagenes || pagina.galeriasImagenes.length === 0) {
      return null;
    }

    const galeriasActivas = pagina.galeriasImagenes.filter(g => g.activo !== false);
    if (galeriasActivas.length === 0) return null;

    return (
      <Box key="galerias" sx={{ mb: 6 }}>
        {galeriasActivas.map((galeria, galeriaIndex) => {
          const imagenesConUrl = galeria.imagenes.filter(img => img.url && img.url.trim() !== '');
          if (imagenesConUrl.length === 0) return null;

          return (
            <Box key={galeriaIndex} sx={{ mb: 8 }}>
              <Typography variant="h2" gutterBottom sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                {galeria.titulo || 'Nuestra Galería'}
              </Typography>
              
              {galeria.descripcion && (
                <Typography variant="h5" sx={{ 
                  textAlign: 'center', 
                  mb: 6, 
                  color: 'text.secondary',
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}>
                  {galeria.descripcion}
                </Typography>
              )}

              <Grid container spacing={3}>
                {imagenesConUrl.map((imagen, imgIndex) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={imgIndex}>
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': { 
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                        '& .image-overlay': {
                          opacity: 1
                        }
                      }
                    }}>
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="240"
                          image={imagen.url}
                          alt={imagen.titulo}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        
                        <Box className="image-overlay" sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease-in-out'
                        }}>
                          <Stack direction="row" spacing={1}>
                            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}>
                              <Visibility />
                            </IconButton>
                            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}>
                              <Favorite />
                            </IconButton>
                            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}>
                              <Share />
                            </IconButton>
                          </Stack>
                        </Box>
                        
                        <Chip 
                          label={`${imgIndex + 1}/${imagenesConUrl.length}`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {imagen.titulo || 'Imagen sin título'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '40px'
                        }}>
                          {imagen.descripcion || 'Sin descripción disponible'}
                        </Typography>
                      </CardContent>
                      
                      <CardActions sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                        <Button 
                          size="small" 
                          startIcon={<Visibility />}
                          onClick={() => window.open(imagen.url, '_blank')}
                          sx={{ color: pagina?.colorPrimario }}
                        >
                          Ver en grande
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Download />}
                          sx={{ color: pagina?.colorPrimario }}
                        >
                          Descargar
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Chip 
                  icon={<InsertPhoto />}
                  label={`${imagenesConUrl.length} imagen${imagenesConUrl.length !== 1 ? 'es' : ''} en esta galería`}
                  sx={{ 
                    bgcolor: pagina?.colorPrimario + '20',
                    color: pagina?.colorPrimario,
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1
                  }}
                />
              </Box>
            </Box>
          );
        })}
        
        {galeriasActivas.every(g => g.imagenes.filter(img => img.url && img.url.trim() !== '').length === 0) && (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <InsertPhoto sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Galerías de Imágenes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Añade imágenes a tus galerías desde el editor para verlas aquí
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  // Renderizar videos embebidos
  const renderVideosEmbebidos = () => {
    if (!pagina?.videosEmbebidos || pagina.videosEmbebidos.length === 0) {
      return null;
    }

    const videosActivos = pagina.videosEmbebidos.filter(v => v.activo !== false && v.url && v.url.trim() !== '');
    if (videosActivos.length === 0) return null;

    return (
      <Box key="videos" sx={{ mb: 6, py: 4, bgcolor: '#f5f9ff', borderRadius: 3 }}>
        <Typography variant="h2" gutterBottom sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
          Nuestros Videos
        </Typography>
        
        <Typography variant="h5" sx={{ 
          textAlign: 'center', 
          mb: 6, 
          color: 'text.secondary',
          maxWidth: '800px',
          mx: 'auto'
        }}>
          Mira nuestro contenido en video para conocernos mejor
        </Typography>

        <Grid container spacing={4}>
          {videosActivos.map((video, index) => {
            const videoId = extractYouTubeId(video.url);
            const embedUrl = videoId 
              ? `https://www.youtube.com/embed/${videoId}`
              : video.url.includes('vimeo')
                ? `https://player.vimeo.com/video/${video.url.split('/').pop()}`
                : video.url;

            return (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ 
                      position: 'relative', 
                      paddingTop: '56.25%',
                      borderRadius: '8px 8px 0 0',
                      overflow: 'hidden',
                      bgcolor: '#000'
                    }}>
                      {video.url.includes('<iframe') ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: video.url }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0
                          }}
                        />
                      ) : (
                        <iframe
                          src={embedUrl}
                          title={video.titulo}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                      
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out',
                        '&:hover': {
                          opacity: 1
                        }
                      }}>
                        <PlayArrow sx={{ 
                          fontSize: 80, 
                          color: 'white',
                          opacity: 0.8 
                        }} />
                      </Box>
                    </Box>
                    
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <VideoLibrary sx={{ mr: 1, color: pagina?.colorPrimario }} />
                        <Typography variant="caption" color="text.secondary">
                          {video.tipo === 'youtube' ? 'YouTube' : 
                           video.tipo === 'vimeo' ? 'Vimeo' : 'Video'}
                        </Typography>
                      </Box>
                      
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {video.titulo || 'Video sin título'}
                      </Typography>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {video.descripcion || 'Descripción no disponible'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label="Video Corporativo" 
                          size="small" 
                          sx={{ bgcolor: pagina?.colorPrimario + '20', color: pagina?.colorPrimario }}
                        />
                        <Chip 
                          label={video.tipo === 'youtube' ? 'YouTube' : 'Vimeo'} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
                    <Button 
                      startIcon={<PlayArrow />}
                      onClick={() => window.open(video.url, '_blank')}
                      sx={{ color: pagina?.colorPrimario }}
                    >
                      Ver en {video.tipo === 'youtube' ? 'YouTube' : 'Vimeo'}
                    </Button>
                    <Button 
                      startIcon={<Share />}
                      sx={{ color: pagina?.colorPrimario }}
                    >
                      Compartir
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 6, pt: 4, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={6} md={2}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: pagina?.colorPrimario }}>
                {videosActivos.length}+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Videos
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: pagina?.colorPrimario }}>
                500K+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualizaciones
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: pagina?.colorPrimario }}>
                95%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Satisfacción
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  // Renderizar sección de servicios (personalizados) - SIEMPRE VISIBLE
  const renderServicios = () => {
    const serviciosMostrar = pagina?.serviciosPersonalizados || [
      { nombre: 'Desarrollo Web', descripcion: 'Sitios web modernos y responsivos', icono: 'Computer' },
      { nombre: 'E-commerce', descripcion: 'Tiendas online completas y seguras', icono: 'Store' },
      { nombre: 'Marketing Digital', descripcion: 'Estrategias para aumentar tu visibilidad', icono: 'TrendingUp' },
      { nombre: 'Diseño UI/UX', descripcion: 'Experiencias de usuario excepcionales', icono: 'Palette' },
      { nombre: 'Consultoría IT', descripcion: 'Asesoramiento especializado en tecnología', icono: 'Settings' },
      { nombre: 'Ciberseguridad', descripcion: 'Protección de datos y sistemas', icono: 'Security' },
    ];

    const serviciosActivos = serviciosMostrar.filter(s => s.activo !== false);

    return (
      <Box key="servicios" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
          Nuestros Servicios
        </Typography>
        
        <Typography variant="h5" sx={{ 
          textAlign: 'center', 
          mb: 6, 
          color: 'text.secondary',
          maxWidth: '800px',
          mx: 'auto'
        }}>
          Soluciones personalizadas para hacer crecer tu negocio
        </Typography>
        
        <Grid container spacing={4}>
          {serviciosActivos.map((servicio, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                height: '100%', 
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: `${pagina?.colorPrimario}20`,
                    color: pagina?.colorPrimario,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: pagina?.colorPrimario,
                      color: 'white'
                    }
                  }}>
                    {iconosMap[servicio.icono] || iconosMap.Default}
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {servicio.nombre}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {servicio.descripcion}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      borderColor: pagina?.colorPrimario,
                      color: pagina?.colorPrimario,
                      '&:hover': {
                        bgcolor: pagina?.colorPrimario,
                        color: 'white'
                      }
                    }}
                  >
                    Más Información
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Renderizar todas las secciones
  const renderSecciones = () => {
    if (loading) {
      return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>Cargando vista previa...</Typography>
        </Box>
      );
    }

    if (!pagina) {
      return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>Cargando vista previa...</Typography>
        </Box>
      );
    }

    return (
      <>
        {/* Hero Section */}
        <Box key="hero" sx={{ 
          py: { xs: 8, md: 12 },
          background: pagina?.bannerUrl 
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${pagina.bannerUrl})` 
            : `linear-gradient(135deg, ${pagina?.colorPrimario || '#667eea'}, ${pagina?.colorSecundario || '#764ba2'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center',
          borderRadius: 3,
          mb: 8,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            zIndex: 1
          }} />
          
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            {pagina?.logoUrl && (
              <Box sx={{ mb: 6 }}>
                <img 
                  src={pagina.logoUrl} 
                  alt="Logo" 
                  style={{ 
                    height: '100px', 
                    objectFit: 'contain',
                    maxWidth: '100%',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }} 
                />
              </Box>
            )}
            
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              fontWeight: 'bold',
              mb: 3,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              {pagina?.encabezado || 'Bienvenido'}
            </Typography>
            
            {pagina?.subtitulo && (
              <Typography variant="h3" sx={{ 
                mb: 4, 
                opacity: 0.95,
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 300
              }}>
                {pagina.subtitulo}
              </Typography>
            )}
            
            {pagina?.descripcionCorta && (
              <Typography variant="h5" sx={{ 
                mb: 6, 
                fontSize: '1.25rem', 
                maxWidth: '800px', 
                mx: 'auto',
                opacity: 0.9,
                fontWeight: 300,
                lineHeight: 1.6
              }}>
                {pagina.descripcionCorta}
              </Typography>
            )}
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button 
                variant="contained" 
                size="large" 
                sx={{ 
                  bgcolor: 'white', 
                  color: pagina?.colorPrimario,
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5,
                  '&:hover': { 
                    bgcolor: '#f5f5f5',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Contactar Ahora
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  borderWidth: 2,
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5,
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    borderWidth: 2
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Ver Servicios
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* Contenido principal */}
        {pagina?.cuerpo && (
          <Paper key="contenido" sx={{ 
            p: { xs: 4, md: 6 }, 
            mb: 8, 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}>
            <ReactMarkdown>
              {pagina.cuerpo}
            </ReactMarkdown>
          </Paper>
        )}

        {/* Servicios personalizados - SIEMPRE VISIBLE */}
        {renderServicios()}

        {/* Testimonios personalizados */}
        {renderTestimoniosPersonalizados()}

        {/* Galerías de imágenes */}
        {renderGaleriasImagenes()}

        {/* Videos embebidos */}
        {renderVideosEmbebidos()}

        {/* Contacto - SOLO SI mostrarContacto está activo */}
        {pagina?.mostrarContacto && (
          <Paper key="contacto" sx={{ 
            p: { xs: 4, md: 6 }, 
            mb: 8, 
            borderRadius: 3, 
            bgcolor: `${pagina?.colorPrimario}08`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}>
            <Typography variant="h2" gutterBottom sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}>
              Contáctanos
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <LocationOn sx={{ color: pagina?.colorPrimario, fontSize: 30 }} /> 
                    <span>Dirección</span>
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                    {pagina?.direccion || 'Av. Ejemplo 123, Ciudad, País'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Phone sx={{ color: pagina?.colorPrimario, fontSize: 30 }} /> 
                    <span>Teléfono</span>
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                    {pagina?.telefono || '+51 999 999 999'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Email sx={{ color: pagina?.colorPrimario, fontSize: 30 }} /> 
                    <span>Email</span>
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                    {pagina?.email || 'contacto@empresa.com'}
                  </Typography>
                </Box>
                
                {pagina?.horarioAtencion && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Schedule sx={{ color: pagina?.colorPrimario, fontSize: 30 }} /> 
                      <span>Horario de Atención</span>
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                      {pagina.horarioAtencion}
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                  <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    Envíanos un Mensaje
                  </Typography>
                  <Stack spacing={3}>
                    <TextField 
                      label="Nombre completo" 
                      fullWidth 
                      variant="outlined"
                      size="medium"
                    />
                    <TextField 
                      label="Email" 
                      fullWidth 
                      variant="outlined"
                      size="medium"
                    />
                    <TextField 
                      label="Teléfono" 
                      fullWidth 
                      variant="outlined"
                      size="medium"
                    />
                    <TextField 
                      label="Asunto" 
                      fullWidth 
                      variant="outlined"
                      size="medium"
                    />
                    <TextField 
                      label="Mensaje" 
                      multiline 
                      rows={5} 
                      fullWidth 
                      variant="outlined"
                      size="medium"
                    />
                    <Button 
                      variant="contained" 
                      size="large" 
                      sx={{ 
                        bgcolor: pagina?.colorPrimario,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          bgcolor: pagina?.colorPrimario,
                          opacity: 0.9
                        }
                      }}
                    >
                      Enviar Mensaje
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Redes Sociales */}
        {renderRedesSociales()}
      </>
    );
  };

  // Si hay error, mostrar mensaje
  if (error && !pagina) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            ⚠️ Vista previa no disponible
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/ClientesListPro')}>
            Volver a ClientesListPro
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        backgroundColor: pagina?.colorFondo || '#f5f5f5',
        color: pagina?.colorTexto || '#333333',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      {/* Banner de preview */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #ff9800, #ff5722)',
          color: 'white',
          py: 1.5,
          px: 3,
          textAlign: 'center',
          zIndex: 10000,
          fontWeight: 'bold',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Refresh sx={{ 
            animation: 'spin 2s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />
          <span>🔍 <strong>VISTA PREVIA</strong> - Los cambios no están guardados</span>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
         
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleVolverAlEditor}
            sx={{ 
              bgcolor: '#2196f3', 
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#1976d2' }
            }}
          >
            ← Volver
          </Button>
        </Box>
      </Box>

      {/* Floating action buttons */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        zIndex: 1000, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1.5 
      }}>
        <Fab 
          color="primary" 
          onClick={() => setQrDialogOpen(true)} 
          sx={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            bgcolor: pagina?.colorPrimario,
            '&:hover': { bgcolor: pagina?.colorPrimario, opacity: 0.9 }
          }}
        >
          <QrCode />
        </Fab>
        
        <Fab 
          color="secondary" 
          onClick={() => setShareDialogOpen(true)} 
          sx={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            bgcolor: pagina?.colorSecundario,
            '&:hover': { bgcolor: pagina?.colorSecundario, opacity: 0.9 }
          }}
        >
          <Share />
        </Fab>
        
        <Fab 
          color="info" 
          onClick={handleAbrirEditorEnNuevaPestana} 
          sx={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            bgcolor: '#9c27b0',
            '&:hover': { bgcolor: '#8e24aa' }
          }}
        >
          <Edit />
        </Fab>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 10, pb: 8 }}>
        {/* Información del modo */}
        <Alert severity="info" sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Typography variant="body1">
            Esta es una <strong>vista previa</strong> con los datos actuales del formulario. 
            Para hacer esta página pública, debes guardarla en el sistema.
          </Typography>
        </Alert>

        {/* Contenido de la página */}
        {renderSecciones()}

        {/* Footer */}
        <Paper sx={{ 
          mt: 8, 
          p: 4, 
          bgcolor: `${pagina?.colorPrimario || '#667eea'}`, 
          color: 'white',
          borderRadius: 3,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <Box sx={{ mb: 4 }}>
            {pagina?.logoUrl && (
              <img 
                src={pagina.logoUrl} 
                alt="Logo" 
                style={{ 
                  height: '80px', 
                  objectFit: 'contain',
                  marginBottom: '24px'
                }} 
              />
            )}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {cliente?.empresa || cliente?.nombre || pagina?.encabezado?.replace('Bienvenido a ', '') || 'Mi Empresa'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
              {pagina?.descripcionCorta || 'Soluciones innovadoras para hacer crecer tu negocio'}
            </Typography>
          </Box>
          
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', my: 3 }} />
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 4 }}>
            {pagina?.telefono && (
              <Chip 
                icon={<Phone />} 
                label={pagina.telefono} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                  fontSize: '1rem',
                  py: 1.5,
                  px: 2
                }} 
              />
            )}
            {pagina?.email && (
              <Chip 
                icon={<Email />} 
                label={pagina.email} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                  fontSize: '1rem',
                  py: 1.5,
                  px: 2
                }} 
              />
            )}
            {pagina?.direccion && (
              <Chip 
                icon={<LocationOn />} 
                label={pagina.direccion} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                  fontSize: '0.9rem',
                  py: 1.5,
                  px: 2
                }} 
              />
            )}
          </Stack>
          
          {/* Redes sociales en footer */}
          {renderRedesSociales() && (
            <Box sx={{ mt: 3 }}>
              {renderRedesSociales()}
            </Box>
          )}
          
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', my: 3 }} />
          
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
              © {new Date().getFullYear()} {cliente?.empresa || cliente?.nombre || 'Mi Empresa'}. Todos los derechos reservados.
            </Typography>
            <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
              {clienteId ? `ID Cliente: ${clienteId} • ` : ''}Esta es una vista previa • Generado con Página Web Pro
            </Typography>
          </Box>
        </Paper>

        
      </Container>

      {/* Dialog para QR */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: pagina?.colorPrimario, color: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Código QR de la Página</Typography>
          <IconButton onClick={() => setQrDialogOpen(false)} sx={{ color: 'white' }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getPageUrl())}`}
            alt="QR Code"
            style={{ width: 250, height: 250, marginBottom: 20, borderRadius: 8 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all', mb: 3, fontFamily: 'monospace' }}>
            {getPageUrl()}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="outlined" 
              startIcon={<ContentCopy />}
              onClick={() => {
                navigator.clipboard.writeText(getPageUrl());
                handleShowSnackbar('✅ URL copiada al portapapeles', 'success');
              }}
              sx={{ minWidth: 140 }}
            >
              Copiar URL
            </Button>
            <Button 
              variant="contained"
              onClick={() => window.open(getPageUrl(), '_blank')}
              sx={{ 
                minWidth: 140,
                bgcolor: pagina?.colorPrimario
              }}
            >
              Abrir Página
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Dialog para compartir */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: pagina?.colorPrimario, color: 'white' }}>
          Compartir Página
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <List>
            <ListItem 
              button 
              onClick={() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(`Mira esta página: ${getPageUrl()}`)}`, '_blank');
                setShareDialogOpen(false);
              }}
              sx={{ 
                '&:hover': { bgcolor: `${pagina?.colorPrimario}10` },
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon><WhatsApp sx={{ color: '#25D366', fontSize: 30 }} /></ListItemIcon>
              <ListItemText 
                primary="Compartir en WhatsApp" 
                secondary="Comparte con tus contactos"
              />
            </ListItem>
            
            <ListItem 
              button 
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPageUrl())}`, '_blank');
                setShareDialogOpen(false);
              }}
              sx={{ 
                '&:hover': { bgcolor: `${pagina?.colorPrimario}10` },
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon><Facebook sx={{ color: '#1877F2', fontSize: 30 }} /></ListItemIcon>
              <ListItemText 
                primary="Compartir en Facebook" 
                secondary="Publica en tu muro"
              />
            </ListItem>
            
            <ListItem 
              button 
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getPageUrl())}&text=Mira esta página`, '_blank');
                setShareDialogOpen(false);
              }}
              sx={{ 
                '&:hover': { bgcolor: `${pagina?.colorPrimario}10` },
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon><Twitter sx={{ color: '#1DA1F2', fontSize: 30 }} /></ListItemIcon>
              <ListItemText 
                primary="Compartir en Twitter" 
                secondary="Twittea el enlace"
              />
            </ListItem>
            
            <ListItem 
              button 
              onClick={() => {
                navigator.clipboard.writeText(getPageUrl());
                handleShowSnackbar('✅ URL copiada al portapapeles', 'success');
                setShareDialogOpen(false);
              }}
              sx={{ 
                '&:hover': { bgcolor: `${pagina?.colorPrimario}10` },
                borderRadius: 1
              }}
            >
              <ListItemIcon><ContentCopy sx={{ color: pagina?.colorPrimario, fontSize: 30 }} /></ListItemIcon>
              <ListItemText 
                primary="Copiar enlace" 
                secondary="Copia la URL para compartir"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de salida */}
      <Dialog open={confirmExitOpen} onClose={() => setConfirmExitOpen(false)}>
        <DialogTitle>Confirmar Salida</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Warning />
            ¿Estás seguro de que quieres salir de la vista previa?
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Los cambios no guardados se perderán. Asegúrate de haber guardado la página antes de salir.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmExitOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleConfirmExit} 
            color="error"
            variant="contained"
          >
            Salir de la Vista Previa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}