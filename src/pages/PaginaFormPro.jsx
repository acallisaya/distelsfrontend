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
  Snackbar
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
  Restore
} from "@mui/icons-material";
import { API_BASE_URL } from "../config";


export default function PaginaFormPro({ open, onClose, paginaData, cliente, onSave }) {
  // ESTADO INICIAL COMPLETO
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
    colorFondo: "#ffffff",
    colorTexto: "#333333",
    colorPrimario: "#2196f3",
    colorSecundario: "#ff9800",
    colorAcento: "#4caf50",
    tema: "claro",
    logoUrl: "",
    bannerUrl: "",
    banner2Url: "",
    banner3Url: "",
    faviconUrl: "",
    modalImageUrl: "",
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
    velocidadCarga: "normal"
  });
  
  const [testimonios, setTestimonios] = useState([]);
  const [galerias, setGalerias] = useState([]);
  const [videos, setVideos] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingBanner2, setUploadingBanner2] = useState(false);
  const [uploadingBanner3, setUploadingBanner3] = useState(false);
  const [uploadingModalImage, setUploadingModalImage] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [expandedGallery, setExpandedGallery] = useState(null);
  const [uploadingImages, setUploadingImages] = useState({});
  const [hasRecoveredData, setHasRecoveredData] = useState(false);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const banner2InputRef = useRef(null);
  const banner3InputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const modalImageInputRef = useRef(null);
  const imageInputRefs = useRef({});

  // =================== FUNCIONES DE AUTENTICACIÓN ===================
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // ========== useEffect PARA CARGAR DATOS ==========
  useEffect(() => {
    console.log("🔍 useEffect ejecutándose", { 
      open, 
      clienteId: cliente?.id, 
      paginaDataId: paginaData?.id,
      modalImageUrl: paginaData?.modalImageUrl
    });
    
    if (!open || !cliente?.id) {
      console.log("❌ No abriendo formulario - falta open o cliente.id");
      return;
    }

    setLoading(true);
    console.log("📦 Datos recibidos en props - modalImageUrl:", paginaData?.modalImageUrl);

    // ESTADO INICIAL COMPLETO
    const initialState = {
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
      banner2Url: "",
      banner3Url: "",
      faviconUrl: "",
      modalImageUrl: "",
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
      velocidadCarga: "normal"
    };

    // Resetear todo
    setPagina(initialState);
    setTestimonios([]);
    setGalerias([]);
    setVideos([]);

    // Si hay datos del backend (paginaData), usarlos
    if (paginaData && paginaData.id) {
      console.log("✅ EDITANDO página existente ID:", paginaData.id);

      // Actualizar estado de la página - INCLUYENDO modalImageUrl
      const updatedPagina = {
        ...initialState,
        id: paginaData.id,
        clienteId: paginaData.clienteId || cliente.id,
        encabezado: paginaData.encabezado || "Bienvenido a mi sitio",
        subtitulo: paginaData.subtitulo || "",
        descripcionCorta: paginaData.descripcionCorta || "",
        cuerpo: paginaData.cuerpo || "",
        telefono: paginaData.telefono || "",
        email: paginaData.email || "",
        direccion: paginaData.direccion || "",
        horarioAtencion: paginaData.horarioAtencion || "",
        colorFondo: paginaData.colorFondo || "#ffffff",
        colorTexto: paginaData.colorTexto || "#333333",
        colorPrimario: paginaData.colorPrimario || "#2196f3",
        colorSecundario: paginaData.colorSecundario || "#ff9800",
        colorAcento: paginaData.colorAcento || "#4caf50",
        tema: paginaData.tema || "claro",
        logoUrl: paginaData.logoUrl || "",
        bannerUrl: paginaData.bannerUrl || "",
        banner2Url: paginaData.banner2Url || "",
        banner3Url: paginaData.banner3Url || "",
        faviconUrl: paginaData.faviconUrl || "",
        modalImageUrl: paginaData.modalImageUrl || "",
        mostrarTestimonios: paginaData.mostrarTestimonios !== false,
        mostrarServicios: paginaData.mostrarServicios !== false,
        mostrarEquipo: paginaData.mostrarEquipo || false,
        mostrarBlog: paginaData.mostrarBlog || false,
        mostrarContacto: paginaData.mostrarContacto || false,
        mostrarMapa: paginaData.mostrarMapa || false,
        mostrarAnimaciones: paginaData.mostrarAnimaciones !== false,
        mostrarGalerias: paginaData.mostrarGalerias !== false,
        mostrarVideos: paginaData.mostrarVideos !== false,
        facebookUrl: paginaData.facebookUrl || "",
        instagramUrl: paginaData.instagramUrl || "",
        twitterUrl: paginaData.twitterUrl || "",
        linkedinUrl: paginaData.linkedInUrl || paginaData.linkedinUrl || "",
        youtubeUrl: paginaData.youTubeUrl || paginaData.youtubeUrl || "",
        whatsappUrl: paginaData.whatsAppUrl || paginaData.whatsappUrl || "",
        metaTitulo: paginaData.metaTitulo || "",
        metaDescripcion: paginaData.metaDescripcion || "",
        metaKeywords: paginaData.metaKeywords || "",
        codigoAnalytics: paginaData.codigoAnalytics || "",
        codigoHeader: paginaData.codigoHeader || "",
        codigoFooter: paginaData.codigoFooter || "",
        estado: paginaData.estado || "activo",
        esResponsive: paginaData.esResponsive !== false,
        velocidadCarga: paginaData.velocidadCarga || "normal"
      };

      console.log("🔄 Actualizando estado con modalImageUrl:", updatedPagina.modalImageUrl);
      setPagina(updatedPagina);

      // Actualizar testimonios
      if (paginaData.testimoniosPersonalizados && Array.isArray(paginaData.testimoniosPersonalizados)) {
        setTestimonios(paginaData.testimoniosPersonalizados);
      } else {
        setTestimonios([]);
      }

      // Actualizar galerías
      if (paginaData.galeriasImagenes && Array.isArray(paginaData.galeriasImagenes)) {
        setGalerias(paginaData.galeriasImagenes);
      } else {
        setGalerias([]);
      }

      // Actualizar videos
      if (paginaData.videosEmbebidos && Array.isArray(paginaData.videosEmbebidos)) {
        setVideos(paginaData.videosEmbebidos);
      } else {
        setVideos([]);
      }

      setLoading(false);
      return;
    }

    // Si no hay datos del backend, CREAR NUEVA PÁGINA
    console.log("🆕 CREANDO nueva página para cliente:", cliente.nombre);
    
    const nuevaPagina = {
      ...initialState,
      clienteId: cliente.id,
      encabezado: `Bienvenido a ${cliente.empresa || cliente.nombre}`,
      subtitulo: "Tu éxito es nuestro compromiso",
      descripcionCorta: cliente.empresa ? `Somos ${cliente.empresa}, especializados en brindar soluciones innovadoras y de calidad.` : "",
      cuerpo: `## Sobre Nosotros\n\nSomos ${cliente.empresa || cliente.nombre}, una empresa comprometida con la excelencia y la satisfacción de nuestros clientes.\n\n## Nuestros Servicios\n\n- Servicio 1\n- Servicio 2\n- Servicio 3`,
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      metaTitulo: `${cliente.empresa || cliente.nombre} - Página Oficial`,
      metaDescripcion: `Página oficial de ${cliente.empresa || cliente.nombre}. Descubre nuestros servicios y contáctanos.`,
      colorPrimario: "#667eea",
      colorSecundario: "#764ba2",
      modalImageUrl: ""
    };

    setPagina(nuevaPagina);
    
    // Valores por defecto para nueva página
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

    setLoading(false);
  }, [open, paginaData, cliente]);

  // ========== MANEJADORES DE CAMBIOS ==========
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPagina(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ========== MANEJADORES DE TESTIMONIOS ==========
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
    // ✅ CORREGIDO: Permitir eliminar incluso si queda 1 testimonio
    setTestimonios(prev => prev.filter(testimonio => testimonio.id !== id));
  };

  const handleTestimonioChange = (id, campo, valor) => {
    setTestimonios(prev => prev.map(testimonio => 
      testimonio.id === id ? { ...testimonio, [campo]: valor } : testimonio
    ));
  };

  // ========== MANEJADORES DE GALERÍAS ==========
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
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'ngrok-skip-browser-warning': 'true'
        },
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

  // ========== MANEJADORES DE VIDEOS ==========
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
    // ✅ CORREGIDO: Permitir eliminar incluso si queda 1 video
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  const handleVideoChange = (id, campo, valor) => {
    setVideos(prev => prev.map(video => 
      video.id === id ? { ...video, [campo]: valor } : video
    ));
  };

  // ========== MANEJADORES DE SUBIDA DE ARCHIVOS ==========
  const handleModalImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, 'modalImage');
    e.target.value = null;
  };

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
      if (type === 'modalImage') setUploadingModalImage(true);
      else if (type === 'logo') setUploadingLogo(true);
      else if (type === 'banner') setUploadingBanner(true);
      else if (type === 'banner2') setUploadingBanner2(true);
      else if (type === 'banner3') setUploadingBanner3(true);
      
      const endpoint = type === 'logo' ? 'logo' : 
                      type === 'banner' || type === 'banner2' || type === 'banner3' ? 'banner' : 
                      type === 'modalImage' ? 'modal' : 'general';
      
      const response = await fetch(`${API_BASE_URL}/Archivos/subir/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'ngrok-skip-browser-warning': 'true'
        },
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

      setPagina(prev => {
        let fieldName;
        if (type === 'banner2') fieldName = 'banner2Url';
        else if (type === 'banner3') fieldName = 'banner3Url';
        else if (type === 'modalImage') fieldName = 'modalImageUrl';
        else fieldName = `${type}Url`;
        let urlFinal = result.url || "";
  if (urlFinal.includes('192.168.1.225:9090')) {
    urlFinal = urlFinal.replace(
      'http://192.168.1.225:9090', 
      'https://unalcoholised-della-unconglutinative.ngrok-free.dev'
    );
    console.log(`🌐 URL convertida a ngrok:`, urlFinal);
  }
        return {
          ...prev,
          [fieldName]: urlFinal ||""
        };
      });
      
      const typeNames = {
        'logo': 'Logo',
        'banner': 'Banner 1',
        'banner2': 'Banner 2',
        'banner3': 'Banner 3',
        'modalImage': 'Imagen Modal',
        'favicon': 'Favicon'
      };
      
      setSuccessMessage(`✅ ${typeNames[type] || 'Archivo'} subido correctamente`);
      setError("");
      
    } catch (err) {
      console.error('❌ Error subiendo archivo:', err);
      setError(err.message);
    } finally {
      if (type === 'modalImage') setUploadingModalImage(false);
      else if (type === 'logo') setUploadingLogo(false);
      else if (type === 'banner') setUploadingBanner(false);
      else if (type === 'banner2') setUploadingBanner2(false);
      else if (type === 'banner3') setUploadingBanner3(false);
    }
  };

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

  // ========== MANEJADORES DE PREVIEW Y GUARDADO ==========
  const handlePreview = () => {
    console.log('👁️ Preview solicitado');
    
    if (cliente?.id) {
      const datosPreview = {
        ...pagina,
        testimoniosPersonalizados: testimonios.filter(t => t.activo),
        galeriasImagenes: galerias.filter(g => g.activo),
        videosEmbebidos: videos.filter(v => v.activo)
      };
      
      const timestamp = new Date().getTime();
      const previewKey = `preview_${cliente.id}_${timestamp}`;
      localStorage.setItem(previewKey, JSON.stringify(datosPreview));
      console.log('💾 Datos del preview guardados en:', previewKey);
    }
    
    const datosParaPreview = {
      ...pagina,
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
    console.log('🚀 INICIANDO GUARDADO...');
    console.log('🖼️ modalImageUrl antes de enviar:', pagina.modalImageUrl);
    
    if (!pagina.clienteId) {
      setError("El ID del cliente es requerido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Preparar datos de la página - INCLUYENDO modalImageUrl
      const paginaDataToSend = {
        clienteId: pagina.clienteId,
        encabezado: pagina.encabezado || "",
        subtitulo: pagina.subtitulo || "",
        descripcionCorta: pagina.descripcionCorta || "",
        cuerpo: pagina.cuerpo || "",
        telefono: pagina.telefono || "",
        email: pagina.email || "",
        direccion: pagina.direccion || "",
        horarioAtencion: pagina.horarioAtencion || "",
        colorFondo: pagina.colorFondo || "#ffffff",
        colorTexto: pagina.colorTexto || "#333333",
        colorPrimario: pagina.colorPrimario || "#2196f3",
        colorSecundario: pagina.colorSecundario || "#ff9800",
        colorAcento: pagina.colorAcento || "#4caf50",
        tema: pagina.tema || "claro",
        logoUrl: pagina.logoUrl || "",
        bannerUrl: pagina.bannerUrl || "",
        banner2Url: pagina.banner2Url || "",
        banner3Url: pagina.banner3Url || "",
        faviconUrl: pagina.faviconUrl || "",
        modalImageUrl: pagina.modalImageUrl || "",
        mostrarTestimonios: pagina.mostrarTestimonios,
        mostrarServicios: pagina.mostrarServicios,
        mostrarEquipo: pagina.mostrarEquipo,
        mostrarBlog: pagina.mostrarBlog,
        mostrarContacto: pagina.mostrarContacto,
        mostrarMapa: pagina.mostrarMapa,
        mostrarAnimaciones: pagina.mostrarAnimaciones,
        mostrarGalerias: pagina.mostrarGalerias,
        mostrarVideos: pagina.mostrarVideos,
        facebookUrl: pagina.facebookUrl || "",
        instagramUrl: pagina.instagramUrl || "",
        twitterUrl: pagina.twitterUrl || "",
        linkedInUrl: pagina.linkedinUrl || "",
        youTubeUrl: pagina.youtubeUrl || "",
        whatsAppUrl: pagina.whatsappUrl || "",
        metaTitulo: pagina.metaTitulo || "",
        metaDescripcion: pagina.metaDescripcion || "",
        metaKeywords: pagina.metaKeywords || "",
        codigoAnalytics: pagina.codigoAnalytics || "",
        codigoHeader: pagina.codigoHeader || "",
        codigoFooter: pagina.codigoFooter || "",
        estado: pagina.estado || "activo",
        esResponsive: pagina.esResponsive,
        velocidadCarga: pagina.velocidadCarga || "normal"
      };

      // Si es edición, agregar el ID
      if (paginaData && paginaData.id) {
        paginaDataToSend.id = paginaData.id;
        console.log('✏️ EDITANDO página ID:', paginaData.id);
      } else {
        console.log('➕ CREANDO nueva página');
      }

      // ✅ CORREGIDO: Preparar testimonios - AHORA SE GUARDAN CORRECTAMENTE
      const testimoniosToSend = testimonios.map((testimonio) => {
        let existingTestimonioId = null;
        if (paginaData && paginaData.testimoniosPersonalizados) {
          const existing = paginaData.testimoniosPersonalizados.find(t => 
            t.id === testimonio.id || (t.nombre === testimonio.nombre && t.paginaId === paginaData.id)
          );
          if (existing) {
            existingTestimonioId = existing.id;
          }
        }
        
        return {
          id: existingTestimonioId || testimonio.id,
          nombre: testimonio.nombre,
          cargo: testimonio.cargo || "",
          comentario: testimonio.comentario || "",
          calificacion: testimonio.calificacion || 5,
          fotoUrl: "",
          activo: testimonio.activo !== false
        };
      }).filter(t => t.nombre.trim() !== '' && t.comentario.trim() !== '');

      // Preparar galerías
      const galeriasToSend = galerias.map((galeria, galeriaIndex) => {
        let existingGaleriaId = null;
        let existingGaleria = null;
        
        if (paginaData && paginaData.galeriasImagenes) {
          existingGaleria = paginaData.galeriasImagenes.find(g => 
            g.id === galeria.id || (g.titulo === galeria.titulo && g.paginaId === paginaData.id)
          );
          if (existingGaleria) {
            existingGaleriaId = existingGaleria.id;
          }
        }

        const imagenesToSend = galeria.imagenes.map((imagen, imagenIndex) => {
          let existingImagenId = null;
          
          if (existingGaleria && existingGaleria.imagenes) {
            const existingImagen = existingGaleria.imagenes.find(i => 
              i.id === imagen.id || (i.titulo === imagen.titulo && i.galeriaId === existingGaleriaId)
            );
            if (existingImagen) {
              existingImagenId = existingImagen.id;
            }
          }
          
          return {
            id: existingImagenId || imagen.id,
            url: imagen.url || "",
            titulo: imagen.titulo || "",
            descripcion: imagen.descripcion || "",
            orden: imagenIndex
          };
        }).filter(img => img.titulo.trim() !== '');

        return {
          id: existingGaleriaId || galeria.id,
          titulo: galeria.titulo || "",
          descripcion: galeria.descripcion || "",
          orden: galeriaIndex,
          activo: galeria.activo !== false,
          imagenes: imagenesToSend
        };
      }).filter(g => g.titulo.trim() !== '');

      // Preparar videos
      const videosToSend = videos.map((video) => {
        let existingVideoId = null;
        if (paginaData && paginaData.videosEmbebidos) {
          const existing = paginaData.videosEmbebidos.find(v => 
            v.id === video.id || (v.titulo === video.titulo && v.paginaId === paginaData.id)
          );
          if (existing) {
            existingVideoId = existing.id;
          }
        }
        
        return {
          id: existingVideoId || video.id,
          titulo: video.titulo || "",
          url: video.url || "",
          descripcion: video.descripcion || "",
          tipo: video.tipo || "youtube",
          activo: video.activo !== false
        };
      }).filter(v => v.titulo.trim() !== '' && v.url.trim() !== '');

      // Construir el objeto final - SIN serviciosPersonalizados
      const datosCompletos = {
        ...paginaDataToSend,
        testimoniosPersonalizados: testimoniosToSend,
        galeriasImagenes: galeriasToSend,
        videosEmbebidos: videosToSend
      };

      console.log('📤 Datos a enviar - modalImageUrl:', paginaDataToSend.modalImageUrl);
      console.log('📤 Testimonios a enviar:', testimoniosToSend);

      // Determinar URL y método
      const url = paginaData && paginaData.id 
        ? `${API_BASE_URL}/ClientePaginas/${paginaData.id}`
        : `${API_BASE_URL}/ClientePaginas`;

      const method = paginaData && paginaData.id ? "PUT" : "POST";

      // Enviar la solicitud con token
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(datosCompletos)
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = responseText;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch {
          // Si no es JSON, usar el texto tal cual
        }
        
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      // Parsear la respuesta exitosa
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Respuesta parseada - modalImageUrl:', result.modalImageUrl || result.pagina?.modalImageUrl);
      } catch (parseError) {
        console.warn('⚠️ No se pudo parsear la respuesta como JSON:', parseError);
        result = { message: responseText || 'Operación exitosa' };
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(result.message || '✅ Página guardada correctamente');
      
      // Llamar al callback onSave para actualizar la lista
      if (onSave && typeof onSave === 'function') {
        onSave(result);
      }

      // Limpiar localStorage si existe
      if (cliente?.id) {
        const previewKeys = Object.keys(localStorage).filter(key => 
          key.includes(`preview_${cliente.id}`)
        );
        previewKeys.forEach(key => localStorage.removeItem(key));
      }

      // Cerrar el diálogo después de un tiempo
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      
      let errorMessage = error.message;
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Error de conexión con el servidor. Verifica que el backend esté corriendo.';
      } else if (errorMessage.includes('NetworkError')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }
      
      setError(errorMessage || "Error al guardar la página");
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

  // ========== FUNCIONES RENDER DE TABS ==========
  const renderTabContent = () => {
    switch(activeTab) {
      case 0: return renderBasicoTab();
      case 1: return renderDisenoTab();
      case 2: return renderContenidoTab();
      case 3: return renderTestimoniosTab(); // Testimonios ahora es tab 3
      case 4: return renderGaleriasTab();    // Galerías es tab 4
      case 5: return renderVideosTab();      // Videos es tab 5
      case 6: return renderRedesTab();       // Redes es tab 6
      case 7: return renderModalTab();       // Modal es tab 7
      default: return renderBasicoTab();
    }
  };

  const renderBasicoTab = () => (
    <Box>
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
        </Alert>
      )}

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

      <Grid container spacing={3}>
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

        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon /> Banner 1
            </Typography>
            <input type="file" ref={bannerInputRef} onChange={handleBannerSelect} accept="image/*" style={{ display: 'none' }} />
            {pagina.bannerUrl ? (
              <Box>
                <Card sx={{ mb: 1 }}>
                  <CardMedia component="img" height="120" image={pagina.bannerUrl} alt="Banner" sx={{ objectFit: 'cover' }} />
                </Card>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}>
                    {uploadingBanner ? <CircularProgress size={16} /> : 'Cambiar'}
                  </Button>
                  <Button size="small" color="error" onClick={() => setPagina(prev => ({ ...prev, bannerUrl: "" }))}>
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
                  <Button size="small" color="error" onClick={() => setPagina(prev => ({ ...prev, banner2Url: "" }))}>
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
                  <Button size="small" color="error" onClick={() => setPagina(prev => ({ ...prev, banner3Url: "" }))}>
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

        
      </Grid>

      <Divider sx={{ my: 3 }} />

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
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6} sm={3}>
          <Box>
            <Typography variant="caption" display="block" gutterBottom sx={{ mb: 1 }}>Botón Principal</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input 
                type="color" 
                value={pagina.colorPrimario} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorPrimario: e.target.value }))} 
                style={{ width: 40, height: 40, borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }} 
              />
              <TextField 
                fullWidth 
                size="small"
                variant="outlined"
                value={pagina.colorPrimario} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorPrimario: e.target.value }))} 
                sx={{ '& .MuiInputBase-root': { height: 40 } }}
              />
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box>
            <Typography variant="caption" display="block" gutterBottom sx={{ mb: 1 }}>Botón Secundario</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input 
                type="color" 
                value={pagina.colorSecundario} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorSecundario: e.target.value }))} 
                style={{ width: 40, height: 40, borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }} 
              />
              <TextField 
                fullWidth 
                size="small"
                variant="outlined"
                value={pagina.colorSecundario} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorSecundario: e.target.value }))} 
                sx={{ '& .MuiInputBase-root': { height: 40 } }}
              />
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box>
            <Typography variant="caption" display="block" gutterBottom sx={{ mb: 1 }}>Fondo</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input 
                type="color" 
                value={pagina.colorFondo} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorFondo: e.target.value }))} 
                style={{ width: 40, height: 40, borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }} 
              />
              <TextField 
                fullWidth 
                size="small"
                variant="outlined"
                value={pagina.colorFondo} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorFondo: e.target.value }))} 
                sx={{ '& .MuiInputBase-root': { height: 40 } }}
              />
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box>
            <Typography variant="caption" display="block" gutterBottom sx={{ mb: 1 }}>Texto</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input 
                type="color" 
                value={pagina.colorTexto} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorTexto: e.target.value }))} 
                style={{ width: 40, height: 40, borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }} 
              />
              <TextField 
                fullWidth 
                size="small"
                variant="outlined"
                value={pagina.colorTexto} 
                onChange={(e) => setPagina(prev => ({ ...prev, colorTexto: e.target.value }))} 
                sx={{ '& .MuiInputBase-root': { height: 40 } }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Tema</InputLabel>
            <Select
              value={pagina.tema}
              onChange={(e) => setPagina(prev => ({ ...prev, tema: e.target.value }))}
              label="Tema"
            >
              <MenuItem value="claro">Claro</MenuItem>
              <MenuItem value="oscuro">Oscuro</MenuItem>
              <MenuItem value="auto">Automático</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Velocidad de Carga</InputLabel>
            <Select
              value={pagina.velocidadCarga}
              onChange={(e) => setPagina(prev => ({ ...prev, velocidadCarga: e.target.value }))}
              label="Velocidad de Carga"
            >
              <MenuItem value="rapida">Rápida</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="moderada">Moderada</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Paper sx={{ mt: 3, p: 3, bgcolor: pagina.colorFondo, color: pagina.colorTexto }}>
        <Typography variant="h6" gutterBottom>Previsualización de Colores</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" sx={{ bgcolor: pagina.colorPrimario }}>Botón Primario</Button>
          <Button variant="contained" sx={{ bgcolor: pagina.colorSecundario }}>Botón Secundario</Button>
          <Button variant="outlined" sx={{ color: pagina.colorTexto, borderColor: pagina.colorPrimario }}>Botón Outline</Button>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Este es un texto de ejemplo con los colores seleccionados.
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
                  label="Activo"
                />
                <Typography variant="subtitle2" sx={{ flexGrow: 1, ml: 2 }}>
                  Testimonio #{testimonio.id}
                </Typography>
                <IconButton 
                  color="error" 
                  onClick={() => handleEliminarTestimonio(testimonio.id)}
                  size="small"
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
                label="Activa"
              />
              <Box sx={{ flexGrow: 1, ml: 2 }}>
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
                  label="Activo"
                />
                <Typography variant="subtitle2" sx={{ flexGrow: 1, ml: 2 }}>
                  Video #{video.id}
                </Typography>
                <IconButton 
                  color="error" 
                  onClick={() => handleEliminarVideo(video.id)}
                  size="small"
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

  const renderModalTab = () => {
    console.log("🎨 Renderizando modalTab, modalImageUrl:", pagina.modalImageUrl);
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ImageIcon /> Configurar Imagen Modal
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta imagen aparecerá como un modal/popup cuando los visitantes entren a tu página.
          Perfecto para anuncios, promociones o mensajes importantes.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {/* Campo para subir imagen del modal */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Imagen del Modal
              </Typography>
              
              <input 
                type="file" 
                ref={modalImageInputRef} 
                onChange={handleModalImageSelect} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              
              {pagina.modalImageUrl ? (
                <Box>
                  <Card sx={{ mb: 2 }}>
                    <CardMedia 
                      component="img" 
                      height="200" 
                      image={pagina.modalImageUrl} 
                      alt="Modal" 
                      sx={{ objectFit: 'contain', p: 1 }} 
                    />
                  </Card>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      size="small" 
                      onClick={() => modalImageInputRef.current?.click()} 
                      disabled={uploadingModalImage}
                    >
                      {uploadingModalImage ? <CircularProgress size={16} /> : 'Cambiar Imagen'}
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => setPagina(prev => ({ ...prev, modalImageUrl: "" }))}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    border: '2px dashed #ccc', 
                    borderRadius: 1, 
                    p: 4, 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#2196f3', bgcolor: '#f5f5f5' }
                  }}
                  onClick={() => modalImageInputRef.current?.click()}
                >
                  {uploadingModalImage ? (
                    <CircularProgress />
                  ) : (
                    <>
                      <AddPhotoAlternate sx={{ fontSize: 48, color: '#999', mb: 2 }} />
                      <Typography variant="body1" gutterBottom>
                        Subir Imagen para el Modal
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tamaño recomendado: 800x600px
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>
            
            {/* Campo para URL de imagen */}
            <TextField 
              fullWidth 
              label="URL de la Imagen Modal" 
              name="modalImageUrl" 
              value={pagina.modalImageUrl} 
              onChange={handleChange} 
              size="medium"
              helperText="Pega la URL completa de la imagen o súbela arriba"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            {/* Vista previa */}
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Vista Previa
            </Typography>
            
            {pagina.modalImageUrl ? (
              <Paper sx={{ 
                p: 3, 
                border: '1px solid #ddd', 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                  Esta imagen aparecerá como modal cuando alguien visite tu página:
                </Typography>
                
                <Box sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1, 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Encabezado simulado del modal */}
                  <Box sx={{ 
                    bgcolor: '#f0f0f0', 
                    p: 1.5, 
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Mensaje Importante
                    </Typography>
                    <Close sx={{ fontSize: 16, color: '#666' }} />
                  </Box>
                  
                  {/* Imagen */}
                  <img 
                    src={pagina.modalImageUrl} 
                    alt="Vista previa modal" 
                    style={{ 
                      width: '100%', 
                      height: '180px', 
                      objectFit: 'cover',
                      display: 'block'
                    }} 
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  ⚡ Los visitantes podrán cerrar este modal haciendo clic en la X
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ 
                p: 4, 
                textAlign: 'center', 
                border: '1px dashed #ddd',
                bgcolor: '#fafafa'
              }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Vista previa no disponible
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sube una imagen para ver cómo se verá como modal
                </Typography>
              </Paper>
            )}
            
            {/* Información adicional */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: '#e3f2fd' }}>
              <Typography variant="caption" color="#1565c0">
                <strong>💡 ¿Para qué usar este modal?</strong><br />
                • Promociones especiales<br />
                • Anuncios importantes<br />
                • Ofertas por tiempo limitado<br />
                • Eventos o lanzamientos
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

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
          <Tab icon={<Star />} label="Testimonios" />
          <Tab icon={<InsertPhoto />} label="Galerías" />
          <Tab icon={<VideoLibrary />} label="Videos" />
          <Tab icon={<Share />} label="Redes" />
          <Tab icon={<ImageIcon />} label="Modal" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Cargando datos...
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {renderTabContent()}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
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