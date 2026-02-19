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

    const loadImage = async () => {
      try {
        setLoading(true);
        console.log('🖼️ Intentando cargar:', src);

        // PRIMER INTENTO: Con fetch y header
        try {
          const response = await fetch(src, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setImageSrc(objectUrl);
            setError(false);
            console.log('✅ Cargada con fetch');
            return;
          }
        } catch (fetchError) {
          console.log('⚠️ Fetch falló, intentando directamente');
        }

        // SEGUNDO INTENTO: Usar un timestamp para evitar caché
        // Esto fuerza al navegador a hacer una nueva petición
        const timestamp = new Date().getTime();
        const fallbackUrl = src.includes('?') 
          ? `${src}&t=${timestamp}` 
          : `${src}?t=${timestamp}`;
        
        // Probar con un Image object
        const img = new Image();
        img.onload = () => {
          setImageSrc(fallbackUrl);
          setError(false);
          setLoading(false);
          console.log('✅ Cargada con timestamp');
        };
        img.onerror = () => {
          throw new Error('No se pudo cargar la imagen');
        };
        img.src = fallbackUrl;

      } catch (err) {
        console.error('❌ Error definitivo:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadImage();

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
        justifyContent: 'center',
        borderRadius: '4px'
      }}>
        <span style={{ fontSize: '12px', color: '#666' }}>🖼️ Cargando...</span>
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
        fontSize: '12px',
        borderRadius: '4px',
        padding: '10px',
        textAlign: 'center'
      }}>
        ⚠️ No se pudo cargar la imagen
      </div>
    );
  }

  return <img src={imageSrc || src} alt={alt} {...props} />;
};

export default ImagenConHeader;