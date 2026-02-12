import React, { useState, useEffect, useRef } from "react";
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
  Divider,
  Chip,
  Stack,
  CircularProgress,
  Card,
  CardMedia,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  Paper,
  FormGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Tooltip
} from "@mui/material";
import { 
  Close, 
  Save, 
  Language, 
  Image as ImageIcon, 
  Phone,
  Email,
  Preview,
  InsertPhoto,
  Delete,
  AddPhotoAlternate,
  Palette,
  Style,
  Description,
  WhatsApp,
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  YouTube,
  Settings,
  Dashboard,
  Widgets,
  Share,
  Code,
  Add,
  Remove,
  ExpandMore,
  PlayArrow,
  InsertLink,
  Star,
  Person,
  Title,
  VideoLibrary,
  CheckCircle,
  Restore,
  Shuffle,
  ViewCarousel
} from "@mui/icons-material";
import { API_BASE_URL } from "../config";

// Mapeo de iconos para servicios
const iconosDisponibles = [
  { value: 'Computer', label: 'Computadora' },
  { value: 'Store', label: 'Tienda' },
  { value: 'TrendingUp', label: 'Marketing' },
  { value: 'Palette', label: 'Diseño' },
  { value: 'Settings', label: 'Configuración' },
  { value: 'Security', label: 'Seguridad' },
  { value: 'Phone', label: 'Teléfono' },
  { value: 'Email', label: 'Email' },
  { value: 'Business', label: 'Negocio' },
  { value: 'Build', label: 'Construcción' },
  { value: 'LocalHospital', label: 'Salud' },
  { value: 'Restaurant', label: 'Restaurante' },
  { value: 'CarRepair', label: 'Automotriz' },
  { value: 'School', label: 'Educación' },
  { value: 'Spa', label: 'Bienestar' },
  { value: 'FitnessCenter', label: 'Fitness' },
  { value: 'DirectionsCar', label: 'Transporte' }
];

export default function PaginaFormPro({ open, onClose, paginaData, cliente, onSave }) {
  console.log('📋 PaginaFormPro montado con:', {
    open,
    paginaData,
    cliente,
    tienePaginaData: !!paginaData,
    tieneCliente: !!cliente
  });

  // Estados
  const [pagina, setPagina] = useState({
    clienteId: "",
    encabezado: "Bienvenido a mi sitio",
    subtitulo: "",
    cuerpo: "",
    descripcionCorta: "",
    telefono: "",
    email: "",
    direccion: "",
    horarioAtencion: "",
    
    // Colores y tema
    colorFondo: "#ffffff",
    colorTexto: "#333333",
    colorPrimario: "#2196f3",
    colorSecundario: "#ff9800",
    colorAcento: "#4caf50",
    tema: "claro",
    
    // Imágenes - AHORA CON 3 BANNERS
    logoUrl: "",
    bannerUrl: "",
    banner2Url: "", // ← NUEVO BANNER 2
    banner3Url: "", // ← NUEVO BANNER 3
    ordenBanners: "1,2,3", // ← NUEVO ORDEN DE ROTACIÓN
    faviconUrl: "",
    
    // Secciones
    mostrarTestimonios: true,
    mostrarServicios: true,
    mostrarEquipo: false,
    mostrarBlog: false,
    mostrarContacto: false,
    mostrarMapa: false,
    mostrarAnimaciones: true,
    mostrarGalerias: true,
    mostrarVideos: true,
    
    // Redes sociales
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    whatsappUrl: "",
    
    // SEO
    metaTitulo: "",
    metaDescripcion: "",
    metaKeywords: "",
    
    // Configuración avanzada
    codigoAnalytics: "",
    codigoHeader: "",
    codigoFooter: "",
    
    // Estado
    estado: "activo",
    esResponsive: true,
    velocidadCarga: "normal"
  });
  
  const [servicios, setServicios] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [galerias, setGalerias] = useState([]);
  const [videos, setVideos] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingBanner2, setUploadingBanner2] = useState(false);
  const [uploadingBanner3, setUploadingBanner3] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [expandedGallery, setExpandedGallery] = useState(null);
  const [uploadingImages, setUploadingImages] = useState({});
  const [hasRecoveredData, setHasRecoveredData] = useState(false);
  const [bannerActivos, setBannerActivos] = useState([true, true, true]); // Para controlar qué banners mostrar

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const banner2InputRef = useRef(null); // ← NUEVO REF PARA BANNER 2
  const banner3InputRef = useRef(null); // ← NUEVO REF PARA BANNER 3
  const faviconInputRef = useRef(null);
  const imageInputRefs = useRef({});

  // ========== DETECCIÓN DE DATOS DEL PREVIEW ==========
  useEffect(() => {
    if (open && cliente?.id) {
      console.log('🔍 Buscando datos del preview para cliente:', cliente.id);
      
      // Buscar datos en localStorage
      const previewDataKeys = Object.keys(localStorage).filter(key => 
        key.includes(`preview_${cliente.id}`) || 
        key.includes(`pagina_edit_${cliente.id}`) ||
        key.includes(`current_edit_${cliente.id}`) ||
        key.includes(`from_preview_${cliente.id}`)
      );
      
      console.log('📁 Claves encontradas en localStorage:', previewDataKeys);
      
      // Si hay datos del preview y no estamos editando una página existente
      if (previewDataKeys.length > 0 && !paginaData) {
        // Intentar recuperar datos del preview
        let datosRecuperados = null;
        let sourceKey = null;
        
        // Buscar en todas las claves posibles
        for (const key of previewDataKeys) {
          try {
            if (key.includes('current_edit_')) {
              const currentEditKey = localStorage.getItem(key);
              if (currentEditKey) {
                const data = localStorage.getItem(currentEditKey);
                if (data) {
                  datosRecuperados = JSON.parse(data);
                  sourceKey = currentEditKey;
                  console.log('✅ Datos encontrados en:', currentEditKey, datosRecuperados);
                  break;
                }
              }
            } else if (key.includes('pagina_edit_') || key.includes('preview_')) {
              const data = localStorage.getItem(key);
              if (data) {
                datosRecuperados = JSON.parse(data);
                sourceKey = key;
                console.log('✅ Datos encontrados en:', key, datosRecuperados);
                break;
              }
            }
          } catch (err) {
            console.error('❌ Error parseando datos de localStorage:', err);
          }
        }
        
        if (datosRecuperados) {
          // Restaurar datos principales
          setPagina(prev => ({
            ...prev,
            ...datosRecuperados,
            clienteId: cliente.id,
            // Asegurar que existan los nuevos campos
            banner2Url: datosRecuperados.banner2Url || "",
            banner3Url: datosRecuperados.banner3Url || "",
            ordenBanners: datosRecuperados.ordenBanners || "1,2,3"
          }));
          
          // Configurar banners activos basados en si tienen URL
          const banners = [
            datosRecuperados.bannerUrl,
            datosRecuperados.banner2Url,
            datosRecuperados.banner3Url
          ];
          setBannerActivos(banners.map(url => url && url.trim() !== ""));
          
          // Restaurar elementos personalizados
          if (datosRecuperados.serviciosPersonalizados) {
            setServicios(datosRecuperados.serviciosPersonalizados);
          } else if (datosRecuperados.servicios) {
            setServicios(datosRecuperados.servicios);
          } else {
            // Servicios por defecto
            setServicios([
              { id: 1, nombre: 'Desarrollo Web', descripcion: 'Sitios web modernos y responsivos', icono: 'Computer', activo: true },
              { id: 2, nombre: 'E-commerce', descripcion: 'Tiendas online completas y seguras', icono: 'Store', activo: true },
              { id: 3, nombre: 'Marketing Digital', descripcion: 'Estrategias para aumentar tu visibilidad', icono: 'TrendingUp', activo: true },
              { id: 4, nombre: 'Diseño UI/UX', descripcion: 'Experiencias de usuario excepcionales', icono: 'Palette', activo: true }
            ]);
          }
          
          if (datosRecuperados.testimoniosPersonalizados) {
            setTestimonios(datosRecuperados.testimoniosPersonalizados);
          } else if (datosRecuperados.testimonios) {
            setTestimonios(datosRecuperados.testimonios);
          } else {
            // Testimonios por defecto
            setTestimonios([
              { id: 1, nombre: "Juan Pérez", cargo: "CEO, Empresa X", comentario: "Excelente servicio, muy profesionales y atentos a nuestras necesidades.", calificacion: 5, activo: true },
              { id: 2, nombre: "María González", cargo: "Directora de Marketing", comentario: "Increíble transformación digital para nuestra empresa. ¡Altamente recomendados!", calificacion: 5, activo: true },
              { id: 3, nombre: "Carlos Rodríguez", cargo: "Gerente General", comentario: "Los resultados superaron nuestras expectativas. Gran equipo de trabajo.", calificacion: 4, activo: true }
            ]);
          }
          
          if (datosRecuperados.galeriasImagenes) {
            setGalerias(datosRecuperados.galeriasImagenes);
          } else if (datosRecuperados.galerias) {
            setGalerias(datosRecuperados.galerias);
          } else {
            // Galerías por defecto
            setGalerias([
              { 
                id: 1, 
                titulo: "Nuestros Proyectos", 
                descripcion: "Algunos de nuestros trabajos más destacados", 
                imagenes: [
                  { id: 1, url: "", titulo: "Proyecto 1", descripcion: "Descripción del proyecto 1" },
                  { id: 2, url: "", titulo: "Proyecto 2", descripcion: "Descripción del proyecto 2" },
                  { id: 3, url: "", titulo: "Proyecto 3", descripcion: "Descripción del proyecto 3" }
                ], 
                activo: true 
              }
            ]);
          }
          
          if (datosRecuperados.videosEmbebidos) {
            setVideos(datosRecuperados.videosEmbebidos);
          } else if (datosRecuperados.videos) {
            setVideos(datosRecuperados.videos);
          } else {
            // Videos por defecto
            setVideos([
              { id: 1, titulo: "Video Corporativo", url: "", descripcion: "Conoce más sobre nosotros", tipo: "youtube", activo: true }
            ]);
          }
          
          // Mostrar mensaje de éxito
          setSuccessMessage('✅ Datos del preview recuperados correctamente');
          setHasRecoveredData(true);
          
          // Limpiar datos del localStorage después de usarlos
          setTimeout(() => {
            if (sourceKey) {
              localStorage.removeItem(sourceKey);
            }
            // Limpiar todas las claves relacionadas
            previewDataKeys.forEach(key => localStorage.removeItem(key));
            console.log('🧹 Datos del preview limpiados del localStorage');
          }, 3000);
          
          return; // Salir para no cargar datos por defecto
        }
      }
      
      // ========== CARGAR DATOS NORMALES (cuando no hay preview) ==========
      if (paginaData) {
        console.log('📥 Cargando datos existentes de la página');
        setPagina({
          // Valores por defecto
          clienteId: "",
          encabezado: "Bienvenido a mi sitio",
          subtitulo: "",
          cuerpo: "",
          descripcionCorta: "",
          telefono: "",
          email: "",
          direccion: "",
          horarioAtencion: "",
          colorFondo: "#ffffff",
          colorTexto: "#333333",
          colorPrimario: "#2196f3",
          colorSecundario: "#ff9800",
          colorAcento: "#4caf50",
          tema: "claro",
          logoUrl: "",
          bannerUrl: "",
          banner2Url: "", // ← INICIALIZAR
          banner3Url: "", // ← INICIALIZAR
          ordenBanners: "1,2,3", // ← INICIALIZAR
          faviconUrl: "",
          mostrarTestimonios: true,
          mostrarServicios: true,
          mostrarEquipo: false,
          mostrarBlog: false,
          mostrarContacto: false,
          mostrarMapa: false,
          mostrarAnimaciones: true,
          mostrarGalerias: true,
          mostrarVideos: true,
          facebookUrl: "",
          instagramUrl: "",
          twitterUrl: "",
          linkedinUrl: "",
          youtubeUrl: "",
          whatsappUrl: "",
          metaTitulo: "",
          metaDescripcion: "",
          metaKeywords: "",
          codigoAnalytics: "",
          codigoHeader: "",
          codigoFooter: "",
          estado: "activo",
          esResponsive: true,
          velocidadCarga: "normal",
          
          // Sobreescribir con datos existentes
          ...paginaData,
        
        });
        
        // Configurar banners activos
        const banners = [
          paginaData.bannerUrl,
          paginaData.banner2Url,
          paginaData.banner3Url
        ];
        setBannerActivos(banners.map(url => url && url.trim() !== ""));
        
        if (paginaData.serviciosPersonalizados) {
          setServicios(paginaData.serviciosPersonalizados);
        } else {
          setServicios([
            { id: 1, nombre: 'Desarrollo Web', descripcion: 'Sitios web modernos y responsivos', icono: 'Computer', activo: true },
            { id: 2, nombre: 'E-commerce', descripcion: 'Tiendas online completas y seguras', icono: 'Store', activo: true },
            { id: 3, nombre: 'Marketing Digital', descripcion: 'Estrategias para aumentar tu visibilidad', icono: 'TrendingUp', activo: true },
            { id: 4, nombre: 'Diseño UI/UX', descripcion: 'Experiencias de usuario excepcionales', icono: 'Palette', activo: true }
          ]);
        }
        
        if (paginaData.testimoniosPersonalizados) {
          setTestimonios(paginaData.testimoniosPersonalizados);
        } else {
          setTestimonios([
            { id: 1, nombre: "Juan Pérez", cargo: "CEO, Empresa X", comentario: "Excelente servicio, muy profesionales y atentos a nuestras necesidades.", calificacion: 5, activo: true },
            { id: 2, nombre: "María González", cargo: "Directora de Marketing", comentario: "Increíble transformación digital para nuestra empresa. ¡Altamente recomendados!", calificacion: 5, activo: true },
            { id: 3, nombre: "Carlos Rodríguez", cargo: "Gerente General", comentario: "Los resultados superaron nuestras expectativas. Gran equipo de trabajo.", calificacion: 4, activo: true }
          ]);
        }
        
        if (paginaData.galeriasImagenes) {
          setGalerias(paginaData.galeriasImagenes);
        } else {
          setGalerias([
            { 
              id: 1, 
              titulo: "Nuestros Proyectos", 
              descripcion: "Algunos de nuestros trabajos más destacados", 
              imagenes: [
                { id: 1, url: "", titulo: "Proyecto 1", descripcion: "Descripción del proyecto 1" },
                { id: 2, url: "", titulo: "Proyecto 2", descripcion: "Descripción del proyecto 2" },
                { id: 3, url: "", titulo: "Proyecto 3", descripcion: "Descripción del proyecto 3" }
              ], 
              activo: true 
            }
          ]);
        }
        
        if (paginaData.videosEmbebidos) {
          setVideos(paginaData.videosEmbebidos);
        } else {
          setVideos([
            { id: 1, titulo: "Video Corporativo", url: "", descripcion: "Conoce más sobre nosotros", tipo: "youtube", activo: true }
          ]);
        }
        
      } else if (cliente) {
        console.log('🆕 Creando nueva página para cliente:', cliente.nombre);
        const nuevaPagina = {
          clienteId: cliente.id,
          encabezado: `Bienvenido a ${cliente.empresa || cliente.nombre}`,
          subtitulo: "Tu éxito es nuestro compromiso",
          descripcionCorta: cliente.empresa ? `Somos ${cliente.empresa}, especializados en brindar soluciones innovadoras y de calidad.` : "",
          cuerpo: `## Sobre Nosotros\n\nSomos ${cliente.empresa || cliente.nombre}, una empresa comprometida con la excelencia y la satisfacción de nuestros clientes.\n\n## Nuestros Servicios\n\n- Servicio 1\n- Servicio 2\n- Servicio 3`,
          telefono: cliente.telefono || "",
          email: cliente.email || "",
          direccion: "",
          horarioAtencion: "",
          colorFondo: "#ffffff",
          colorTexto: "#333333",
          colorPrimario: "#667eea",
          colorSecundario: "#764ba2",
          colorAcento: "#4caf50",
          tema: "claro",
          logoUrl: "",
          bannerUrl: "",
          banner2Url: "", // ← INICIALIZAR
          banner3Url: "", // ← INICIALIZAR
          ordenBanners: "1,2,3", // ← INICIALIZAR
          faviconUrl: "",
          mostrarTestimonios: true,
          mostrarServicios: true,
          mostrarEquipo: false,
          mostrarBlog: false,
          mostrarContacto: false,
          mostrarMapa: false,
          mostrarAnimaciones: true,
          mostrarGalerias: true,
          mostrarVideos: true,
          facebookUrl: "",
          instagramUrl: "",
          twitterUrl: "",
          linkedinUrl: "",
          youtubeUrl: "",
          whatsappUrl: "",
          metaTitulo: `${cliente.empresa || cliente.nombre} - Página Oficial`,
          metaDescripcion: `Página oficial de ${cliente.empresa || cliente.nombre}. Descubre nuestros servicios y contáctanos.`,
          metaKeywords: "",
          codigoAnalytics: "",
          codigoHeader: "",
          codigoFooter: "",
          estado: "activo",
          esResponsive: true,
          velocidadCarga: "normal"
        };
        setPagina(nuevaPagina);
        
        // Inicializar banners activos
        setBannerActivos([true, true, true]);
        
        setServicios([
          { id: 1, nombre: 'Desarrollo Web', descripcion: 'Sitios web modernos y responsivos', icono: 'Computer', activo: true },
          { id: 2, nombre: 'E-commerce', descripcion: 'Tiendas online completas y seguras', icono: 'Store', activo: true },
          { id: 3, nombre: 'Marketing Digital', descripcion: 'Estrategias para aumentar tu visibilidad', icono: 'TrendingUp', activo: true },
          { id: 4, nombre: 'Diseño UI/UX', descripcion: 'Experiencias de usuario excepcionales', icono: 'Palette', activo: true }
        ]);
        
        setTestimonios([
          { id: 1, nombre: "Juan Pérez", cargo: "CEO, Empresa X", comentario: "Excelente servicio, muy profesionales y atentos a nuestras necesidades.", calificacion: 5, activo: true },
          { id: 2, nombre: "María González", cargo: "Directora de Marketing", comentario: "Increíble transformación digital para nuestra empresa. ¡Altamente recomendados!", calificacion: 5, activo: true },
          { id: 3, nombre: "Carlos Rodríguez", cargo: "Gerente General", comentario: "Los resultados superaron nuestras expectativas. Gran equipo de trabajo.", calificacion: 4, activo: true }
        ]);
        
        setGalerias([
          { 
            id: 1, 
            titulo: "Nuestros Proyectos", 
            descripcion: "Algunos de nuestros trabajos más destacados", 
            imagenes: [
              { id: 1, url: "", titulo: "Proyecto 1", descripcion: "Descripción del proyecto 1" },
              { id: 2, url: "", titulo: "Proyecto 2", descripcion: "Descripción del proyecto 2" },
              { id: 3, url: "", titulo: "Proyecto 3", descripcion: "Descripción del proyecto 3" }
            ], 
            activo: true 
          }
        ]);
        
        setVideos([
          { id: 1, titulo: "Video Corporativo", url: "", descripcion: "Conoce más sobre nosotros", tipo: "youtube", activo: true }
        ]);
      }
      
      setError("");
      setHasRecoveredData(false);
    }
  }, [open, paginaData, cliente]);

  // ========== HANDLERS ==========
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPagina(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (name) => (event) => {
    setPagina(prev => ({
      ...prev,
      [name]: event.target.checked
    }));
  };

  // Función para cambiar el orden de los banners
  const handleOrdenBannersChange = (nuevoOrden) => {
    setPagina(prev => ({
      ...prev,
      ordenBanners: nuevoOrden.join(",")
    }));
  };

  // Mover banner arriba en el orden
  const handleMoverBannerArriba = (index) => {
    if (index === 0) return;
    const ordenActual = pagina.ordenBanners.split(",");
    const temp = ordenActual[index];
    ordenActual[index] = ordenActual[index - 1];
    ordenActual[index - 1] = temp;
    handleOrdenBannersChange(ordenActual);
  };

  // Mover banner abajo en el orden
  const handleMoverBannerAbajo = (index) => {
    const ordenActual = pagina.ordenBanners.split(",");
    if (index === ordenActual.length - 1) return;
    const temp = ordenActual[index];
    ordenActual[index] = ordenActual[index + 1];
    ordenActual[index + 1] = temp;
    handleOrdenBannersChange(ordenActual);
  };

  // Servicios
  const handleServicioToggle = (id) => {
    setServicios(prev => prev.map(servicio => 
      servicio.id === id ? { ...servicio, activo: !servicio.activo } : servicio
    ));
  };

  const handleAgregarServicio = () => {
    const nuevoId = servicios.length > 0 ? Math.max(...servicios.map(s => s.id)) + 1 : 1;
    const nuevoServicio = {
      id: nuevoId,
      nombre: 'Nuevo Servicio',
      descripcion: 'Descripción del servicio',
      icono: 'Settings',
      activo: true
    };
    setServicios([...servicios, nuevoServicio]);
  };

  const handleEliminarServicio = (id) => {
    if (servicios.length <= 1) {
      setError("Debe haber al menos un servicio");
      return;
    }
    setServicios(prev => prev.filter(servicio => servicio.id !== id));
  };

  const handleServicioChange = (id, campo, valor) => {
    setServicios(prev => prev.map(servicio => 
      servicio.id === id ? { ...servicio, [campo]: valor } : servicio
    ));
  };

  // Testimonios
  const handleTestimonioToggle = (id) => {
    setTestimonios(prev => prev.map(testimonio => 
      testimonio.id === id ? { ...testimonio, activo: !testimonio.activo } : testimonio
    ));
  };

  const handleAgregarTestimonio = () => {
    const nuevoId = testimonios.length > 0 ? Math.max(...testimonios.map(t => t.id)) + 1 : 1;
    const nuevoTestimonio = {
      id: nuevoId,
      nombre: 'Nuevo Cliente',
      cargo: 'Cargo del cliente',
      comentario: 'Comentario del testimonio',
      calificacion: 5,
      activo: true
    };
    setTestimonios([...testimonios, nuevoTestimonio]);
  };

  const handleEliminarTestimonio = (id) => {
    if (testimonios.length <= 1) {
      setError("Debe haber al menos un testimonio");
      return;
    }
    setTestimonios(prev => prev.filter(testimonio => testimonio.id !== id));
  };

  const handleTestimonioChange = (id, campo, valor) => {
    setTestimonios(prev => prev.map(testimonio => 
      testimonio.id === id ? { ...testimonio, [campo]: valor } : testimonio
    ));
  };

  // Galerías
  const handleGalleryToggle = (id) => {
    setGalerias(prev => prev.map(galeria => 
      galeria.id === id ? { ...galeria, activo: !galeria.activo } : galeria
    ));
  };

  const handleAgregarGaleria = () => {
    const nuevoId = galerias.length > 0 ? Math.max(...galerias.map(g => g.id)) + 1 : 1;
    const nuevaGaleria = {
      id: nuevoId,
      titulo: 'Nueva Galería',
      descripcion: 'Descripción de la galería',
      imagenes: [],
      activo: true
    };
    setGalerias([...galerias, nuevaGaleria]);
  };

  const handleEliminarGaleria = (id) => {
    setGalerias(prev => prev.filter(galeria => galeria.id !== id));
  };

  const handleGaleriaChange = (id, campo, valor) => {
    setGalerias(prev => prev.map(galeria => 
      galeria.id === id ? { ...galeria, [campo]: valor } : galeria
    ));
  };

  const handleAgregarImagenAGaleria = (galeriaId) => {
    const galeria = galerias.find(g => g.id === galeriaId);
    if (!galeria) return;
    
    const nuevoIdImagen = galeria.imagenes.length > 0 ? Math.max(...galeria.imagenes.map(i => i.id)) + 1 : 1;
    const nuevaImagen = {
      id: nuevoIdImagen,
      url: "",
      titulo: "Nueva Imagen",
      descripcion: "Descripción de la imagen"
    };
    
    setGalerias(prev => prev.map(galeria => 
      galeria.id === galeriaId 
        ? { ...galeria, imagenes: [...galeria.imagenes, nuevaImagen] }
        : galeria
    ));
  };

  const handleEliminarImagenDeGaleria = (galeriaId, imagenId) => {
    setGalerias(prev => prev.map(galeria => 
      galeria.id === galeriaId 
        ? { ...galeria, imagenes: galeria.imagenes.filter(img => img.id !== imagenId) }
        : galeria
    ));
  };

  const handleImagenChange = (galeriaId, imagenId, campo, valor) => {
    setGalerias(prev => prev.map(galeria => 
      galeria.id === galeriaId 
        ? { 
            ...galeria, 
            imagenes: galeria.imagenes.map(img => 
              img.id === imagenId ? { ...img, [campo]: valor } : img
            )
          }
        : galeria
    ));
  };

  // Subir imagen para galería
  const handleSubirImagenParaGaleria = async (galeriaId, imagenId, file) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    const key = `${galeriaId}-${imagenId}`;
    setUploadingImages(prev => ({ ...prev, [key]: true }));
    setError("");

    const formData = new FormData();
    formData.append('archivo', file);

    try {
      const response = await fetch(`${API_BASE_URL}/Archivos/subir/galeria`, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Error al subir imagen');
      }

      let result = {};
      if (responseText && responseText.trim() !== '') {
        result = JSON.parse(responseText);
      }

      setGalerias(prev => prev.map(galeria => 
        galeria.id === galeriaId 
          ? { 
              ...galeria, 
              imagenes: galeria.imagenes.map(img => 
                img.id === imagenId ? { ...img, url: result.url || "" } : img
              )
            }
          : galeria
      ));
      
      setSuccessMessage('✅ Imagen subida correctamente');
      
    } catch (err) {
      console.error('❌ Error subiendo imagen para galería:', err);
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploadingImages(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSeleccionarImagenParaGaleria = (galeriaId, imagenId, e) => {
    const file = e.target.files[0];
    if (file) {
      handleSubirImagenParaGaleria(galeriaId, imagenId, file);
    }
    e.target.value = null;
  };

  const getImageInputRef = (galeriaId, imagenId) => {
    const key = `${galeriaId}-${imagenId}`;
    if (!imageInputRefs.current[key]) {
      imageInputRefs.current[key] = React.createRef();
    }
    return imageInputRefs.current[key];
  };

  // Videos
  const handleVideoToggle = (id) => {
    setVideos(prev => prev.map(video => 
      video.id === id ? { ...video, activo: !video.activo } : video
    ));
  };

  const handleAgregarVideo = () => {
    const nuevoId = videos.length > 0 ? Math.max(...videos.map(v => v.id)) + 1 : 1;
    const nuevoVideo = {
      id: nuevoId,
      titulo: 'Nuevo Video',
      url: '',
      descripcion: 'Descripción del video',
      tipo: 'youtube',
      activo: true
    };
    setVideos([...videos, nuevoVideo]);
  };

  const handleEliminarVideo = (id) => {
    if (videos.length <= 1) {
      setError("Debe haber al menos un video");
      return;
    }
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  const handleVideoChange = (id, campo, valor) => {
    setVideos(prev => prev.map(video => 
      video.id === id ? { ...video, [campo]: valor } : video
    ));
  };

  // Subir archivos
  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/x-icon'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPG, PNG, GIF, WebP, ICO)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', file);

    try {
      // Establecer estado de carga según el tipo
      switch(type) {
        case 'logo':
          setUploadingLogo(true);
          break;
        case 'banner':
          setUploadingBanner(true);
          break;
        case 'banner2':
          setUploadingBanner2(true);
          break;
        case 'banner3':
          setUploadingBanner3(true);
          break;
      }
      
      const endpoint = type === 'logo' ? 'logo' : type === 'banner' ? 'banner' : 'general';
      const response = await fetch(`${API_BASE_URL}/Archivos/subir/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Error al subir archivo');
      }

      let result = {};
      if (responseText && responseText.trim() !== '') {
        result = JSON.parse(responseText);
      }

      // Actualizar el campo correspondiente
      const fieldName = type === 'logo' ? 'logoUrl' : 
                       type === 'banner' ? 'bannerUrl' :
                       type === 'banner2' ? 'banner2Url' :
                       type === 'banner3' ? 'banner3Url' :
                       'faviconUrl';
      
      setPagina(prev => ({
        ...prev,
        [fieldName]: result.url || ""
      }));
      
      // Actualizar estado del banner activo
      if (type === 'banner' || type === 'banner2' || type === 'banner3') {
        const index = type === 'banner' ? 0 : type === 'banner2' ? 1 : 2;
        const newBannerActivos = [...bannerActivos];
        newBannerActivos[index] = true;
        setBannerActivos(newBannerActivos);
      }
      
      setSuccessMessage(`✅ ${type === 'logo' ? 'Logo' : type === 'banner' ? 'Banner 1' : type === 'banner2' ? 'Banner 2' : type === 'banner3' ? 'Banner 3' : 'Favicon'} subido correctamente`);
      setError("");
      
    } catch (err) {
      console.error('❌ Error subiendo archivo:', err);
      setError(err.message);
    } finally {
      // Limpiar estado de carga
      switch(type) {
        case 'logo':
          setUploadingLogo(false);
          break;
        case 'banner':
          setUploadingBanner(false);
          break;
        case 'banner2':
          setUploadingBanner2(false);
          break;
        case 'banner3':
          setUploadingBanner3(false);
          break;
      }
    }
  };

  // Handlers para seleccionar archivos
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, 'logo');
    e.target.value = null;
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, 'banner');
    e.target.value = null;
  };

  const handleBanner2Select = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, 'banner2');
    e.target.value = null;
  };

  const handleBanner3Select = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, 'banner3');
    e.target.value = null;
  };

  const handleFaviconSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, 'favicon');
    e.target.value = null;
  };

  // Eliminar banner
  const handleEliminarBanner = (tipo) => {
    const fieldName = tipo === 'banner' ? 'bannerUrl' : 
                     tipo === 'banner2' ? 'banner2Url' : 
                     'banner3Url';
    
    const index = tipo === 'banner' ? 0 : tipo === 'banner2' ? 1 : 2;
    const newBannerActivos = [...bannerActivos];
    newBannerActivos[index] = false;
    setBannerActivos(newBannerActivos);
    
    setPagina(prev => ({
      ...prev,
      [fieldName]: ""
    }));
    
    setSuccessMessage(`✅ Banner ${tipo === 'banner' ? '1' : tipo === 'banner2' ? '2' : '3'} eliminado`);
  };

  // ========== FUNCIONES DE PREVIEW Y GUARDADO ==========
  const handlePreview = () => {
    console.log('👁️ Preview solicitado');
    
    if (cliente?.id) {
      const datosPreview = {
        ...pagina,
        serviciosPersonalizados: servicios.filter(s => s.activo),
        testimoniosPersonalizados: testimonios.filter(t => t.activo),
        galeriasImagenes: galerias.filter(g => g.activo),
        videosEmbebidos: videos.filter(v => v.activo)
      };
      
      // Guardar en localStorage para recuperación
      const timestamp = new Date().getTime();
      const previewKey = `preview_${cliente.id}_${timestamp}`;
      localStorage.setItem(previewKey, JSON.stringify(datosPreview));
      console.log('💾 Datos del preview guardados en:', previewKey);
    }
    
    const datosParaPreview = {
      ...pagina,
      serviciosPersonalizados: servicios.filter(s => s.activo),
      testimoniosPersonalizados: testimonios.filter(t => t.activo),
      galeriasImagenes: galerias.filter(g => g.activo),
      videosEmbebidos: videos.filter(v => v.activo)
    };
    
    const encodedData = btoa(JSON.stringify(datosParaPreview));
    const baseUrl = window.location.origin;
    const previewUrl = `${baseUrl}/preview/${cliente?.id || 'demo'}?data=${encodedData}`;
    
    console.log('🔗 URL del preview:', previewUrl);
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePublicPage = () => {
    if (cliente && pagina.estado === "activo") {
      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}/pagina/${cliente.id}`;
      window.open(publicUrl, '_blank', 'noopener,noreferrer');
    } else {
      setError("La página debe estar activa para ver la versión pública");
    }
  };

  const handleSubmit = async () => {
    if (!pagina.clienteId) {
      setError("El ID del cliente es requerido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Preparar datos según los DTOs del backend
      const datosCompletos = {
        clienteId: pagina.clienteId,
        encabezado: pagina.encabezado,
        subtitulo: pagina.subtitulo,
        descripcionCorta: pagina.descripcionCorta,
        cuerpo: pagina.cuerpo,
        telefono: pagina.telefono,
        email: pagina.email,
        direccion: pagina.direccion,
        horarioAtencion: pagina.horarioAtencion,
        colorFondo: pagina.colorFondo,
        colorTexto: pagina.colorTexto,
        colorPrimario: pagina.colorPrimario,
        colorSecundario: pagina.colorSecundario,
        colorAcento: pagina.colorAcento,
        tema: pagina.tema,
        logoUrl: pagina.logoUrl,
        bannerUrl: pagina.bannerUrl,
        banner2Url: pagina.banner2Url, // ← INCLUIR BANNER 2
        banner3Url: pagina.banner3Url, // ← INCLUIR BANNER 3
        ordenBanners: pagina.ordenBanners, // ← INCLUIR ORDEN
        faviconUrl: pagina.faviconUrl,
        mostrarTestimonios: pagina.mostrarTestimonios,
        mostrarServicios: pagina.mostrarServicios,
        mostrarEquipo: pagina.mostrarEquipo,
        mostrarBlog: pagina.mostrarBlog,
        mostrarContacto: pagina.mostrarContacto,
        mostrarMapa: pagina.mostrarMapa,
        mostrarAnimaciones: pagina.mostrarAnimaciones,
        mostrarGalerias: pagina.mostrarGalerias,
        mostrarVideos: pagina.mostrarVideos,
        facebookUrl: pagina.facebookUrl,
        instagramUrl: pagina.instagramUrl,
        twitterUrl: pagina.twitterUrl,
        linkedinUrl: pagina.linkedinUrl,
        youtubeUrl: pagina.youtubeUrl,
        whatsappUrl: pagina.whatsappUrl,
        metaTitulo: pagina.metaTitulo,
        metaDescripcion: pagina.metaDescripcion,
        metaKeywords: pagina.metaKeywords,
        codigoAnalytics: pagina.codigoAnalytics,
        codigoHeader: pagina.codigoHeader,
        codigoFooter: pagina.codigoFooter,
        estado: pagina.estado,
        esResponsive: pagina.esResponsive,
        velocidadCarga: pagina.velocidadCarga,
        
        // Elementos personalizados - mapear correctamente
        serviciosPersonalizados: servicios.map(s => ({
          id: s.id,
          nombre: s.nombre,
          descripcion: s.descripcion,
          icono: s.icono,
          orden: s.id,
          activo: s.activo
        })),
        
        testimoniosPersonalizados: testimonios.map(t => ({
          id: t.id,
          nombre: t.nombre,
          cargo: t.cargo,
          comentario: t.comentario,
          calificacion: t.calificacion,
          fotoUrl: "",
          activo: t.activo
        })),
        
        galeriasImagenes: galerias.map(g => ({
          id: g.id,
          titulo: g.titulo,
          descripcion: g.descripcion,
          orden: g.id,
          activo: g.activo,
          imagenes: g.imagenes.map(img => ({
            id: img.id,
            url: img.url,
            titulo: img.titulo,
            descripcion: img.descripcion,
            orden: img.id
          }))
        })),
        
        videosEmbebidos: videos.map(v => ({
          id: v.id,
          titulo: v.titulo,
          url: v.url,
          descripcion: v.descripcion,
          tipo: v.tipo,
          activo: v.activo
        }))
      };

      // Si estamos editando, agregar el ID
      if (paginaData && paginaData.id) {
        datosCompletos.id = paginaData.id;
      }

      const url = paginaData && paginaData.id 
        ? `${API_BASE_URL}/ClientePaginas/${paginaData.id}`
        : `${API_BASE_URL}/ClientePaginas`;

      const method = paginaData && paginaData.id ? "PUT" : "POST";

      console.log('📤 Enviando datos a:', url, datosCompletos);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosCompletos)
      });

      const responseText = await res.text();
      console.log('📥 Respuesta del servidor:', responseText);

      if (!res.ok) {
        throw new Error(responseText || 'Error al guardar');
      }

      const result = JSON.parse(responseText);
      console.log('✅ Página guardada exitosamente:', result);
      
      setSuccessMessage(result.message || '✅ Página guardada correctamente');
      onSave();
      
      // Limpiar datos del preview después de guardar
      if (cliente?.id) {
        const previewKeys = Object.keys(localStorage).filter(key => 
          key.includes(`preview_${cliente.id}`) || 
          key.includes(`pagina_edit_${cliente.id}`) ||
          key.includes(`current_edit_${cliente.id}`) ||
          key.includes(`from_preview_${cliente.id}`)
        );
        previewKeys.forEach(key => localStorage.removeItem(key));
        console.log('🧹 Datos del preview limpiados después de guardar');
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || "Error al guardar la página");
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar datos del preview
  const handleLimpiarDatosPreview = () => {
    if (cliente?.id) {
      const previewKeys = Object.keys(localStorage).filter(key => 
        key.includes(`preview_${cliente.id}`) || 
        key.includes(`pagina_edit_${cliente.id}`) ||
        key.includes(`current_edit_${cliente.id}`) ||
        key.includes(`from_preview_${cliente.id}`)
      );
      previewKeys.forEach(key => localStorage.removeItem(key));
      
      setSuccessMessage('🧹 Datos del preview limpiados');
      setHasRecoveredData(false);
      
      // Recargar datos por defecto
      if (cliente) {
        const nuevaPagina = {
          clienteId: cliente.id,
          encabezado: `Bienvenido a ${cliente.empresa || cliente.nombre}`,
          subtitulo: "Tu éxito es nuestro compromiso",
          descripcionCorta: cliente.empresa ? `Somos ${cliente.empresa}, especializados en brindar soluciones innovadoras y de calidad.` : "",
          cuerpo: `## Sobre Nosotros\n\nSomos ${cliente.empresa || cliente.nombre}, una empresa comprometida con la excelencia y la satisfacción de nuestros clientes.\n\n## Nuestros Servicios\n\n- Servicio 1\n- Servicio 2\n- Servicio 3`,
          telefono: cliente.telefono || "",
          email: cliente.email || "",
          direccion: "",
          horarioAtencion: "",
          colorFondo: "#ffffff",
          colorTexto: "#333333",
          colorPrimario: "#667eea",
          colorSecundario: "#764ba2",
          colorAcento: "#4caf50",
          tema: "claro",
          logoUrl: "",
          bannerUrl: "",
          banner2Url: "",
          banner3Url: "",
          ordenBanners: "1,2,3",
          faviconUrl: "",
          mostrarTestimonios: true,
          mostrarServicios: true,
          mostrarEquipo: false,
          mostrarBlog: false,
          mostrarContacto: false,
          mostrarMapa: false,
          mostrarAnimaciones: true,
          mostrarGalerias: true,
          mostrarVideos: true,
          facebookUrl: "",
          instagramUrl: "",
          twitterUrl: "",
          linkedinUrl: "",
          youtubeUrl: "",
          whatsappUrl: "",
          metaTitulo: `${cliente.empresa || cliente.nombre} - Página Oficial`,
          metaDescripcion: `Página oficial de ${cliente.empresa || cliente.nombre}. Descubre nuestros servicios y contáctanos.`,
          metaKeywords: "",
          codigoAnalytics: "",
          codigoHeader: "",
          codigoFooter: "",
          estado: "activo",
          esResponsive: true,
          velocidadCarga: "normal"
        };
        setPagina(nuevaPagina);
        
        setBannerActivos([true, true, true]);
        
        setServicios([
          { id: 1, nombre: 'Desarrollo Web', descripcion: 'Sitios web modernos y responsivos', icono: 'Computer', activo: true },
          { id: 2, nombre: 'E-commerce', descripcion: 'Tiendas online completas y seguras', icono: 'Store', activo: true },
          { id: 3, nombre: 'Marketing Digital', descripcion: 'Estrategias para aumentar tu visibilidad', icono: 'TrendingUp', activo: true },
          { id: 4, nombre: 'Diseño UI/UX', descripcion: 'Experiencias de usuario excepcionales', icono: 'Palette', activo: true }
        ]);
        
        setTestimonios([
          { id: 1, nombre: "Juan Pérez", cargo: "CEO, Empresa X", comentario: "Excelente servicio, muy profesionales y atentos a nuestras necesidades.", calificacion: 5, activo: true },
          { id: 2, nombre: "María González", cargo: "Directora de Marketing", comentario: "Increíble transformación digital para nuestra empresa. ¡Altamente recomendados!", calificacion: 5, activo: true },
          { id: 3, nombre: "Carlos Rodríguez", cargo: "Gerente General", comentario: "Los resultados superaron nuestras expectativas. Gran equipo de trabajo.", calificacion: 4, activo: true }
        ]);
        
        setGalerias([
          { 
            id: 1, 
            titulo: "Nuestros Proyectos", 
            descripcion: "Algunos de nuestros trabajos más destacados", 
            imagenes: [
              { id: 1, url: "", titulo: "Proyecto 1", descripcion: "Descripción del proyecto 1" },
              { id: 2, url: "", titulo: "Proyecto 2", descripcion: "Descripción del proyecto 2" },
              { id: 3, url: "", titulo: "Proyecto 3", descripcion: "Descripción del proyecto 3" }
            ], 
            activo: true 
          }
        ]);
        
        setVideos([
          { id: 1, titulo: "Video Corporativo", url: "", descripcion: "Conoce más sobre nosotros", tipo: "youtube", activo: true }
        ]);
      }
    }
  };

  // Cerrar mensajes
  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

  // ========== COMPONENTE DE CONFIGURACIÓN DE BANNERS ==========
  const renderBannerConfig = () => {
    const ordenActual = pagina.ordenBanners.split(",");
    
    return (
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f0f7ff', border: '1px solid #2196f3' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ViewCarousel sx={{ color: '#2196f3' }} />
            <Typography variant="h6" sx={{ color: '#1565c0' }}>
              Configuración de Banners Rotativos
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Los 3 banners rotarán automáticamente. Puedes cambiar el orden de rotación arrastrando los números.
          </Alert>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shuffle sx={{ fontSize: 20 }} /> Orden de Rotación
            </Typography>
            
            <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
              <Grid container spacing={2} alignItems="center">
                {ordenActual.map((bannerNum, index) => (
                  <React.Fragment key={bannerNum}>
                    <Grid item xs={12} sm={4}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          bgcolor: '#e3f2fd',
                          border: '2px solid #bbdefb',
                          borderRadius: 2,
                          position: 'relative'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={`Banner ${bannerNum}`} 
                            color="primary" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Tooltip title="Ver banner">
                            <IconButton size="small" onClick={() => {
                              const url = bannerNum === '1' ? pagina.bannerUrl : 
                                        bannerNum === '2' ? pagina.banner2Url : 
                                        pagina.banner3Url;
                              if (url) window.open(url, '_blank');
                            }}>
                              <Preview fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          Posición {index + 1} en el carrusel
                        </Typography>
                        
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Mover arriba">
                            <span>
                              <IconButton 
                                size="small" 
                                onClick={() => handleMoverBannerArriba(index)}
                                disabled={index === 0}
                              >
                                <ExpandMore sx={{ transform: 'rotate(180deg)' }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          
                          <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                            {index + 1}
                          </Typography>
                          
                          <Tooltip title="Mover abajo">
                            <span>
                              <IconButton 
                                size="small" 
                                onClick={() => handleMoverBannerAbajo(index)}
                                disabled={index === ordenActual.length - 1}
                              >
                                <ExpandMore />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </Paper>
                    </Grid>
                    
                    {index < ordenActual.length - 1 && (
                      <Grid item xs={12} sm="auto" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="h6" color="primary" sx={{ textAlign: 'center' }}>
                          →
                        </Typography>
                      </Grid>
                    )}
                  </React.Fragment>
                ))}
              </Grid>
              
              <TextField
                fullWidth
                label="Orden personalizado"
                value={pagina.ordenBanners}
                onChange={handleChange}
                name="ordenBanners"
                size="small"
                sx={{ mt: 2 }}
                helperText="Escribe el orden separado por comas (ej: 2,1,3 para que el Banner 2 aparezca primero)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Shuffle />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {ordenActual.length} banners configurados • Orden actual: {pagina.ordenBanners}
          </Typography>
        </Paper>
      </Box>
    );
  };

  // ========== RENDERIZADO DE TABS ==========
  const renderTabContent = () => {
    switch(activeTab) {
      case 0: return renderBasicoTab();
      case 1: return renderDisenoTab();
      case 2: return renderContenidoTab();
      case 3: return renderSeccionesTab();
      case 4: return renderTestimoniosTab();
      case 5: return renderGaleriasTab();
      case 6: return renderVideosTab();
      case 7: return renderRedesTab();
      default: return renderBasicoTab();
    }
  };

  const renderBasicoTab = () => (
    <Box>
      {/* Banner de datos recuperados */}
      {hasRecoveredData && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleLimpiarDatosPreview}
              startIcon={<Restore />}
            >
              Limpiar
            </Button>
          }
        >
          <strong>✅ Datos del preview recuperados</strong>
          <Typography variant="body2">
            Tus cambios del preview han sido cargados automáticamente. 
            Si prefieres empezar desde cero, haz clic en "Limpiar".
          </Typography>
        </Alert>
      )}

      {/* Información del cliente */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings /> Información del Cliente
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2">
              <strong>Nombre:</strong> {cliente?.nombre} {cliente?.apellido}
            </Typography>
            <Typography variant="body2">
              <strong>Empresa:</strong> {cliente?.empresa || 'No especificada'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2">
              <strong>Teléfono:</strong> {cliente?.telefono || 'No especificado'}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {cliente?.email || 'No especificado'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* CONFIGURACIÓN DE BANNERS ROTATIVOS */}
      {renderBannerConfig()}

      {/* Logos y banners - AHORA CON 3 BANNERS */}
      <Grid container spacing={3}>
        {/* Logo */}
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsertPhoto /> Logo
            </Typography>
            <input type="file" ref={logoInputRef} onChange={handleLogoSelect} accept="image/*" style={{ display: 'none' }} />
            {pagina.logoUrl ? (
              <Box>
                <Card sx={{ mb: 1 }}>
                  <CardMedia component="img" height="120" image={pagina.logoUrl} alt="Logo" sx={{ objectFit: 'contain', p: 1 }} />
                </Card>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                    {uploadingLogo ? <CircularProgress size={16} /> : 'Cambiar'}
                  </Button>
                  <Button size="small" color="error" onClick={() => setPagina(prev => ({ ...prev, logoUrl: "" }))}>
                    Eliminar
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 3, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => logoInputRef.current?.click()}>
                {uploadingLogo ? <CircularProgress /> : <>
                  <AddPhotoAlternate sx={{ fontSize: 36, color: '#999', mb: 1 }} />
                  <Typography variant="body2">Subir Logo</Typography>
                </>}
              </Box>
            )}
            <TextField fullWidth label="URL del Logo" name="logoUrl" value={pagina.logoUrl} onChange={handleChange} size="small" sx={{ mt: 1 }} />
          </Box>
        </Grid>

        {/* Banner 1 */}
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon /> Banner 1
            </Typography>
            <input type="file" ref={bannerInputRef} onChange={handleBannerSelect} accept="image/*" style={{ display: 'none' }} />
            {pagina.bannerUrl ? (
              <Box>
                <Card sx={{ mb: 1 }}>
                  <CardMedia component="img" height="120" image={pagina.bannerUrl} alt="Banner 1" sx={{ objectFit: 'cover' }} />
                </Card>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}>
                    {uploadingBanner ? <CircularProgress size={16} /> : 'Cambiar'}
                  </Button>
                  <Button size="small" color="error" onClick={() => handleEliminarBanner('banner')}>
                    Eliminar
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 3, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => bannerInputRef.current?.click()}>
                {uploadingBanner ? <CircularProgress /> : <>
                  <AddPhotoAlternate sx={{ fontSize: 36, color: '#999', mb: 1 }} />
                  <Typography variant="body2">Subir Banner 1</Typography>
                </>}
              </Box>
            )}
            <TextField fullWidth label="URL del Banner 1" name="bannerUrl" value={pagina.bannerUrl} onChange={handleChange} size="small" sx={{ mt: 1 }} />
          </Box>
        </Grid>

        {/* Banner 2 - NUEVO */}
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon /> Banner 2
            </Typography>
            <input type="file" ref={banner2InputRef} onChange={handleBanner2Select} accept="image/*" style={{ display: 'none' }} />
            {pagina.banner2Url ? (
              <Box>
                <Card sx={{ mb: 1 }}>
                  <CardMedia component="img" height="120" image={pagina.banner2Url} alt="Banner 2" sx={{ objectFit: 'cover' }} />
                </Card>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => banner2InputRef.current?.click()} disabled={uploadingBanner2}>
                    {uploadingBanner2 ? <CircularProgress size={16} /> : 'Cambiar'}
                  </Button>
                  <Button size="small" color="error" onClick={() => handleEliminarBanner('banner2')}>
                    Eliminar
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 3, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => banner2InputRef.current?.click()}>
                {uploadingBanner2 ? <CircularProgress /> : <>
                  <AddPhotoAlternate sx={{ fontSize: 36, color: '#999', mb: 1 }} />
                  <Typography variant="body2">Subir Banner 2</Typography>
                </>}
              </Box>
            )}
            <TextField fullWidth label="URL del Banner 2" name="banner2Url" value={pagina.banner2Url} onChange={handleChange} size="small" sx={{ mt: 1 }} />
          </Box>
        </Grid>

        {/* Banner 3 - NUEVO */}
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon /> Banner 3
            </Typography>
            <input type="file" ref={banner3InputRef} onChange={handleBanner3Select} accept="image/*" style={{ display: 'none' }} />
            {pagina.banner3Url ? (
              <Box>
                <Card sx={{ mb: 1 }}>
                  <CardMedia component="img" height="120" image={pagina.banner3Url} alt="Banner 3" sx={{ objectFit: 'cover' }} />
                </Card>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => banner3InputRef.current?.click()} disabled={uploadingBanner3}>
                    {uploadingBanner3 ? <CircularProgress size={16} /> : 'Cambiar'}
                  </Button>
                  <Button size="small" color="error" onClick={() => handleEliminarBanner('banner3')}>
                    Eliminar
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 3, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => banner3InputRef.current?.click()}>
                {uploadingBanner3 ? <CircularProgress /> : <>
                  <AddPhotoAlternate sx={{ fontSize: 36, color: '#999', mb: 1 }} />
                  <Typography variant="body2">Subir Banner 3</Typography>
                </>}
              </Box>
            )}
            <TextField fullWidth label="URL del Banner 3" name="banner3Url" value={pagina.banner3Url} onChange={handleChange} size="small" sx={{ mt: 1 }} />
          </Box>
        </Grid>

        {/* Favicon */}
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Language /> Favicon
            </Typography>
            <input type="file" ref={faviconInputRef} onChange={handleFaviconSelect} accept="image/*,.ico" style={{ display: 'none' }} />
            {pagina.faviconUrl ? (
              <Box>
                <Card sx={{ mb: 1, p: 2, textAlign: 'center' }}>
                  <img src={pagina.faviconUrl} alt="Favicon" style={{ width: 32, height: 32 }} />
                </Card>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => faviconInputRef.current?.click()}>
                    Cambiar
                  </Button>
                  <Button size="small" color="error" onClick={() => setPagina(prev => ({ ...prev, faviconUrl: "" }))}>
                    Eliminar
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 3, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => faviconInputRef.current?.click()}>
                <AddPhotoAlternate sx={{ fontSize: 36, color: '#999', mb: 1 }} />
                <Typography variant="body2">Subir Favicon</Typography>
                <Typography variant="caption" color="text.secondary">(32×32px, formato .ico)</Typography>
              </Box>
            )}
            <TextField fullWidth label="URL del Favicon" name="faviconUrl" value={pagina.faviconUrl} onChange={handleChange} size="small" sx={{ mt: 1 }} />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Información básica */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            required 
            label="Título Principal" 
            name="encabezado" 
            value={pagina.encabezado} 
            onChange={handleChange} 
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Subtítulo" 
            name="subtitulo" 
            value={pagina.subtitulo} 
            onChange={handleChange} 
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Descripción Corta" 
            name="descripcionCorta" 
            value={pagina.descripcionCorta} 
            onChange={handleChange} 
            multiline 
            rows={2} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            fullWidth 
            label="Teléfono" 
            name="telefono" 
            value={pagina.telefono} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} /> }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            fullWidth 
            label="Email" 
            name="email" 
            value={pagina.email} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} /> }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            fullWidth 
            label="Dirección" 
            name="direccion" 
            value={pagina.direccion} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <Settings sx={{ mr: 1, color: 'text.secondary' }} /> }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            fullWidth 
            label="Horario de Atención" 
            name="horarioAtencion" 
            value={pagina.horarioAtencion} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <Settings sx={{ mr: 1, color: 'text.secondary' }} /> }} 
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderDisenoTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Palette /> Personalización de Colores
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Color Principal</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input 
                type="color" 
                value={pagina.colorPrimario} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorPrimario: e.target.value }))} 
                style={{ width: 60, height: 60, borderRadius: 8, border: 'none', cursor: 'pointer' }} 
              />
              <TextField 
                fullWidth 
                value={pagina.colorPrimario} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorPrimario: e.target.value }))} 
              />
            </Box>
            <Chip label="Botones principales, enlaces" size="small" sx={{ mt: 1 }} />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Color de Fondo</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input 
                type="color" 
                value={pagina.colorFondo} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorFondo: e.target.value }))} 
                style={{ width: 60, height: 60, borderRadius: 8, border: 'none', cursor: 'pointer' }} 
              />
              <TextField 
                fullWidth 
                value={pagina.colorFondo} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorFondo: e.target.value }))} 
              />
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Color de Texto</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input 
                type="color" 
                value={pagina.colorTexto} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorTexto: e.target.value }))} 
                style={{ width: 60, height: 60, borderRadius: 8, border: 'none', cursor: 'pointer' }} 
              />
              <TextField 
                fullWidth 
                value={pagina.colorTexto} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorTexto: e.target.value }))} 
              />
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Color Secundario</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input 
                type="color" 
                value={pagina.colorSecundario} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorSecundario: e.target.value }))} 
                style={{ width: 60, height: 60, borderRadius: 8, border: 'none', cursor: 'pointer' }} 
              />
              <TextField 
                fullWidth 
                value={pagina.colorSecundario} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorSecundario: e.target.value }))} 
              />
            </Box>
            <Chip label="Botones secundarios, destacados" size="small" sx={{ mt: 1 }} />
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Tema */}
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Style /> Tema de la Página
      </Typography>
      
      <RadioGroup row name="tema" value={pagina.tema} onChange={handleChange}>
        <FormControlLabel value="claro" control={<Radio />} label="Tema Claro" />
        <FormControlLabel value="oscuro" control={<Radio />} label="Tema Oscuro" />
        <FormControlLabel value="automatico" control={<Radio />} label="Automático" />
      </RadioGroup>
      
      {/* Configuraciones adicionales */}
      <Box sx={{ mt: 3 }}>
        <FormGroup>
          <FormControlLabel 
            control={<Switch checked={pagina.esResponsive} onChange={handleSwitchChange('esResponsive')} />}
            label="Diseño Responsive (adaptable a móviles)" 
          />
          
          <FormControlLabel 
            control={<Switch checked={pagina.mostrarAnimaciones} onChange={handleSwitchChange('mostrarAnimaciones')} />}
            label="Mostrar Animaciones" 
          />
        </FormGroup>
      </Box>
      
      {/* Previsualización de colores */}
      <Paper sx={{ mt: 3, p: 3, bgcolor: pagina.colorFondo, color: pagina.colorTexto }}>
        <Typography variant="h6" gutterBottom>Previsualización de Colores</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" sx={{ bgcolor: pagina.colorPrimario }}>Botón Primario</Button>
          <Button variant="contained" sx={{ bgcolor: pagina.colorSecundario }}>Botón Secundario</Button>
          <Button variant="outlined" sx={{ color: pagina.colorTexto, borderColor: pagina.colorPrimario }}>Botón Outline</Button>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Este es un texto de ejemplo con los colores seleccionados. El color de fondo es {pagina.colorFondo} y el color de texto es {pagina.colorTexto}.
        </Typography>
      </Paper>
    </Box>
  );

  const renderContenidoTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Description /> Contenido Principal
      </Typography>
      
      <TextField 
        fullWidth 
        label="Contenido" 
        name="cuerpo" 
        value={pagina.cuerpo} 
        onChange={handleChange} 
        multiline 
        rows={12} 
        helperText="Usa Markdown para formatear el texto. Ejemplo: ## Título, **negrita**, *cursiva*, - lista" 
      />
      
      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>Guía de Markdown:</Typography>
        <Typography variant="caption" component="div">
          <code># Título Principal</code><br />
          <code>## Subtítulo</code><br />
          <code>**texto en negrita**</code><br />
          <code>*texto en cursiva*</code><br />
          <code>- Elemento de lista</code><br />
          <code>[Texto del enlace](https://ejemplo.com)</code><br />
          <code>![Texto alternativo](url-imagen.jpg)</code>
        </Typography>
      </Box>
    </Box>
  );

  const renderSeccionesTab = () => (
    <Box>
      {/* SECCIÓN PARA CONFIGURAR SERVICIOS PERSONALIZADOS */}
      {pagina.mostrarServicios && (
        <Box sx={{  bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings /> Configurar Servicios Personalizados
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Activa/desactiva y personaliza los servicios que aparecerán en tu página. 
            Los servicios inactivos no se mostrarán en el preview ni en la página pública.
          </Alert>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {servicios.map((servicio) => (
              <Grid item xs={12} key={servicio.id}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={servicio.activo} 
                        onChange={() => handleServicioToggle(servicio.id)}
                        color="primary"
                      />
                    }
                    label=""
                  />
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Nombre del Servicio"
                          value={servicio.nombre}
                          onChange={(e) => handleServicioChange(servicio.id, 'nombre', e.target.value)}
                          sx={{ mb: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Descripción"
                          value={servicio.descripcion}
                          onChange={(e) => handleServicioChange(servicio.id, 'descripcion', e.target.value)}
                          sx={{ mb: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Icono</InputLabel>
                          <Select
                            value={servicio.icono}
                            onChange={(e) => handleServicioChange(servicio.id, 'icono', e.target.value)}
                            label="Icono"
                          >
                            {iconosDisponibles.map((icono) => (
                              <MenuItem key={icono.value} value={icono.value}>
                                {icono.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <IconButton 
                    color="error" 
                    onClick={() => handleEliminarServicio(servicio.id)}
                    size="small"
                    disabled={servicios.length <= 1}
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Button 
            variant="outlined" 
            startIcon={<Add />}
            onClick={handleAgregarServicio}
            sx={{ mb: 2 }}
          >
            Agregar Nuevo Servicio
          </Button>
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Servicios activos: {servicios.filter(s => s.activo).length} de {servicios.length}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderTestimoniosTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Star /> Testimonios Personalizados
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Los testimonios de clientes son una excelente manera de generar confianza. 
        Agrega comentarios reales de tus clientes satisfechos.
      </Alert>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {testimonios.map((testimonio) => (
          <Grid item xs={12} key={testimonio.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={testimonio.activo} 
                      onChange={() => handleTestimonioToggle(testimonio.id)}
                      color="primary"
                    />
                  }
                  label=""
                />
                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                  Testimonio #{testimonio.id}
                </Typography>
                <IconButton 
                  color="error" 
                  onClick={() => handleEliminarTestimonio(testimonio.id)}
                  size="small"
                  disabled={testimonios.length <= 1}
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre del Cliente"
                    value={testimonio.nombre}
                    onChange={(e) => handleTestimonioChange(testimonio.id, 'nombre', e.target.value)}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cargo/Posición"
                    value={testimonio.cargo}
                    onChange={(e) => handleTestimonioChange(testimonio.id, 'cargo', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Calificación</InputLabel>
                    <Select
                      value={testimonio.calificacion}
                      onChange={(e) => handleTestimonioChange(testimonio.id, 'calificacion', e.target.value)}
                      label="Calificación"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} estrella{num > 1 ? 's' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Comentario"
                    value={testimonio.comentario}
                    onChange={(e) => handleTestimonioChange(testimonio.id, 'comentario', e.target.value)}
                    multiline
                    rows={3}
                    placeholder="¿Qué dijo el cliente sobre tu servicio?"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Button 
        variant="outlined" 
        startIcon={<Add />}
        onClick={handleAgregarTestimonio}
        sx={{ mb: 2 }}
      >
        Agregar Nuevo Testimonio
      </Button>
      
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        Testimonios activos: {testimonios.filter(t => t.activo).length} de {testimonios.length}
      </Typography>
    </Box>
  );

  const renderGaleriasTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InsertPhoto /> Galerías de Imágenes
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Crea galerías temáticas para mostrar tus proyectos, productos o equipo de trabajo. 
        Cada imagen puede tener un título y descripción personalizados.
      </Alert>
      
      {galerias.map((galeria) => (
        <Accordion 
          key={galeria.id}
          expanded={expandedGallery === galeria.id}
          onChange={() => setExpandedGallery(expandedGallery === galeria.id ? null : galeria.id)}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={galeria.activo} 
                    onChange={() => handleGalleryToggle(galeria.id)}
                    color="primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                label=""
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">
                  {galeria.titulo || 'Galería sin título'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {galeria.imagenes.length} imagen{galeria.imagenes.length !== 1 ? 'es' : ''}
                </Typography>
              </Box>
              <IconButton 
                color="error" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEliminarGaleria(galeria.id);
                }}
                size="small"
              >
                <Delete />
              </IconButton>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título de la Galería"
                  value={galeria.titulo}
                  onChange={(e) => handleGaleriaChange(galeria.id, 'titulo', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción de la Galería"
                  value={galeria.descripcion}
                  onChange={(e) => handleGaleriaChange(galeria.id, 'descripcion', e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="subtitle2">Imágenes de la Galería</Typography>
                </Divider>
                
                {galeria.imagenes.map((imagen) => {
                  const key = `${galeria.id}-${imagen.id}`;
                  const uploading = uploadingImages[key] || false;
                  const inputRef = getImageInputRef(galeria.id, imagen.id);
                  
                  return (
                    <Paper key={imagen.id} sx={{ p: 2, mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {imagen.url ? (
                              <img 
                                src={imagen.url} 
                                alt={imagen.titulo} 
                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                              />
                            ) : (
                              <Box sx={{ 
                                width: 60, 
                                height: 60, 
                                bgcolor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 4
                              }}>
                                <InsertPhoto sx={{ color: '#999' }} />
                              </Box>
                            )}
                            <input 
                              type="file" 
                              ref={inputRef}
                              onChange={(e) => handleSeleccionarImagenParaGaleria(galeria.id, imagen.id, e)}
                              accept="image/*" 
                              style={{ display: 'none' }} 
                            />
                            <Button 
                              size="small"
                              onClick={() => inputRef.current?.click()}
                              disabled={uploading}
                            >
                              {uploading ? (
                                <CircularProgress size={16} />
                              ) : imagen.url ? (
                                'Cambiar'
                              ) : (
                                'Subir'
                              )}
                            </Button>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Título"
                            value={imagen.titulo}
                            onChange={(e) => handleImagenChange(galeria.id, imagen.id, 'titulo', e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Descripción"
                            value={imagen.descripcion}
                            onChange={(e) => handleImagenChange(galeria.id, imagen.id, 'descripcion', e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={1}>
                          <IconButton 
                            color="error" 
                            onClick={() => handleEliminarImagenDeGaleria(galeria.id, imagen.id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                      
                      <TextField
                        fullWidth
                        size="small"
                        label="URL de la Imagen"
                        value={imagen.url}
                        onChange={(e) => handleImagenChange(galeria.id, imagen.id, 'url', e.target.value)}
                        sx={{ mt: 1 }}
                        helperText="Pega la URL completa de la imagen o sube una nueva"
                        InputProps={{
                          endAdornment: imagen.url ? (
                            <InputAdornment position="end">
                              <CheckCircle color="success" fontSize="small" />
                            </InputAdornment>
                          ) : null
                        }}
                      />
                    </Paper>
                  );
                })}
                
                <Button 
                  variant="outlined" 
                  startIcon={<Add />}
                  onClick={() => handleAgregarImagenAGaleria(galeria.id)}
                  sx={{ mb: 2 }}
                >
                  Agregar Imagen a esta Galería
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      
      <Button 
        variant="outlined" 
        startIcon={<Add />}
        onClick={handleAgregarGaleria}
        sx={{ mt: 2 }}
      >
        Agregar Nueva Galería
      </Button>
      
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
        Galerías activas: {galerias.filter(g => g.activo).length} de {galerias.length}
      </Typography>
    </Box>
  );

  const renderVideosTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VideoLibrary /> Videos Embebidos
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Agrega videos de YouTube, Vimeo o cualquier otra plataforma usando códigos de embebido o enlaces.
      </Alert>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {videos.map((video) => (
          <Grid item xs={12} key={video.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={video.activo} 
                      onChange={() => handleVideoToggle(video.id)}
                      color="primary"
                    />
                  }
                  label=""
                />
                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                  Video #{video.id}
                </Typography>
                <IconButton 
                  color="error" 
                  onClick={() => handleEliminarVideo(video.id)}
                  size="small"
                  disabled={videos.length <= 1}
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Título del Video"
                    value={video.titulo}
                    onChange={(e) => handleVideoChange(video.id, 'titulo', e.target.value)}
                    InputProps={{
                      startAdornment: <Title sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Plataforma</InputLabel>
                    <Select
                      value={video.tipo}
                      onChange={(e) => handleVideoChange(video.id, 'tipo', e.target.value)}
                      label="Plataforma"
                    >
                      <MenuItem value="youtube">YouTube</MenuItem>
                      <MenuItem value="vimeo">Vimeo</MenuItem>
                      <MenuItem value="directo">Enlace Directo</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URL o Código de Embebido"
                    value={video.url}
                    onChange={(e) => handleVideoChange(video.id, 'url', e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Ejemplo: https://www.youtube.com/watch?v=ABCD1234 o código <iframe>"
                    helperText="Pega el enlace del video o el código HTML de embebido"
                    InputProps={{
                      startAdornment: <InsertLink sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={video.descripcion}
                    onChange={(e) => handleVideoChange(video.id, 'descripcion', e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Breve descripción del contenido del video"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Button 
        variant="outlined" 
        startIcon={<Add />}
        onClick={handleAgregarVideo}
        sx={{ mb: 2 }}
      >
        Agregar Nuevo Video
      </Button>
      
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
        Videos activos: {videos.filter(v => v.activo).length} de {videos.length}
      </Typography>
    </Box>
  );

  const renderRedesTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Share /> Redes Sociales
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="WhatsApp" 
            name="whatsappUrl" 
            value={pagina.whatsappUrl} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <WhatsApp sx={{ mr: 1, color: '#25D366' }} /> }} 
            helperText="Ejemplo: https://wa.me/51999999999" 
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Facebook" 
            name="facebookUrl" 
            value={pagina.facebookUrl} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <Facebook sx={{ mr: 1, color: '#1877F2' }} /> }} 
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Instagram" 
            name="instagramUrl" 
            value={pagina.instagramUrl} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <Instagram sx={{ mr: 1, color: '#E4405F' }} /> }} 
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Twitter" 
            name="twitterUrl" 
            value={pagina.twitterUrl} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <Twitter sx={{ mr: 1, color: '#1DA1F2' }} /> }} 
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="LinkedIn" 
            name="linkedinUrl" 
            value={pagina.linkedinUrl} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <LinkedIn sx={{ mr: 1, color: '#0A66C2' }} /> }} 
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="YouTube" 
            name="youtubeUrl" 
            value={pagina.youtubeUrl} 
            onChange={handleChange} 
            InputProps={{ startAdornment: <YouTube sx={{ mr: 1, color: '#FF0000' }} /> }} 
          />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, height: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Language />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {paginaData && paginaData.id ? '✏️ Editar Página Web Pro' : '🌐 Crear Página Web Pro'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {cliente?.nombre} {cliente?.apellido} • {cliente?.empresa || 'Sin empresa'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Tabs de navegación */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          variant="scrollable" 
          scrollButtons="auto"
        >
          <Tab icon={<Dashboard />} label="Básico" />
          <Tab icon={<Palette />} label="Diseño" />
          <Tab icon={<Description />} label="Contenido" />
          <Tab icon={<Widgets />} label="Secciones" />
          <Tab icon={<Star />} label="Testimonios" />
          <Tab icon={<InsertPhoto />} label="Galerías" />
          <Tab icon={<VideoLibrary />} label="Videos" />
          <Tab icon={<Share />} label="Redes" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderTabContent()}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          
          <Button
            variant="outlined"
            onClick={handlePreview}
            disabled={loading || !cliente}
            startIcon={<Preview />}
          >
            Ver Preview
          </Button>
          
          <Button
            variant="outlined"
            onClick={handlePublicPage}
            disabled={!cliente || pagina.estado !== "activo" || loading}
            startIcon={<Language />}
          >
            Ver Pública
          </Button>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !pagina.clienteId}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {loading ? 'Guardando...' : (paginaData && paginaData.id ? 'Actualizar' : 'Crear Página')}
          </Button>
        </Stack>
      </DialogActions>

      {/* Snackbars para mensajes */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}