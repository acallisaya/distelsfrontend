import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const VerificacionTarjetaEmbedded = ({ 
  onClose, 
  embedded = false,
  colorPrimario = '#2196F3',
  colorFondo,
  textoColor,
  fondoClaro = true 
}) => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  // Determinar colores según props
  const backgroundColor = colorFondo || (fondoClaro ? '#ffffff' : '#1a1a1a');
  const textColor = textoColor || (fondoClaro ? '#333333' : '#ffffff');
  const borderColor = fondoClaro ? '#ccc' : '#555';
  const buttonColor = loading ? '#ccc' : colorPrimario;

  // ========== FUNCIÓN PARA OBTENER HEADERS CON NGROK ==========
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const verificar = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/Tarjetas/verificar/${codigo}`, {
        headers: getHeaders()
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Error respuesta:', text);
        throw new Error(`Error ${res.status}: No se pudo verificar la tarjeta`);
      }
      
      const resultado = await res.json();
      
      if (resultado.success) {
        setDatos(resultado.data);
      } else {
        setError(resultado.message || 'Error al verificar la tarjeta');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error en verificación:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener color según estado
  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'ACTIVADA':
        return '#4CAF50';
      case 'ASIGNADA':
        return '#FF9800';
      case 'VENCIDA':
        return '#F44336';
      case 'GENERADA':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  return (
    <div style={{ 
      padding: '15px', 
      maxWidth: '400px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      backgroundColor,
      color: textColor,
      borderRadius: '4px'
    }}>
      
      {/* TÍTULO VISIBLE - SOLO CUANDO ESTÁ EMBEBIDO */}
      {embedded && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px',
          padding: '0 5px'
        }}>
          <span style={{ 
            fontWeight: 700, 
            fontSize: '0.9rem',
            color: colorPrimario,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🔍 VERIFICAR TARJETA
          </span>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: textColor,
                opacity: 0.7,
                fontSize: '18px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* INPUT Y BOTÓN */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '15px' 
      }}>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Código de tarjeta"
          style={{
            flex: 1,
            padding: '10px',
            border: `1px solid ${borderColor}`,
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: fondoClaro ? '#ffffff' : '#2d2d2d',
            color: textColor
          }}
        />
        <button
          onClick={verificar}
          disabled={loading || !codigo}
          style={{
            padding: '10px 15px',
            backgroundColor: buttonColor,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          {loading ? '...' : 'VERIFICAR'}
        </button>
      </div>
      
      {/* ERROR */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px',
          borderLeft: '3px solid #f44336',
          fontSize: '12px'
        }}>
          <strong>ERROR:</strong> {error}
        </div>
      )}
      
      {/* RESULTADO */}
      {datos && (
        <div style={{
          backgroundColor: fondoClaro ? '#f5f5f5' : '#2d2d2d',
          border: `1px solid ${borderColor}`,
          borderRadius: '6px',
          padding: '15px',
          fontSize: '12px',
          color: textColor
        }}>
          {/* ESTADO */}
          <div style={{
            backgroundColor: getEstadoColor(datos.estado),
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '13px'
          }}>
            {datos.estado} - {datos.mensajeEstado}
          </div>
          
          {/* INFORMACIÓN BÁSICA */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px'
            }}>
              <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Código:</span>
              <strong style={{ fontFamily: 'monospace' }}>{datos.codigo}</strong>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Serie:</span>
              <span>{datos.serie}</span>
            </div>
          </div>
          
          {/* PLAN Y SERVICIO */}
          {datos.plan && (
            <div style={{
              backgroundColor: fondoClaro ? '#e3f2fd' : '#1a237e',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '12px',
              color: fondoClaro ? '#000' : '#fff'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px',
                fontSize: '12px'
              }}>
                <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Plan:</span>
                <strong>{datos.plan.nombre}</strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px',
                fontSize: '12px'
              }}>
                <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Duración:</span>
                <span>{datos.plan.duracionDias} días</span>
              </div>
              {datos.plan.servicio && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Servicio:</span>
                  <strong>{datos.plan.servicio.nombre}</strong>
                </div>
              )}
            </div>
          )}
          
          {/* FECHAS */}
          <div style={{
            backgroundColor: fondoClaro ? '#fff8e1' : '#4a2c00',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '12px',
            color: fondoClaro ? '#000' : '#fff'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px'
            }}>
              <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Activación:</span>
              <span>{new Date(datos.fechaActivacion).toLocaleDateString()}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px'
            }}>
              <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Vencimiento:</span>
              <span>{new Date(datos.fechaVencimiento).toLocaleDateString()}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Días restantes:</span>
              <strong style={{ 
                color: datos.diasRestantes > 7 ? '#4CAF50' : '#f57c00'
              }}>
                {datos.diasRestantes} días
              </strong>
            </div>
          </div>
          
          {/* CLIENTE FINAL */}
          {datos.clienteFinal && (
            <div style={{
              backgroundColor: fondoClaro ? '#e8f5e9' : '#1b5e20',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '12px',
              color: fondoClaro ? '#000' : '#fff'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px',
                fontSize: '12px'
              }}>
                <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Cliente:</span>
                <strong>{datos.clienteFinal.nombre}</strong>
              </div>
              {datos.clienteFinal.celular && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <span style={{ color: fondoClaro ? '#666' : '#aaa' }}>Celular:</span>
                  <span>{datos.clienteFinal.celular}</span>
                </div>
              )}
            </div>
          )}
          
          {/* BOTÓN DE NUEVA BÚSQUEDA */}
          <button
            onClick={() => {
              setCodigo('');
              setDatos(null);
              setError('');
            }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              marginTop: '10px'
            }}
          >
            NUEVA BÚSQUEDA
          </button>
        </div>
      )}
      
      {/* SI NO HAY DATOS Y NO ESTÁ CARGANDO */}
      {!datos && !loading && !error && (
        <div style={{
          textAlign: 'center',
          color: fondoClaro ? '#666' : '#aaa',
          padding: '15px',
          backgroundColor: fondoClaro ? '#f9f9f9' : '#2d2d2d',
          borderRadius: '4px',
          fontSize: '13px',
          border: `1px solid ${borderColor}`
        }}>
          👆 Ingresa un código y haz clic en VERIFICAR
        </div>
      )}
    </div>
  );
};

export default VerificacionTarjetaEmbedded;