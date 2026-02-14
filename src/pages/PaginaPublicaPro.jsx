// src/pages/PaginaPublicaPro.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Rating,
  ThemeProvider,
  createTheme,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  Schedule,
  WhatsApp,
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  YouTube,
  Share,
  QrCode,
  Close,
  Star,
  ContentCopy,
  Computer,
  Store,
  TrendingUp,
  Palette,
  Settings,
  Security,
  VideoLibrary,
  Business,
  CheckCircle,
  CreditCard,
  VerifiedUser,
  Movie,
  Tv,
  PlayCircle,
  School,
  LiveTv
} from '@mui/icons-material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL, getImageUrl } from '../config';
import ActivacionClienteFinalPage from './ActivacionClienteFinalPage';
import VerificacionTarjetaEmbedded from '../pages/VerificacionTarjetaEmbedded';
import BannerCarousel from './BannerCarousel';

const getContrastColor = (backgroundColor) => {
  if (!backgroundColor) return '#333333';
  
  let r, g, b;
  
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.replace('#', '');
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } 
  else if (backgroundColor.startsWith('rgb')) {
    const rgb = backgroundColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      r = parseInt(rgb[0]);
      g = parseInt(rgb[1]);
      b = parseInt(rgb[2]);
    } else {
      return '#333333';
    }
  } else {
    return '#333333';
  }
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#333333' : '#ffffff';
};

const lightenColor = (color, amount = 20) => {
  if (!color || !color.startsWith('#') || color.length !== 7) return '#ffffff';
  
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
  
  return `rgb(${r}, ${g}, ${b})`;
};

const darkenColor = (color, amount = 40) => {
  if (!color || !color.startsWith('#') || color.length !== 7) return '#2d3748';
  
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
  
  return `rgb(${r}, ${g}, ${b})`;
};

const isLightColor = (color) => {
  return getContrastColor(color) === '#333333';
};

const iconosMap = {
  'Computer': Computer,
  'Store': Store,
  'TrendingUp': TrendingUp,
  'Palette': Palette,
  'Settings': Settings,
  'Security': Security,
  'Phone': Phone,
  'Email': Email,
  'Business': Business
};

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const TarjetasButtons = ({ 
  clienteId, 
  onToggleActivacion, 
  onToggleVerificacion,
  mostrarFormulario,
  mostrarVerificacion,
  colorPrimario,
  colorSecundario,
  fondoClaro
}) => {
  const textColorPrimario = getContrastColor(colorPrimario);
  const textColorSecundario = getContrastColor(colorSecundario);

  return (
    <Box sx={{ mt: 1.5, textAlign: 'center' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" alignItems="center">
        <Button 
          variant="contained" 
          size="medium"
          sx={{ 
            bgcolor: mostrarFormulario ? 
              `${colorPrimario || '#4CAF50'}DD` : 
              colorPrimario || '#4CAF50',
            color: textColorPrimario,
            fontSize: '0.85rem',
            px: 2,
            py: 0.8,
            minWidth: { xs: '100%', sm: '140px' },
            '&:hover': { 
              bgcolor: mostrarFormulario ? 
                `${colorPrimario || '#4CAF50'}EE` : 
                `${colorPrimario || '#4CAF50'}DD`,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${colorPrimario || '#4CAF50'}30`
            },
            borderRadius: 1.2,
            transition: 'all 0.2s ease-in-out',
            boxShadow: `0 2px 6px ${colorPrimario || '#4CAF50'}20`
          }}
          onClick={onToggleActivacion}
          startIcon={mostrarFormulario ? <ExpandLessIcon /> : <CreditCard />}
        >
          {mostrarFormulario ? 'Ocultar' : 'Activar'}
        </Button>
        
        <Button 
          variant="contained" 
          size="medium"
          sx={{ 
            bgcolor: mostrarVerificacion ? 
              `${colorSecundario || '#2196F3'}DD` : 
              colorSecundario || '#2196F3',
            color: textColorSecundario,
            fontSize: '0.85rem',
            px: 2,
            py: 0.8,
            minWidth: { xs: '100%', sm: '140px' },
            '&:hover': { 
              bgcolor: mostrarVerificacion ? 
                `${colorSecundario || '#2196F3'}EE` : 
                `${colorSecundario || '#2196F3'}DD`,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${colorSecundario || '#2196F3'}30`
            },
            borderRadius: 1.2,
            transition: 'all 0.2s ease-in-out',
            boxShadow: `0 2px 6px ${colorSecundario || '#2196F3'}20`
          }}
          onClick={onToggleVerificacion}
          startIcon={<VerifiedUser />}
        >
          {mostrarVerificacion ? 'Ocultar' : 'Verificar'}
        </Button>
      </Stack>
    </Box>
  );
};

const StreamingFooterButtons = ({ 
  onOptionClick,
  colorPrimario = '#667eea',
  colorSecundario = '#764ba2',
  fondoClaro = true
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const streamingServices = [
  { 
    id: 'netflix', 
    nombre: 'Netflix', 
    icono: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg',
    color: '#E50914',
    bgColor: '#000000',
    gradiente: 'linear-gradient(145deg, #E50914, #B20710)',
    icon: <Movie sx={{ fontSize: 40, color: 'white' }} />
  },
  { 
    id: 'disney', 
    nombre: 'Disney+', 
    icono: 'https://static-assets.bamgrid.com/product/disneyplus/images/share-default.png',
    color: '#113CCF',
    bgColor: '#FFFFFF',
    gradiente: 'linear-gradient(145deg, #113CCF, #0A2A8C)',
    icon: <Tv sx={{ fontSize: 40, color: 'white' }} />
  },
  { 
    id: 'flujo', 
    nombre: 'Flujo TV', 
    icono: 'https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@6.x/svgs/solid/tv.svg',
    color: '#E30613',
    bgColor: '#000000',
    gradiente: 'linear-gradient(145deg, #E30613, #A50000)',
    icon: <LiveTv sx={{ fontSize: 40, color: 'white' }} />
  },
  { 
    id: 'hbo', 
    nombre: 'HBO Max', 
    icono: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/hbo_max_logo_icon_168520.png',
    color: '#5822B4',
    bgColor: '#000000',
    gradiente: 'linear-gradient(145deg, #5822B4, #3A1775)',
    icon: <PlayCircle sx={{ fontSize: 40, color: 'white' }} />
  },
  { 
    id: 'educativo', 
    nombre: 'Educativo', 
    icono: 'https://cdn.icon-icons.com/icons2/3780/PNG/512/udemy_logo_icon_231503.png',
    color: '#EC5252',
    bgColor: '#FFFFFF',
    gradiente: 'linear-gradient(145deg, #EC5252, #A43535)',
    icon: <School sx={{ fontSize: 40, color: 'white' }} />
  }
];

  const handleImageError = (serviceId) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: true }));
  };

  const handleServiceClick = (event, service) => {
    setAnchorEl(event.currentTarget);
    setSelectedService(service);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedService(null);
  };

  const handleAction = (action) => {
    handleClose();
    onOptionClick(action);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3, 
          color: getContrastColor(fondoClaro ? '#ffffff' : '#000000'),
          fontWeight: 700,
          fontSize: '1.2rem',
          textAlign: 'center',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}
      >
        🎬 Obtén tu beneficio haciendo clic en el botón ⬇️
      </Typography>
      
      <Grid container spacing={2} justifyContent="center">
        {streamingServices.map((servicio) => (
          <Grid item xs={6} sm={6} md={3} key={servicio.id}>
            <Button
              fullWidth
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: servicio.gradiente,
                color: 'white',
                p: 2,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                border: 'none',
                boxShadow: `0 8px 16px -4px ${servicio.color}80`,
                minHeight: '160px',
                maxHeight: '160px',
                height: '160px',
                width: '100%',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: `0 16px 24px -6px ${servicio.color}`,
                }
              }}
              onClick={(e) => handleServiceClick(e, servicio)}
            >
              {imageErrors[servicio.id] ? (
                <Box sx={{
                  width: 70,
                  height: 70,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  mb: 1.5
                }}>
                  {servicio.icon}
                </Box>
              ) : (
                <Box
                  component="img"
                  src={servicio.icono}
                  alt={servicio.nombre}
                  onError={() => handleImageError(servicio.id)}
                  sx={{
                    width: 70,
                    height: 70,
                    objectFit: 'contain',
                    mb: 1.5,
                    filter: 'brightness(0) invert(1)',
                    display: 'block'
                  }}
                />
              )}
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: 'white',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                {servicio.nombre}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: -1,
            borderRadius: 2,
            minWidth: 240,
            boxShadow: `0 8px 20px ${colorPrimario}30`,
            border: `1px solid ${colorPrimario}20`,
          }
        }}
      >
        <MenuItem 
          onClick={() => handleAction('activar')}
          sx={{
            py: 1.5,
            px: 2,
            gap: 1.5,
            color: colorPrimario,
            '&:hover': {
              backgroundColor: `${colorPrimario}10`
            }
          }}
        >
          <CreditCard sx={{ fontSize: '1.3rem' }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Activar Tarjeta
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              Para {selectedService?.nombre}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem 
          onClick={() => handleAction('verificar')}
          sx={{
            py: 1.5,
            px: 2,
            gap: 1.5,
            color: colorSecundario,
            '&:hover': {
              backgroundColor: `${colorSecundario}10`
            }
          }}
        >
          <VerifiedUser sx={{ fontSize: '1.3rem' }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Verificar Tarjeta
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              Para {selectedService?.nombre}
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default function PaginaPublicaPro() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [mostrarFormularioActivacion, setMostrarFormularioActivacion] = useState(false);
  const [mostrarFormularioVerificacion, setMostrarFormularioVerificacion] = useState(false);
  const [showModalImagen, setShowModalImagen] = useState(false);
  const [mostrarGestionTarjetas, setMostrarGestionTarjetas] = useState(false);

  useEffect(() => {
    const fetchPaginaPublica = async () => {
      try {
        setLoading(true);
        
        const res = await fetch(`${API_BASE_URL}/ClientePaginas/cliente/${clienteId}`);
        
        if (!res.ok) {
          throw new Error('Página no encontrada');
        }
        
        const paginaData = await res.json();
        
        const convertirACamelCase = (obj) => {
          if (Array.isArray(obj)) {
            return obj.map(convertirACamelCase);
          } else if (obj !== null && typeof obj === 'object') {
            const newObj = {};
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
                newObj[camelKey] = convertirACamelCase(obj[key]);
                if (key !== camelKey) {
                  newObj[key] = convertirACamelCase(obj[key]);
                }
              }
            }
            return newObj;
          }
          return obj;
        };
        
        const paginaTransformada = convertirACamelCase(paginaData);
        setPagina(paginaTransformada);
        
      } catch (err) {
        console.error('❌ Error cargando página:', err);
        setError('La página solicitada no existe o no está disponible');
      } finally {
        setLoading(false);
      }
    };

    if (clienteId) {
      fetchPaginaPublica();
    }
  }, [clienteId]);

  useEffect(() => {
    if (pagina?.modalImageUrl) {
      const timer = setTimeout(() => {
        setShowModalImagen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pagina?.modalImageUrl]);

  const toggleFormularioActivacion = () => {
    const nuevoEstado = !mostrarFormularioActivacion;
    setMostrarFormularioActivacion(nuevoEstado);
    if (nuevoEstado && mostrarFormularioVerificacion) {
      setMostrarFormularioVerificacion(false);
    }
  };

  const toggleFormularioVerificacion = () => {
    const nuevoEstado = !mostrarFormularioVerificacion;
    setMostrarFormularioVerificacion(nuevoEstado);
    if (nuevoEstado && mostrarFormularioActivacion) {
      setMostrarFormularioActivacion(false);
    }
  };

  const toggleGestionTarjetas = () => {
    setMostrarGestionTarjetas(!mostrarGestionTarjetas);
  };

  const handleStreamingOption = (action) => {
    if (action === 'activar') {
      setMostrarFormularioVerificacion(false);
      setMostrarFormularioActivacion(true);
      setMostrarGestionTarjetas(true);
      setTimeout(() => {
        const element = document.getElementById('activacion-tarjetas-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else if (action === 'verificar') {
      setMostrarFormularioActivacion(false);
      setMostrarFormularioVerificacion(true);
      setMostrarGestionTarjetas(true);
      setTimeout(() => {
        const element = document.getElementById('verificacion-tarjetas-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const getPageUrl = () => {
    return `${window.location.origin}/pagina/${clienteId}`;
  };

  const getColors = () => {
    const colorFondo = pagina?.colorFondo || '#f8f9fa';
    const colorTexto = pagina?.colorTexto || '#333333';
    const colorPrimario = pagina?.colorPrimario || '#667eea';
    const colorSecundario = pagina?.colorSecundario || '#764ba2';
    const textoColor = getContrastColor(colorFondo);
    const cardBackground = isLightColor(colorFondo) ? '#ffffff' : lightenColor(colorFondo, 30);
    const fondoClaro = isLightColor(colorFondo);
    
    return {
      colorFondo,
      colorTexto,
      colorPrimario,
      colorSecundario,
      textoColor,
      cardBackground,
      fondoClaro
    };
  };

  const renderModalImagen = () => {
    if (!pagina?.modalImageUrl || !showModalImagen) return null;

    const { colorPrimario } = getColors();

    return (
      <Dialog
        open={showModalImagen}
        onClose={() => setShowModalImagen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            maxWidth: '600px'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: colorPrimario, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          fontWeight: 'bold'
        }}>
          Mensaje Importante
          <IconButton 
            onClick={() => setShowModalImagen(false)} 
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <img 
             src={getImageUrl(pagina.modalImageUrl)}
            alt="Modal" 
            style={{ 
              width: '100%', 
              height: 'auto',
              display: 'block'
            }} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => setShowModalImagen(false)}
            sx={{ 
              bgcolor: colorPrimario,
              '&:hover': { 
                bgcolor: colorPrimario, 
                opacity: 0.9 
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderRedesSociales = () => {
    if (!pagina) return null;

    const { colorFondo, textoColor } = getColors();
    const redes = [];
    
    if (pagina.whatsAppUrl) {
      let whatsappLink = pagina.whatsAppUrl;
      
      if (/^[\d\s\+\-\(\)]+$/.test(whatsappLink)) {
        const numero = whatsappLink.replace(/[^\d\+]/g, '');
        whatsappLink = `https://wa.me/${numero}`;
      } 
      else if (whatsappLink.includes('wa.me') && !whatsappLink.startsWith('http')) {
        whatsappLink = `https://${whatsappLink}`;
      }
      else if (whatsappLink.includes('send?phone=') && !whatsappLink.startsWith('http')) {
        whatsappLink = `https://api.whatsapp.com/${whatsappLink}`;
      }
      
      redes.push({
        icon: <WhatsApp />,
        url: whatsappLink,
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
    
    if (pagina.linkedInUrl) {
      redes.push({
        icon: <LinkedIn />,
        url: pagina.linkedInUrl,
        color: '#0A66C2',
        label: 'LinkedIn'
      });
    }
    
    if (pagina.youTubeUrl) {
      redes.push({
        icon: <YouTube />,
        url: pagina.youTubeUrl,
        color: '#FF0000',
        label: 'YouTube'
      });
    }

    if (redes.length === 0) return null;

    return (
      <Box key="redes" sx={{ 
        mb: 4, 
        textAlign: 'center',
        bgcolor: colorFondo,
        color: textoColor,
        p: 3,
        borderRadius: 2
      }}>
        <Typography variant="h4" gutterBottom sx={{ 
          mb: 2, 
          fontWeight: 'bold',
          color: textoColor
        }}>
          Síguenos en Redes Sociales
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
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
                '&:hover': { 
                  bgcolor: red.color, 
                  opacity: 0.9,
                  transform: 'scale(1.1)'
                },
                width: 48,
                height: 48,
                transition: 'all 0.3s ease'
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

  const renderTestimoniosPersonalizados = () => {
    if (!pagina?.testimoniosPersonalizados || pagina.testimoniosPersonalizados.length === 0) {
      return null;
    }

    const testimoniosActivos = pagina.testimoniosPersonalizados.filter(t => t.activo !== false);
    if (testimoniosActivos.length === 0) return null;

    const { 
      colorFondo, 
      textoColor, 
      colorPrimario, 
      colorSecundario, 
      cardBackground 
    } = getColors();

    return (
      <Box key="testimonios" sx={{ 
        mb: 4, 
        py: 4, 
        px: 2,
        bgcolor: colorFondo,
        borderRadius: 2,
        color: textoColor
      }}>
        <Typography variant="h2" gutterBottom sx={{ 
          textAlign: 'center', 
          mb: 3, 
          fontWeight: 'bold',
          color: textoColor,
          background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem'
        }}>
          Lo Que Dicen Nuestros Clientes
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {testimoniosActivos.map((testimonio, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: cardBackground,
                color: textoColor,
                border: `1px solid ${isLightColor(colorFondo) ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: `0 6px 12px ${colorPrimario}20`
                }
              }}>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: 2,
                  color: textoColor
                }}>
                  <Box sx={{ display: 'flex', mb: 2, justifyContent: 'center' }}>
                    <Rating
                      value={testimonio.calificacion || 5}
                      readOnly
                      precision={0.5}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body1" sx={{ 
                    fontStyle: 'italic', 
                    mb: 2, 
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    textAlign: 'center',
                    color: textoColor
                  }}>
                    "{testimonio.comentario}"
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 'auto', 
                    pt: 1.5, 
                    borderTop: `1px solid ${isLightColor(colorFondo) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
                  }}>
                    <Avatar sx={{ 
                      mr: 1.5, 
                      bgcolor: colorPrimario,
                      color: getContrastColor(colorPrimario),
                      width: 45,
                      height: 45,
                      fontSize: '1rem'
                    }}>
                      {testimonio.nombre?.charAt(0) || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        mb: 0.3,
                        color: textoColor,
                        fontSize: '0.9rem'
                      }}>
                        {testimonio.nombre}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mb: 0.3,
                        color: textoColor,
                        opacity: 0.7,
                        fontSize: '0.75rem'
                      }}>
                        {testimonio.cargo}
                      </Typography>
                      <Chip 
                        label="Cliente Verificado" 
                        size="small" 
                        sx={{ 
                          bgcolor: `${colorPrimario}10`, 
                          color: colorPrimario,
                          fontSize: '0.65rem',
                          fontWeight: 'medium',
                          border: `1px solid ${colorPrimario}20`
                        }} 
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderGaleriasImagenes = () => {
    if (!pagina?.galeriasImagenes || pagina.galeriasImagenes.length === 0) {
      return null;
    }

    const galeriasActivas = pagina.galeriasImagenes.filter(g => g.activo !== false);
    if (galeriasActivas.length === 0) return null;

    const { 
      colorFondo, 
      textoColor, 
      colorPrimario, 
      colorSecundario, 
      cardBackground 
    } = getColors();

    return (
      <Box key="galerias" sx={{ 
        mb: 4, 
        py: 4, 
        px: 2,
        bgcolor: colorFondo,
        borderRadius: 2,
        color: textoColor
      }}>
        {galeriasActivas.map((galeria, galeriaIndex) => {
          const imagenesConUrl = galeria.imagenes?.filter(img => img.url && img.url.trim() !== '') || [];
          if (imagenesConUrl.length === 0) return null;

          return (
            <Box key={galeriaIndex} sx={{ mb: 4 }}>
              <Typography variant="h2" gutterBottom sx={{ 
                textAlign: 'center', 
                mb: 1.5, 
                fontWeight: 'bold',
                color: textoColor,
                background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1.8rem'
              }}>
                {galeria.titulo || 'Nuestra Galería'}
              </Typography>
              
              {galeria.descripcion && (
                <Typography variant="h5" sx={{ 
                  textAlign: 'center', 
                  mb: 3, 
                  color: textoColor,
                  opacity: 0.8,
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.5,
                  fontSize: '1rem'
                }}>
                  {galeria.descripcion}
                </Typography>
              )}

              <Grid container spacing={2}>
                {imagenesConUrl.map((imagen, imgIndex) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={imgIndex}>
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: cardBackground,
                      color: textoColor,
                      border: `1px solid ${isLightColor(colorFondo) ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: `0 6px 12px ${colorPrimario}20`,
                        borderColor: colorPrimario
                      }
                    }}>
                      <Box sx={{ 
                        position: 'relative', 
                        overflow: 'hidden'
                      }}>
                        <CardMedia
                          component="img"
                          height="180"
                          image={getImageUrl(imagen.url)}
                          alt={imagen.titulo}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        
                        <Chip 
                          label={`${imgIndex + 1}/${imagenesConUrl.length}`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            fontWeight: 'bold',
                            border: `1px solid ${colorPrimario}`,
                            fontSize: '0.6rem',
                            height: 20
                          }}
                        />
                      </Box>
                      
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        p: 1.5,
                        bgcolor: cardBackground
                      }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: textoColor,
                          fontSize: '0.9rem'
                        }}>
                          {imagen.titulo || 'Imagen sin título'}
                        </Typography>
                        
                        <Typography variant="body2" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '32px',
                          color: textoColor,
                          opacity: 0.7,
                          fontSize: '0.75rem'
                        }}>
                          {imagen.descripcion || 'Sin descripción disponible'}
                        </Typography>
                        
                        {imagen.etiqueta && (
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              label={imagen.etiqueta}
                              size="small"
                              sx={{
                                bgcolor: `${colorPrimario}10`,
                                color: colorPrimario,
                                border: `1px solid ${colorPrimario}20`,
                                fontSize: '0.65rem'
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderVideosEmbebidos = () => {
    if (!pagina?.videosEmbebidos || pagina.videosEmbebidos.length === 0) {
      return null;
    }

    const videosActivos = pagina.videosEmbebidos.filter(v => v.activo !== false && v.url && v.url.trim() !== '');
    if (videosActivos.length === 0) return null;

    const { 
      colorFondo, 
      textoColor, 
      colorPrimario, 
      colorSecundario, 
      cardBackground 
    } = getColors();

    const videoContainerBg = isLightColor(colorFondo) ? `${colorPrimario}05` : `${colorFondo}15`;

    return (
      <Box key="videos" sx={{ 
        mb: 4, 
        py: 4, 
        bgcolor: videoContainerBg,
        borderRadius: 2,
        color: textoColor
      }}>
        <Typography variant="h2" gutterBottom sx={{ 
          textAlign: 'center', 
          mb: 3, 
          fontWeight: 'bold',
          color: textoColor,
          background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem'
        }}>
          Nuestros Videos
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {videosActivos.map((video, index) => {
            const videoId = extractYouTubeId(video.url);
            const embedUrl = videoId
              ? `https://www.youtube.com/embed/${videoId}`
              : video.url.includes('vimeo')
                ? `https://player.vimeo.com/video/${video.url.split('/').pop()}`
                : video.url;

            return (
              <Grid item xs={12} md={10} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: cardBackground,
                    color: textoColor,
                    border: `1px solid ${isLightColor(colorFondo) ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 6px 12px ${colorPrimario}20`,
                      borderColor: colorPrimario
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '56.25%',
                        borderRadius: '6px 6px 0 0',
                        overflow: 'hidden',
                        bgcolor: `${colorPrimario}08`,
                        borderBottom: `1px solid ${isLightColor(colorFondo) ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`
                      }}
                    >
                      {video.url.includes('<iframe') ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: video.url }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
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
                            border: 0,
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </Box>

                    <Box sx={{ p: 2.5, bgcolor: cardBackground }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <VideoLibrary sx={{ 
                          mr: 1, 
                          color: colorPrimario, 
                          fontSize: '1.2rem' 
                        }} />
                        <Typography variant="subtitle2" sx={{ 
                          color: colorPrimario,
                          fontWeight: 'medium',
                          fontSize: '0.8rem'
                        }}>
                          {video.tipo === 'youtube' ? 'YouTube' : video.tipo === 'vimeo' ? 'Vimeo' : 'Video'}
                        </Typography>
                      </Box>

                      <Typography variant="h4" gutterBottom sx={{ 
                        fontWeight: 'bold',
                        color: textoColor,
                        mb: 1.5,
                        fontSize: '1.2rem'
                      }}>
                        {video.titulo || 'Video sin título'}
                      </Typography>

                      <Typography variant="body1" sx={{ 
                        mb: 2, 
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        color: textoColor,
                        opacity: 0.8
                      }}>
                        {video.descripcion || 'Descripción no disponible'}
                      </Typography>
                      
                      {video.duracion && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={video.duracion}
                            size="small"
                            sx={{
                              bgcolor: `${colorSecundario}10`,
                              color: colorSecundario,
                              border: `1px solid ${colorSecundario}20`,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

 

  const renderFormularioActivacion = () => {
    if (!mostrarFormularioActivacion) return null;

    const { colorPrimario, cardBackground, textoColor, fondoClaro } = getColors();
    const bordeColor = fondoClaro ? `${colorPrimario}15` : `${colorPrimario}30`;

    return (
      <Box id="activacion-tarjetas-section" sx={{ 
        mb: 2,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Paper elevation={0} sx={{ 
          borderRadius: 1.2, 
          p: 1.5, 
          border: `1px solid ${bordeColor}`,
          width: '100%',
          maxWidth: '320px',
          bgcolor: cardBackground,
          boxShadow: `0 2px 8px ${colorPrimario}10`
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 1.2 
          }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 600, 
              fontSize: '0.8rem',
              color: colorPrimario
            }}>
              🎫 Activar Tarjeta
            </Typography>
            <IconButton 
              size="small"
              onClick={toggleFormularioActivacion}
              sx={{ 
                p: 0.2, 
                color: textoColor,
                opacity: 0.5,
                '&:hover': { opacity: 1 }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          
          <ActivacionClienteFinalPage 
            embedded={true}
            onClose={toggleFormularioActivacion}
          />
        </Paper>
      </Box>
    );
  };

  const renderFormularioVerificacion = () => {
    if (!mostrarFormularioVerificacion) return null;

    const { colorPrimario, cardBackground, textoColor, fondoClaro } = getColors();
    const bordeColor = fondoClaro ? `${colorPrimario}15` : `${colorPrimario}30`;

    return (
      <Box id="verificacion-tarjetas-section" sx={{ 
        mb: 2,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Paper elevation={0} sx={{ 
          borderRadius: 1.2, 
          p: 1.5, 
          border: `1px solid ${bordeColor}`,
          width: '100%',
          maxWidth: '320px',
          bgcolor: cardBackground,
          boxShadow: `0 2px 8px ${colorPrimario}10`
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 1.2 
          }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 600, 
              fontSize: '0.8rem',
              color: colorPrimario
            }}>
              🔍 Verificar Tarjeta
            </Typography>
            <IconButton 
              size="small"
              onClick={toggleFormularioVerificacion}
              sx={{ 
                p: 0.2, 
                color: textoColor,
                opacity: 0.5,
                '&:hover': { opacity: 1 }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          
          <VerificacionTarjetaEmbedded 
            onClose={toggleFormularioVerificacion}
            colorPrimario={colorPrimario}
          />
        </Paper>
      </Box>
    );
  };

  const renderGestionTarjetas = () => {
    if (!mostrarGestionTarjetas) return null;

    const { 
      textoColor, 
      colorPrimario, 
      colorSecundario,
      cardBackground,
      fondoClaro
    } = getColors();

    const bordeColor = fondoClaro ? `${colorPrimario}12` : `${colorPrimario}25`;
    const fondoGradiente = fondoClaro 
      ? `linear-gradient(135deg, ${colorPrimario}02, ${colorSecundario}02)`
      : `linear-gradient(135deg, ${colorPrimario}04, ${colorSecundario}04)`;

    return (
      <Container maxWidth="sm" sx={{ 
        mb: 2,
        mt: 1,
        animation: 'fadeIn 0.2s ease-in'
      }}>
        <Paper elevation={0} sx={{ 
          p: 2,
          borderRadius: 1.2,
          background: fondoGradiente,
          border: `1px solid ${bordeColor}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 2px 6px ${colorPrimario}06`
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ 
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <CreditCard sx={{ fontSize: '1rem' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ 
                  color: colorPrimario,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  fontSize: '0.85rem'
                }}>
                  Gestión de Tarjetas
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: textoColor,
                  opacity: 0.4,
                  fontSize: '0.65rem'
                }}>
                  Activa o verifica tarjetas
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={toggleGestionTarjetas}
              size="small"
              sx={{ 
                color: colorPrimario,
                opacity: 0.6,
                '&:hover': { 
                  opacity: 1,
                  bgcolor: `${colorPrimario}08` 
                },
                width: 26,
                height: 26
              }}
            >
              <ExpandLessIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ mb: 1.2 }}>
            <TarjetasButtons 
              clienteId={clienteId} 
              onToggleActivacion={toggleFormularioActivacion}
              onToggleVerificacion={toggleFormularioVerificacion}
              mostrarFormulario={mostrarFormularioActivacion}
              mostrarVerificacion={mostrarFormularioVerificacion}
              colorPrimario={colorPrimario}
              colorSecundario={colorSecundario}
              fondoClaro={fondoClaro}
            />
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 1.2,
            pt: 1.2,
            borderTop: `1px solid ${bordeColor}`
          }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ 
                width: 22,
                height: 22,
                borderRadius: '5px',
                background: `${colorPrimario}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 3px',
                color: colorPrimario
              }}>
                <VerifiedUser sx={{ fontSize: '0.8rem' }} />
              </Box>
              <Typography variant="caption" sx={{ 
                color: textoColor,
                opacity: 0.5,
                fontSize: '0.6rem',
                fontWeight: 500
              }}>
                Seguro
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ 
                width: 22,
                height: 22,
                borderRadius: '5px',
                background: `${colorSecundario}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 3px',
                color: colorSecundario
              }}>
                <CreditCard sx={{ fontSize: '0.8rem' }} />
              </Box>
              <Typography variant="caption" sx={{ 
                color: textoColor,
                opacity: 0.5,
                fontSize: '0.6rem',
                fontWeight: 500
              }}>
                Rápido
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ 
                width: 22,
                height: 22,
                borderRadius: '5px',
                background: `${colorPrimario}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 3px',
                color: colorPrimario
              }}>
                <Security sx={{ fontSize: '0.8rem' }} />
              </Box>
              <Typography variant="caption" sx={{ 
                color: textoColor,
                opacity: 0.5,
                fontSize: '0.6rem',
                fontWeight: 500
              }}>
                Protegido
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  };

  const renderContacto = () => {
    if (!pagina?.mostrarContacto) return null;

    const { 
      colorFondo, 
      textoColor, 
      colorPrimario, 
      colorSecundario, 
      cardBackground,
      fondoClaro
    } = getColors();

    const bordeColor = fondoClaro ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

    return (
      <Paper key="contacto" sx={{ 
        p: { xs: 2.5, md: 3 }, 
        mb: 4, 
        borderRadius: 2, 
        bgcolor: colorFondo,
        color: textoColor,
        boxShadow: `0 4px 12px ${fondoClaro ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.1)'}`,
        border: `1px solid ${bordeColor}`
      }}>
        <Typography variant="h2" gutterBottom sx={{ 
          textAlign: 'center', 
          mb: 3, 
          fontWeight: 'bold',
          color: textoColor,
          background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem'
        }}>
          Contáctanos
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.2, 
                mb: 1.5,
                color: textoColor,
                fontSize: '1rem'
              }}>
                <LocationOn sx={{ 
                  color: colorPrimario,
                  fontSize: 24,
                  bgcolor: `${colorPrimario}10`,
                  p: 0.4,
                  borderRadius: '6px'
                }} /> 
                <span>Dirección</span>
              </Typography>
              <Typography variant="body1" sx={{ 
                fontSize: '0.9rem',
                color: textoColor,
                opacity: 0.9,
                pl: 3.2
              }}>
                {pagina?.direccion || 'Av. Ejemplo 123, Ciudad, País'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.2, 
                mb: 1.5,
                color: textoColor,
                fontSize: '1rem'
              }}>
                <Phone sx={{ 
                  color: colorPrimario,
                  fontSize: 24,
                  bgcolor: `${colorPrimario}10`,
                  p: 0.4,
                  borderRadius: '6px'
                }} /> 
                <span>Teléfono</span>
              </Typography>
              <Typography variant="body1" sx={{ 
                fontSize: '0.9rem',
                color: textoColor,
                opacity: 0.9,
                pl: 3.2
              }}>
                {pagina?.telefono || '+51 999 999 999'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.2, 
                mb: 1.5,
                color: textoColor,
                fontSize: '1rem'
              }}>
                <Email sx={{ 
                  color: colorPrimario,
                  fontSize: 24,
                  bgcolor: `${colorPrimario}10`,
                  p: 0.4,
                  borderRadius: '6px'
                }} /> 
                <span>Email</span>
              </Typography>
              <Typography variant="body1" sx={{ 
                fontSize: '0.9rem',
                color: textoColor,
                opacity: 0.9,
                pl: 3.2
              }}>
                {pagina?.email || 'contacto@empresa.com'}
              </Typography>
            </Box>
            
            {pagina?.horarioAtencion && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.2, 
                  mb: 1.5,
                  color: textoColor,
                  fontSize: '1rem'
                }}>
                  <Schedule sx={{ 
                    color: colorPrimario,
                    fontSize: 24,
                    bgcolor: `${colorPrimario}10`,
                    p: 0.4,
                    borderRadius: '6px'
                  }} /> 
                  <span>Horario de Atención</span>
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontSize: '0.9rem',
                  color: textoColor,
                  opacity: 0.9,
                  pl: 3.2
                }}>
                  {pagina.horarioAtencion}
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: 1.5, 
              bgcolor: cardBackground,
              color: textoColor,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: `1px solid ${bordeColor}`
            }}>
              <Typography variant="h4" gutterBottom sx={{ 
                mb: 2.5, 
                fontWeight: 'bold',
                color: textoColor,
                background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1.4rem'
              }}>
                Envíanos un Mensaje
              </Typography>
              
              <Stack spacing={2}>
                <TextField 
                  label="Nombre completo" 
                  fullWidth 
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: `${colorPrimario}30`,
                      },
                      '&:hover fieldset': {
                        borderColor: `${colorPrimario}60`,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPrimario,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: `${textoColor}70`,
                      fontSize: '0.85rem'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorPrimario,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: textoColor,
                      fontSize: '0.85rem'
                    },
                  }}
                />
                
                <TextField 
                  label="Email" 
                  fullWidth 
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: `${colorPrimario}30`,
                      },
                      '&:hover fieldset': {
                        borderColor: `${colorPrimario}60`,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPrimario,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: `${textoColor}70`,
                      fontSize: '0.85rem'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorPrimario,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: textoColor,
                      fontSize: '0.85rem'
                    },
                  }}
                />
                
                <TextField 
                  label="Teléfono" 
                  fullWidth 
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: `${colorPrimario}30`,
                      },
                      '&:hover fieldset': {
                        borderColor: `${colorPrimario}60`,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPrimario,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: `${textoColor}70`,
                      fontSize: '0.85rem'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorPrimario,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: textoColor,
                      fontSize: '0.85rem'
                    },
                  }}
                />
                
                <TextField 
                  label="Asunto" 
                  fullWidth 
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: `${colorPrimario}30`,
                      },
                      '&:hover fieldset': {
                        borderColor: `${colorPrimario}60`,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPrimario,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: `${textoColor}70`,
                      fontSize: '0.85rem'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorPrimario,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: textoColor,
                      fontSize: '0.85rem'
                    },
                  }}
                />
                
                <TextField 
                  label="Mensaje" 
                  multiline 
                  rows={3} 
                  fullWidth 
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: `${colorPrimario}30`,
                      },
                      '&:hover fieldset': {
                        borderColor: `${colorPrimario}60`,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPrimario,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: `${textoColor}70`,
                      fontSize: '0.85rem'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorPrimario,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: textoColor,
                      fontSize: '0.85rem'
                    },
                  }}
                />
                
                <Button 
                  variant="contained" 
                  size="medium" 
                  fullWidth
                  sx={{ 
                    bgcolor: colorPrimario,
                    background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                    color: getContrastColor(colorPrimario),
                    py: 0.8,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    textTransform: 'none',
                    '&:hover': {
                      opacity: 0.9,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${colorPrimario}30`
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Enviar Mensaje
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderBannerCarousel = () => {
    const { colorPrimario, colorSecundario } = getColors();
    
    const banners = [];
    const descripcionCorta = pagina?.descripcionCorta || pagina?.DescripcionCorta;
    
    if (pagina?.bannerUrl) {
      banners.push({
        url: pagina.bannerUrl,
        titulo: pagina.encabezado || 'Banner 1',
        descripcion: descripcionCorta || '',
        link: null
      });
    }
    
    if (pagina?.banner2Url) {
      banners.push({
        url: pagina.banner2Url,
        titulo: 'Banner 2',
        descripcion: '',
        link: null
      });
    }
    
    if (pagina?.banner3Url) {
      banners.push({
        url: pagina.banner3Url,
        titulo: 'Banner 3',
        descripcion: '',
        link: null
      });
    }

    if (banners.length === 0) {
      return (
        <Box key="banner" sx={{ 
          width: '100%',
          height: { xs: '140px', md: '180px', lg: '220px' },
          backgroundImage: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getContrastColor(colorPrimario),
          mb: 0
        }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            textAlign: 'center',
            px: 2,
            fontSize: { xs: '1.3rem', md: '1.7rem', lg: '2rem' }
          }}>
            {pagina?.encabezado || 'Bienvenido'}
          </Typography>
        </Box>
      );
    }

    return (
      <Box key="banner-carousel" sx={{ mb: 0 }}>
        <BannerCarousel 
          banners={banners}
          ordenBanners="1,2,3"
          intervalo={5000}           // ← Tiempo en ms (5 segundos)
          mostrarControles={true}
          mostrarIndicadores={true}
          // efectoTransicion="slide"  ← ❌ ELIMINADO (no existe esta prop)
          autoPlay={true}
          altura={320}
          mostrarTitulos={false}
          pausarAlHover={true}
          onBannerClick={(banner) => {
            if (banner.link) {
              window.open(banner.link, '_blank');
            }
          }}
        />
      </Box>
    );
  };

  const renderTituloPrincipal = () => {
    if (!pagina) return null;
    
    const { 
      colorFondo, 
      textoColor, 
      colorPrimario, 
      colorSecundario 
    } = getColors();
    
    const subtitulo = pagina?.subtitulo || pagina?.Subtitulo;
    const descripcionCorta = pagina?.descripcionCorta || pagina?.DescripcionCorta;

    const bordeColor = isLightColor(colorFondo) ? `${colorPrimario}15` : `${colorPrimario}30`;
    const fondoHover = isLightColor(colorFondo) ? `${colorPrimario}06` : `${colorPrimario}10`;

    return (
      <Container maxWidth={false} sx={{
        textAlign: 'center',
        mb: 0,
        mt: 0,
        position: 'relative',
        zIndex: 2,
        px: { xs: 1.5, md: 3 },
        background: colorFondo,
        color: textoColor,
        py: 3
      }}>
        <Box sx={{ 
          maxWidth: '1200px',
          mx: 'auto',
          position: 'relative'
        }}>
          
          <Box sx={{ 
            position: 'relative',
            zIndex: 1,
            borderRadius: 2,
            p: { xs: 2, md: 3 },
          }}>
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '1.5rem', md: '2rem', lg: '2.5rem' },
              fontWeight: 'bold',
              mb: 1,
              background: `linear-gradient(135deg, ${textoColor}, ${colorPrimario})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2
            }}>
              {pagina?.encabezado || 'Bienvenido'}
            </Typography>
            
            {subtitulo && subtitulo.trim() !== '' && (
              <Typography variant="h5" sx={{ 
                fontSize: { xs: '0.9rem', md: '1.1rem', lg: '1.2rem' },
                fontWeight: 400,
                mb: 1.5,
                color: textoColor,
                opacity: 0.8,
                fontStyle: 'italic'
              }}>
                {subtitulo}
              </Typography>
            )}
            
            <Box sx={{ 
              width: '50px',
              height: '2px',
              background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})`,
              mx: 'auto',
              mb: 2,
              borderRadius: '1px'
            }} />
            
            {descripcionCorta && descripcionCorta.trim() !== '' && (
              <Typography variant="body1" sx={{ 
                fontSize: '0.9rem', 
                color: textoColor,
                lineHeight: 1.5,
                mb: 2,
                maxWidth: '800px',
                mx: 'auto',
                px: { xs: 1, md: 1.5 },
                opacity: 0.75
              }}>
                "{descripcionCorta}"
              </Typography>
            )}
            
            <Box 
              onClick={toggleGestionTarjetas}
              sx={{ 
                mt: 1.5,
                p: 1.2,
                borderRadius: 1.2,
                backgroundColor: isLightColor(colorFondo) ? 
                  `${colorPrimario}04` : 
                  `${colorPrimario}06`,
                border: `1px solid ${bordeColor}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                maxWidth: '350px',
                mx: 'auto',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 3px 8px ${colorPrimario}12`,
                  borderColor: colorPrimario,
                  backgroundColor: fondoHover
                }
              }}
            >
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.8
              }}>
                <CreditCard sx={{ 
                  fontSize: '1.1rem', 
                  color: colorPrimario 
                }} />
                <Typography variant="body1" sx={{ 
                  color: colorPrimario,
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}>
                  {mostrarGestionTarjetas ? 'Ocultar Gestión' : 'Gestionar Tarjetas'}
                </Typography>
                {mostrarGestionTarjetas ? 
                  <ExpandLessIcon sx={{ 
                    fontSize: '1.1rem',
                    color: colorPrimario
                  }} /> : 
                  <ExpandMoreIcon sx={{ 
                    fontSize: '1.1rem',
                    color: colorPrimario
                  }} />
                }
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    );
  };

  const renderFooter = () => {
    const { colorFondo, textoColor, colorPrimario, colorSecundario } = getColors();
    
    const footerBackground = darkenColor(colorFondo);
    const footerTextColor = getContrastColor(footerBackground);

    return (
      <Paper sx={{ 
        mt: 4, 
        p: 2.5, 
        bgcolor: footerBackground,
        color: footerTextColor,
        borderRadius: '12px 12px 0 0',
        textAlign: 'center',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ mb: 2 }}>
          {pagina?.logoUrl && (
            <img 
               src={getImageUrl(pagina.logoUrl)}
              alt="Logo" 
              style={{ 
                height: '50px', 
                objectFit: 'contain',
                marginBottom: '16px'
              }} 
            />
          )}
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 'bold', 
            mb: 1.5,
            color: footerTextColor,
            background: `linear-gradient(135deg, ${footerTextColor}, ${colorPrimario})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '1.2rem'
          }}>
            {pagina?.cliente?.empresa || pagina?.cliente?.nombre || pagina?.encabezado?.replace('Bienvenido a ', '') || 'Mi Empresa'}
          </Typography>
        </Box>
        
        <Divider sx={{ 
          bgcolor: `${footerTextColor}20`, 
          my: 2 
        }} />
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mb: 2 }}>
          {pagina?.telefono && (
            <Chip 
              icon={<Phone sx={{ color: footerTextColor, fontSize: '0.9rem' }} />} 
              label={pagina.telefono} 
              sx={{ 
                bgcolor: `${footerTextColor}10`, 
                color: footerTextColor,
                fontSize: '0.8rem',
                py: 1,
                px: 1.2,
                border: `1px solid ${footerTextColor}20`,
                '&:hover': {
                  bgcolor: `${footerTextColor}15`
                }
              }} 
            />
          )}
          {pagina?.email && (
            <Chip 
              icon={<Email sx={{ color: footerTextColor, fontSize: '0.9rem' }} />} 
              label={pagina.email} 
              sx={{ 
                bgcolor: `${footerTextColor}10`, 
                color: footerTextColor,
                fontSize: '0.8rem',
                py: 1,
                px: 1.2,
                border: `1px solid ${footerTextColor}20`,
                '&:hover': {
                  bgcolor: `${footerTextColor}15`
                }
              }} 
            />
          )}
          {pagina?.direccion && (
            <Chip 
              icon={<LocationOn sx={{ color: footerTextColor, fontSize: '0.9rem' }} />} 
              label={pagina.direccion} 
              sx={{ 
                bgcolor: `${footerTextColor}10`, 
                color: footerTextColor,
                fontSize: '0.75rem',
                py: 1,
                px: 1.2,
                border: `1px solid ${footerTextColor}20`,
                '&:hover': {
                  bgcolor: `${footerTextColor}15`
                }
              }} 
            />
          )}
          {pagina?.horarioAtencion && (
            <Chip 
              icon={<Schedule sx={{ color: footerTextColor, fontSize: '0.9rem' }} />} 
              label={pagina.horarioAtencion} 
              sx={{ 
                bgcolor: `${footerTextColor}10`, 
                color: footerTextColor,
                fontSize: '0.75rem',
                py: 1,
                px: 1.2,
                border: `1px solid ${footerTextColor}20`,
                '&:hover': {
                  bgcolor: `${footerTextColor}15`
                }
              }} 
            />
          )}
        </Stack>
        
        <Divider sx={{ 
          bgcolor: `${footerTextColor}20`, 
          my: 2 
        }} />
        
        <Box>
          <Typography variant="body2" sx={{ 
            opacity: 0.7, 
            mb: 0.5,
            color: footerTextColor,
            fontSize: '0.75rem'
          }}>
            © {new Date().getFullYear()} {pagina?.cliente?.empresa || pagina?.cliente?.nombre || 'Mi Empresa'}. Todos los derechos reservados.
          </Typography>
          <Typography variant="caption" sx={{ 
            opacity: 0.5,
            color: footerTextColor,
            fontSize: '0.7rem'
          }}>
            Página generada con Sistema de Tarjetas
          </Typography>
        </Box>
      </Paper>
    );
  };

  const renderSecciones = () => {
    if (loading) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={30} />
          <Typography variant="body1" sx={{ mt: 1.5, fontSize: '0.9rem' }}>Cargando página...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper elevation={1} sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom sx={{ fontSize: '1.2rem' }}>
              ⚠️ Página no disponible
            </Typography>
            <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              1. La página no existe para el cliente ID: {clienteId}<br />
              2. La página no está activa<br />
              3. Error de conexión con el servidor
            </Typography>
          </Paper>
        </Container>
      );
    }

    if (!pagina) {
      return null;
    }

    const { colorFondo, textoColor, colorPrimario, colorSecundario } = getColors();

    return (
      <>
        {renderModalImagen()}
        
        {renderBannerCarousel()}
        
        {renderTituloPrincipal()}
        
        {renderGestionTarjetas()}
        
        <Container maxWidth="md" sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Box id="activacion-tarjetas-section" sx={{ width: '100%' }}>
              {renderFormularioActivacion()}
            </Box>
            <Box id="verificacion-tarjetas-section" sx={{ width: '100%' }}>
              {renderFormularioVerificacion()}
            </Box>
          </Box>
        </Container>
        
        <Container maxWidth="lg">
          {pagina?.cuerpo && (
            <Paper key="contenido" sx={{ 
              p: 2, 
              mb: 4, 
              borderRadius: 1.5,
              background: colorFondo,
              color: textoColor,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              '& h1, & h2, & h3, & h4, & h5, & h6': { 
                color: textoColor
              },
              '& a': {
                color: colorPrimario,
                textDecoration: 'underline'
              }
            }}>
              <ReactMarkdown>
                {pagina.cuerpo}
              </ReactMarkdown>
            </Paper>
          )}

        

          {pagina?.mostrarTestimonios && renderTestimoniosPersonalizados()}

          {pagina?.mostrarGalerias && renderGaleriasImagenes()}

          {pagina?.mostrarVideos && renderVideosEmbebidos()}

          {renderContacto()}

          {/* SECCIÓN DE STREAMING - AHORA ARRIBA DE REDES SOCIALES */}
          <Box sx={{ 
            mb: 4, 
            p: 3, 
            bgcolor: colorFondo,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: `1px solid ${isLightColor(colorFondo) ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`
          }}>
            <StreamingFooterButtons 
              onOptionClick={handleStreamingOption}
              colorPrimario={colorPrimario}
              colorSecundario={colorSecundario}
              fondoClaro={isLightColor(colorFondo)}
            />
          </Box>

          {/* REDES SOCIALES - AHORA DEBAJO DE STREAMING */}
          {renderRedesSociales()}
        </Container>
      </>
    );
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: pagina?.colorPrimario || '#2196f3',
      },
      secondary: {
        main: pagina?.colorSecundario || '#ff9800',
      },
      background: {
        default: pagina?.colorFondo || '#ffffff',
      },
      text: {
        primary: getColors().textoColor,
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      h1: {
        fontSize: '2rem',
        '@media (max-width:600px)': {
          fontSize: '1.5rem',
        },
      },
      h2: {
        fontSize: '1.5rem',
        '@media (max-width:600px)': {
          fontSize: '1.2rem',
        },
      },
      body1: {
        fontSize: '0.9rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontSize: '0.85rem',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            wordBreak: 'break-word',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      
      <Box 
        sx={{ 
          backgroundColor: pagina?.colorFondo || '#f5f5f5',
          color: getColors().textoColor,
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ flex: 1 }}>
          {renderSecciones()}
        </Box>
        
        {renderFooter()}

        {/* Botones flotantes */}
        <Box sx={{ 
          position: 'fixed', 
          bottom: 12, 
          right: 12, 
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.8 
        }}>
          <Fab 
            size="small"
            onClick={() => setQrDialogOpen(true)} 
            sx={{ 
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              bgcolor: getColors().colorPrimario,
              color: getContrastColor(getColors().colorPrimario),
              width: 40,
              height: 40,
              '&:hover': { 
                bgcolor: getColors().colorPrimario, 
                opacity: 0.9 
              }
            }}
          >
            <QrCode fontSize="small" />
          </Fab>
          
          <Fab 
            size="small"
            onClick={() => setShareDialogOpen(true)} 
            sx={{ 
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              bgcolor: getColors().colorSecundario,
              color: getContrastColor(getColors().colorSecundario),
              width: 40,
              height: 40,
              '&:hover': { 
                bgcolor: getColors().colorSecundario, 
                opacity: 0.9 
              }
            }}
          >
            <Share fontSize="small" />
          </Fab>
        </Box>

        {/* Diálogo QR */}
        <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            bgcolor: getColors().colorPrimario, 
            color: getContrastColor(getColors().colorPrimario),
            py: 1.5,
            px: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Código QR de la Página</Typography>
            <IconButton onClick={() => setQrDialogOpen(false)} sx={{ color: getContrastColor(getColors().colorPrimario), p: 0.5 }}>
              <Close fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 2.5 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getPageUrl())}`}
              alt="QR Code"
              style={{ width: 180, height: 180, marginBottom: 15, borderRadius: 6 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all', mb: 2, fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {getPageUrl()}
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center">
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<ContentCopy fontSize="small" />}
                onClick={() => {
                  navigator.clipboard.writeText(getPageUrl());
                  alert('URL copiada al portapapeles');
                }}
                sx={{ minWidth: 120, fontSize: '0.8rem' }}
              >
                Copiar URL
              </Button>
              <Button 
                variant="contained"
                size="small"
                onClick={() => window.open(getPageUrl(), '_blank')}
                sx={{ 
                  minWidth: 120,
                  fontSize: '0.8rem',
                  bgcolor: getColors().colorPrimario,
                  color: getContrastColor(getColors().colorPrimario)
                }}
              >
                Abrir Página
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* Diálogo Compartir */}
        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ 
            bgcolor: getColors().colorPrimario, 
            color: getContrastColor(getColors().colorPrimario),
            py: 1.5,
            px: 2,
            fontSize: '1rem'
          }}>
            Compartir Página
          </DialogTitle>
          <DialogContent sx={{ pt: 2, pb: 1 }}>
            <List dense>
              <ListItem 
                button 
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Mira esta página: ${getPageUrl()}`)}`, '_blank');
                  setShareDialogOpen(false);
                }}
                sx={{ 
                  '&:hover': { bgcolor: `${getColors().colorPrimario}08` },
                  borderRadius: 1,
                  mb: 0.5,
                  py: 0.8
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><WhatsApp sx={{ color: '#25D366', fontSize: 22 }} /></ListItemIcon>
                <ListItemText 
                  primary="Compartir en WhatsApp" 
                  secondary="Comparte con tus contactos"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPageUrl())}`, '_blank');
                  setShareDialogOpen(false);
                }}
                sx={{ 
                  '&:hover': { bgcolor: `${getColors().colorPrimario}08` },
                  borderRadius: 1,
                  mb: 0.5,
                  py: 0.8
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><Facebook sx={{ color: '#1877F2', fontSize: 22 }} /></ListItemIcon>
                <ListItemText 
                  primary="Compartir en Facebook" 
                  secondary="Publica en tu muro"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => {
                  navigator.clipboard.writeText(getPageUrl());
                  alert('✅ URL copiada al portapapeles');
                  setShareDialogOpen(false);
                }}
                sx={{ 
                  '&:hover': { bgcolor: `${getColors().colorPrimario}08` },
                  borderRadius: 1,
                  py: 0.8
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><ContentCopy sx={{ color: getColors().colorPrimario, fontSize: 22 }} /></ListItemIcon>
                <ListItemText 
                  primary="Copiar enlace" 
                  secondary="Copia la URL para compartir"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions sx={{ px: 2, py: 1 }}>
            <Button onClick={() => setShareDialogOpen(false)} size="small">Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}