import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import { ChevronLeft, ChevronRight, PlayCircleOutline, PauseCircleOutline, FiberManualRecord, Shuffle, ViewCarousel, NavigateNext, NavigateBefore } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const BannerCarousel = ({
  banners = [],
  ordenBanners = "1,2,3",
  intervalo = 3000,
  mostrarControles = true,
  mostrarIndicadores = true,
  autoPlay = true,
  altura = 250,
  size = 'small',
  borderRadius = 2,
  onBannerClick,
  mostrarContador = true,
  mostrarTitulos = false,
  pausarAlHover = true
}) => {
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Configuración de tamaños
  const sizeConfig = {
    small: esMovil ? 180 : 250,
    medium: esMovil ? 250 : 350,
    large: esMovil ? 300 : 400,
    custom: altura
  };

  // Altura calculada
  const alturaFinal = typeof sizeConfig[size] === 'number' ? sizeConfig[size] : altura;

  const [bannerActual, setBannerActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [direccion, setDireccion] = useState('right');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const intervaloRef = useRef(null);
  const tiempoInicioRef = useRef(null);

  // Orden personalizado
  const procesarOrdenBanners = () => {
    if (!banners || banners.length === 0) return [];
    try {
      const ordenArray = ordenBanners.split(',').map(n => parseInt(n.trim()) - 1);
      const bannersOrdenados = [];
      ordenArray.forEach(i => {
        if (i >= 0 && i < banners.length) bannersOrdenados.push({ ...banners[i], originalIndex: i });
      });
      banners.forEach((b, i) => { if (!ordenArray.includes(i)) bannersOrdenados.push({ ...b, originalIndex: i }); });
      return bannersOrdenados;
    } catch (err) {
      console.error(err);
      return banners.map((b, i) => ({ ...b, originalIndex: i }));
    }
  };
  
  const bannersOrdenados = procesarOrdenBanners();
  const totalBanners = bannersOrdenados.length;

  // Funciones de navegación con useCallback
  const reiniciarTiempo = useCallback(() => { 
    tiempoInicioRef.current = Date.now(); 
    setTiempoTranscurrido(0); 
  }, []);

  const siguienteBanner = useCallback(() => { 
    if (totalBanners <= 1) return; 
    setDireccion('right'); 
    setBannerActual(prev => (prev + 1) % totalBanners); 
    reiniciarTiempo(); 
  }, [totalBanners, reiniciarTiempo]);

  const bannerAnterior = useCallback(() => { 
    if (totalBanners <= 1) return; 
    setDireccion('left'); 
    setBannerActual(prev => (prev - 1 + totalBanners) % totalBanners); 
    reiniciarTiempo(); 
  }, [totalBanners, reiniciarTiempo]);

  const irABanner = useCallback((index) => { 
    if (index === bannerActual) return; 
    setDireccion(index > bannerActual ? 'right' : 'left'); 
    setBannerActual(index); 
    reiniciarTiempo(); 
  }, [bannerActual, reiniciarTiempo]);

  // Auto-play
  const iniciarAutoPlay = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    if (autoPlay && !pausado && totalBanners > 1) {
      tiempoInicioRef.current = Date.now();
      intervaloRef.current = setInterval(() => {
        const transcurrido = Date.now() - tiempoInicioRef.current;
        setTiempoTranscurrido(transcurrido);
        if (transcurrido >= intervalo) {
          siguienteBanner();
          tiempoInicioRef.current = Date.now();
          setTiempoTranscurrido(0);
        }
      }, 100);
    }
  }, [autoPlay, pausado, totalBanners, intervalo, siguienteBanner]);

  const detenerAutoPlay = useCallback(() => { 
    if (intervaloRef.current) { 
      clearInterval(intervaloRef.current); 
      intervaloRef.current = null; 
    } 
  }, []);

  // Efecto principal para auto-play - ¡CORREGIDO!
  useEffect(() => { 
    iniciarAutoPlay(); 
    return () => detenerAutoPlay(); 
  }, [iniciarAutoPlay, detenerAutoPlay]); // Dependencias correctas

  // Hover
  const manejarMouseEnter = useCallback(() => { 
    if (pausarAlHover) {
      setPausado(true); 
      detenerAutoPlay(); 
    }
  }, [pausarAlHover, detenerAutoPlay]);

  const manejarMouseLeave = useCallback(() => { 
    if (pausarAlHover) {
      setPausado(false); 
      iniciarAutoPlay(); 
    }
  }, [pausarAlHover, iniciarAutoPlay]);

  const alternarPausa = useCallback(() => { 
    setPausado(prev => !prev); 
    if (pausado) {
      iniciarAutoPlay(); 
    } else {
      detenerAutoPlay(); 
    }
  }, [pausado, iniciarAutoPlay, detenerAutoPlay]);

  // Pre-carga de siguiente imagen
  useEffect(() => {
    if (totalBanners > 1) {
      const siguiente = (bannerActual + 1) % totalBanners;
      const img = new Image();
      img.src = bannersOrdenados[siguiente]?.url;
    }
  }, [bannerActual, bannersOrdenados, totalBanners]);

  // Carga de imagen
  const manejarCargaImagen = () => setCargando(false);
  const manejarErrorImagen = () => { 
    setCargando(false); 
    console.error('Error cargando banner'); 
  };

  // Render de transición
  const renderTransicion = () => {
    const banner = bannersOrdenados[bannerActual];
    const porcentajeProgreso = (tiempoTranscurrido / intervalo) * 100;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={bannerActual}
          initial={{ opacity: 0, x: direccion === 'right' ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direccion === 'right' ? -100 : 100 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'relative',
            width: '100%',
            height: alturaFinal,
            overflow: 'hidden',
            borderRadius: borderRadius,
            cursor: banner?.link ? 'pointer' : 'default'
          }}
          onClick={() => banner?.link && onBannerClick && onBannerClick(banner)}
        >
          {cargando && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              bgcolor: 'rgba(0,0,0,0.05)' 
            }}>
              <CircularProgress />
            </Box>
          )}

          <img
            src={banner?.url || '/placeholder-banner.jpg'}
            alt={banner?.titulo || `Banner ${bannerActual + 1}`}
            onLoad={manejarCargaImagen}
            onError={manejarErrorImagen}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              imageRendering: 'auto',
            }}
          />

          {/* Overlay título */}
          {(banner?.titulo || banner?.descripcion) && mostrarTitulos && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              bgcolor: 'rgba(0,0,0,0.7)', 
              color: 'white', 
              p: 2 
            }}>
              {banner?.titulo && <Typography variant="h6">{banner.titulo}</Typography>}
              {banner?.descripcion && <Typography variant="body2">{banner.descripcion}</Typography>}
            </Box>
          )}

          {/* Indicador de progreso */}
          {autoPlay && mostrarContador && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              width: `${porcentajeProgreso}%`, 
              height: 3, 
              bgcolor: 'primary.main', 
              transition: 'width 0.1s linear' 
            }} />
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (!banners || banners.length === 0) {
    return (
      <Box sx={{ 
        height: alturaFinal, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'grey.100', 
        borderRadius: borderRadius 
      }}>
        <Alert severity="info">No hay banners configurados.</Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        borderRadius, 
        overflow: 'hidden', 
        boxShadow: theme.shadows[3] 
      }} 
      onMouseEnter={manejarMouseEnter} 
      onMouseLeave={manejarMouseLeave}
    >
      {/* Cabecera */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 2, 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ViewCarousel sx={{ color: 'white' }} />
          <Chip 
            label={`${bannerActual + 1}/${totalBanners}`} 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
          {ordenBanners !== "1,2,3" && (
            <Tooltip title="Orden personalizado activado">
              <Shuffle sx={{ color: 'white', fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>

        {autoPlay && (
          <Tooltip title={pausado ? "Reanudar rotación" : "Pausar rotación"}>
            <IconButton 
              onClick={alternarPausa} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
              }}
            >
              {pausado ? <PlayCircleOutline /> : <PauseCircleOutline />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Banner principal */}
      {renderTransicion()}

      {/* Controles */}
      {mostrarControles && totalBanners > 1 && (
        <>
          <IconButton 
            onClick={bannerAnterior} 
            sx={{ 
              position: 'absolute', 
              left: 16, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              bgcolor: 'rgba(255,255,255,0.9)', 
              display: esMovil ? 'none' : 'flex', 
              zIndex: 2,
              ...(size === 'small' && {
                width: 32,
                height: 32,
                '& svg': { fontSize: 20 }
              })
            }}
            size={size === 'small' ? 'small' : 'medium'}
          >
            <ChevronLeft />
          </IconButton>
          
          <IconButton 
            onClick={siguienteBanner} 
            sx={{ 
              position: 'absolute', 
              right: 16, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              bgcolor: 'rgba(255,255,255,0.9)', 
              display: esMovil ? 'none' : 'flex', 
              zIndex: 2,
              ...(size === 'small' && {
                width: 32,
                height: 32,
                '& svg': { fontSize: 20 }
              })
            }}
            size={size === 'small' ? 'small' : 'medium'}
          >
            <ChevronRight />
          </IconButton>

          {esMovil && (
            <>
              <IconButton 
                onClick={bannerAnterior} 
                sx={{ 
                  position: 'absolute', 
                  left: 8, 
                  top: '50%', 
                  bgcolor: 'rgba(0,0,0,0.5)', 
                  color: 'white', 
                  zIndex: 2 
                }} 
                size="small"
              >
                <NavigateBefore />
              </IconButton>
              <IconButton 
                onClick={siguienteBanner} 
                sx={{ 
                  position: 'absolute', 
                  right: 8, 
                  top: '50%', 
                  bgcolor: 'rgba(0,0,0,0.5)', 
                  color: 'white', 
                  zIndex: 2 
                }} 
                size="small"
              >
                <NavigateNext />
              </IconButton>
            </>
          )}
        </>
      )}

      {/* Indicadores */}
      {mostrarIndicadores && totalBanners > 1 && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 1, 
          zIndex: 2 
        }}>
          {bannersOrdenados.map((_, i) => (
            <Tooltip key={i} title={`Ir al banner ${i + 1}`}>
              <IconButton 
                onClick={() => irABanner(i)} 
                size="small" 
                sx={{ 
                  p: 0, 
                  color: i === bannerActual ? 'primary.main' : 'rgba(255,255,255,0.5)'
                }}
              >
                <FiberManualRecord sx={{ fontSize: i === bannerActual ? 16 : 12 }} />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BannerCarousel;