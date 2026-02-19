import React from 'react';
import UserForm from './UserForm';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f4f7f6', 
      fontFamily: 'sans-serif',
      /* Cambiamos el padding para darle un respiro en la parte superior e inferior */
      paddingTop: '5vh', 
      paddingBottom: '5vh'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        width: '90%', /* Para que se vea bien en pantallas pequeñas */
        maxWidth: '600px',
        
        /* ESTA ES LA REGLA QUE CENTRA EL CUADRO SIN USAR FLEXBOX */
        margin: '0 auto' 
      }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
          Sistema de Inventario
          <br/>
          <span style={{ fontSize: '20px', color: '#666' }}>Módulo de Seguridad</span>
        </h1>
        
        {/* Aquí llamamos a tu formulario */}
        <UserForm /> 
      </div>
    </div>
  );
}

export default App;