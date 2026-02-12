import React, { useState } from 'react';

const VerificacionTarjetaEmbedded = () => {
  const [codigo, setCodigo] = useState('909868548921455');
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  const verificar = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`http://localhost:5127/api/Tarjetas/verificar/${codigo}`);
      
      if (!res.ok) {
        throw new Error('Error del servidor');
      }
      
      const resultado = await res.json();
      
      if (resultado.success) {
        setDatos(resultado.data);
      } else {
        setError(resultado.message || 'Error');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener color según estado
  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'ACTIVADA':
        return '#4CAF50'; // Verde
      case 'ASIGNADA':
        return '#FF9800'; // Naranja
      case 'VENCIDA':
        return '#F44336'; // Rojo
      case 'GENERADA':
        return '#2196F3'; // Azul
      default:
        return '#757575'; // Gris
    }
  };

  return (
    <div style={{ 
      padding: '15px', 
      maxWidth: '400px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px'
    }}>
      
      
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
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={verificar}
          disabled={loading || !codigo}
          style={{
            padding: '10px 15px',
            backgroundColor: loading ? '#ccc' : '#2196F3',
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
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '6px',
          padding: '15px',
          fontSize: '12px'
        }}>
          {/* ESTADO - CON COLOR CORRECTO */}
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
              <span style={{ color: '#666' }}>Código:</span>
              <strong style={{ fontFamily: 'monospace' }}>{datos.codigo}</strong>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <span style={{ color: '#666' }}>Serie:</span>
              <span>{datos.serie}</span>
            </div>
          </div>
          
          {/* PLAN Y SERVICIO - SIN SUBTÍTULO */}
          {datos.plan && (
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '12px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px',
                fontSize: '12px'
              }}>
                <span style={{ color: '#666' }}>Plan:</span>
                <strong>{datos.plan.nombre}</strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px',
                fontSize: '12px'
              }}>
                <span style={{ color: '#666' }}>Duración:</span>
                <span>{datos.plan.duracionDias} días</span>
              </div>
              {datos.plan.servicio && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#666' }}>Servicio:</span>
                  <strong>{datos.plan.servicio.nombre}</strong>
                </div>
              )}
            </div>
          )}
          
          {/* FECHAS - SIN SUBTÍTULO */}
          <div style={{
            backgroundColor: '#fff8e1',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '12px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#666' }}>Activación:</span>
              <span>{new Date(datos.fechaActivacion).toLocaleDateString()}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#666' }}>Vencimiento:</span>
              <span>{new Date(datos.fechaVencimiento).toLocaleDateString()}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <span style={{ color: '#666' }}>Días restantes:</span>
              <strong style={{ 
                color: datos.diasRestantes > 7 ? '#4CAF50' : '#f57c00'
              }}>
                {datos.diasRestantes} días
              </strong>
            </div>
          </div>
          
          {/* CLIENTE FINAL - SIN SUBTÍTULO */}
          {datos.clienteFinal && (
            <div style={{
              backgroundColor: '#e8f5e9',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '12px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px',
                fontSize: '12px'
              }}>
                <span style={{ color: '#666' }}>Cliente:</span>
                <strong>{datos.clienteFinal.nombre}</strong>
              </div>
              {datos.clienteFinal.celular && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#666' }}>Celular:</span>
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
          color: '#666',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          👆 Ingresa un código y haz clic en VERIFICAR
        </div>
      )}
    </div>
  );
};

export default VerificacionTarjetaEmbedded;