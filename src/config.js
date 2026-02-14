// src/config.js

// ============================================
// CONFIGURACIÓN PARA FRONTEND EN REACT + VITE
// Soporta: Desarrollo local, Render, y cualquier entorno
// ============================================

/**
 * Detección inteligente del entorno
 * Funciona en:
 * - Desarrollo local (localhost, 127.0.0.1)
 * - Red local (192.168.x.x)
 * - Producción (Render, Vercel, Netlify, etc.)
 */
const isProduction = !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1') &&
                     !window.location.hostname.includes('192.168.');

// ============================================
// URLs para API
// Prioridad:
// 1. Variable de entorno (configurable en Render)
// 2. URL de producción (ngrok)
// 3. Proxy de desarrollo (relativo)
// ============================================
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
    (isProduction 
        ? 'https://unalcoholised-della-unconglutinative.ngrok-free.dev/api'
        : '/api');

// ============================================
// URLs para Imágenes
// ============================================
export const IMAGES_BASE_URL = import.meta.env.VITE_IMAGES_URL || 
    (isProduction 
        ? 'https://unalcoholised-della-unconglutinative.ngrok-free.dev'
        : '');

// ============================================
// Función para construir URLs de imágenes
// Maneja:
// - URLs completas (http://...)
// - Nombres de archivo simples (imagen.png)
// - Rutas relativas (/uploads/...)
// ============================================
export const getImageUrl = (imagePath) => {
    // Si no hay ruta, devolver vacío
    if (!imagePath) return '';
    
    // Si ya es URL completa (http:// o https://), devolverla tal cual
    if (imagePath.startsWith('http')) return imagePath;
    
    // Extraer solo el nombre del archivo (eliminar cualquier ruta)
    // Ejemplo: "uploads/logos/abc.png" → "abc.png"
    const fileName = imagePath.split('/').pop();
    
    // En desarrollo local (sin IMAGES_BASE_URL), usar ruta relativa
    if (!IMAGES_BASE_URL) {
        return `/uploads/logos/${fileName}`;
    }
    
    // En producción, construir URL completa con ngrok
    return `${IMAGES_BASE_URL}/uploads/logos/${fileName}`;
};

// ============================================
// Headers comunes para fetch
// Útil para evitar problemas de CORS con ngrok
// ============================================
export const getFetchHeaders = (includeAuth = false) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // 👈 EVITA LA PÁGINA DE ADVERTENCIA DE NGROK
    };
    
    // Si hay token de autenticación (opcional)
    if (includeAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    return headers;
};

// ============================================
// Función auxiliar para hacer peticiones a la API
// Incluye manejo de errores básico
// ============================================
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: getFetchHeaders(options.includeAuth),
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('❌ API Fetch Error:', error.message);
        throw error;
    }
};

// ============================================
// Logs de depuración (solo en desarrollo)
// ============================================
if (!isProduction) {
    console.log('🔧 ===== CONFIGURACIÓN ACTUAL =====');
    console.log('🌐 Modo:', 'DESARROLLO');
    console.log('🔌 API URL:', API_BASE_URL);
    console.log('🖼️ IMAGES URL:', IMAGES_BASE_URL);
    console.log('📁 Hostname:', window.location.hostname);
    console.log('🔍 isProduction:', isProduction);
    console.log('=================================');
}

// ============================================
// Exportaciones adicionales útiles
// ============================================
export const ENV = {
    isProduction,
    isDevelopment: !isProduction,
    hostname: window.location.hostname,
    origin: window.location.origin,
};