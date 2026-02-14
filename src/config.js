// src/config.js

// Detectar entorno
const isProduction = window.location.hostname === '192.168.1.225' || 
                     !window.location.hostname.includes('localhost');

// ===== URLs para API =====
export const API_BASE_URL = isProduction 
       ? 'http://192.168.1.225:9090/api'  // 👈 CAMBIADO: URL completa con puerto 9090
    : 'http://192.168.1.225:9090/api'; // Desarrollo: igual

// ===== URLs para IMÁGENES =====
export const IMAGES_BASE_URL = isProduction 
    ? ''                               // Producción: mismo servidor (vacío = relativo)
    : 'http://192.168.1.225:9090';     // Desarrollo: con puerto específico

// Función para construir URL completa de imagen
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // Si ya es URL completa, devolverla
    if (imagePath.startsWith('http')) return imagePath;
    
    // Extraer solo el nombre del archivo
    const fileName = imagePath.split('/').pop();
    
    // En producción: ruta relativa (sin dominio)
    // En desarrollo: URL completa con puerto
    return isProduction 
        ? `/uploads/logos/${fileName}`           // Producción: relativo
        : `${IMAGES_BASE_URL}/uploads/logos/${fileName}`; // Desarrollo: completo
};

console.log('🌐 Modo:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');
console.log('🔌 API URL:', API_BASE_URL);
console.log('🖼️ Images Base URL:', IMAGES_BASE_URL);