// src/utils/imageUtils.js
const API_BASE_URL = 'https://unalcoholised-della-unconglutinative.ngrok-free.dev';

export const getImageUrl = (url) => {
  if (!url) return '';
  
  // Si ya es una URL completa (http o https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Reemplazar IP local por ngrok
    if (url.includes('192.168.1.225:9090')) {
      return url.replace('http://192.168.1.225:9090', API_BASE_URL);
    }
    return url;
  }
  
  // Si es ruta relativa (empieza con /uploads)
  if (url.startsWith('/uploads')) {
    return `${API_BASE_URL}${url}`;
  }
  
  // Si solo es el nombre del archivo
  return `${API_BASE_URL}/uploads/${url}`;
};