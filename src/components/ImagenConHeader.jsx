// components/ImagenConHeader.jsx
import React, { useState, useEffect } from 'react';

const ImagenConHeader = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        setLoading(true);
        // Agregar el header necesario para ngrok
        const response = await fetch(src, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (!response.ok) throw new Error('Error cargando imagen');
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setError(false);
      } catch (err) {
        console.error('Error cargando imagen:', err);
        setError(true);
        // Fallback a la URL original si falla
        setImageSrc(src);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // Limpiar memoria
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        height: props.height || '100px', 
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '12px', color: '#999' }}>Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: props.height || '100px', 
        backgroundColor: '#ffebee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c62828',
        fontSize: '12px'
      }}>
        ⚠️ Error al cargar
      </div>
    );
  }

  return <img src={imageSrc || src} alt={alt} {...props} />;
};

export default ImagenConHeader;