import React, { useState } from 'react';
import { createUsuario } from './UserService';

const UserForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'almacén'
  });
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [status, setStatus] = useState('');
  
  // Estado para manejar errores de validación
  const [error, setError] = useState(''); 
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiamos el mensaje de error cada vez que el usuario cambia algo en el formulario
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    // Buscamos si ya existe alguien con el mismo email Y el mismo rol
    const usuarioDuplicado = listaUsuarios.find(
      (user) => user.email === formData.email && user.rol === formData.rol
    );

    if (usuarioDuplicado) {
      setError(`Error: El correo ${formData.email} ya tiene asignado el rol de ${formData.rol}.`);
      setStatus(''); // Limpiamos cualquier mensaje de estado previo
      return; // Detenemos el proceso de guardado si encontramos un duplicado
    }
    // -----------------------------

    setStatus('Guardando en el servidor...');
    setError(''); // Limpiamos cualquier mensaje de error previo
    
    const response = await createUsuario(formData);
    
    setListaUsuarios([...listaUsuarios, formData]);
    setStatus(response.message);
    setFormData({ nombre: '', email: '', rol: 'almacén' }); 
    
    setTimeout(() => setStatus(''), 3000);
  };

  const toggleMostrarUsuarios = () => {
    setMostrarUsuarios(!mostrarUsuarios);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* SECCIÓN DEL FORMULARIO */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Crear Nuevo Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Nombre Completo:</label><br />
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Correo Electrónico:</label><br />
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Privilegios (Rol):</label><br />
            <select name="rol" value={formData.rol} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
              <option value="admin">Administrador</option>
              <option value="almacén">Personal de Almacén</option>
              <option value="comprador">Comprador</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Registrar Usuario
          </button>
        </form>
        
        {/* SECCIÓN DE MENSAJES DE ESTADO Y ERROR */}
        {status && <p style={{ color: 'green', fontWeight: 'bold', marginTop: '15px' }}>{status}</p>}
        {error && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '15px' }}>{error}</p>}
      </div>

      {/* BOTÓN PARA MOSTRAR/OCULTAR USUARIOS REGISTRADOS */}
      <button 
        onClick={toggleMostrarUsuarios} 
        style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
      >
        {mostrarUsuarios ? 'Ocultar Usuarios Registrados' : 'Ver Usuarios Registrados'}
      </button>

      {/* SECCIÓN DE LISTADO DE USUARIOS REGISTRADOS */}
      {mostrarUsuarios && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <h3>Usuarios Registrados </h3>
          {listaUsuarios.length === 0 ? (
            <p style={{ color: '#666' }}>Aún no hay usuarios registrados.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Rol</th>
                </tr>
              </thead>
              <tbody>
                {listaUsuarios.map((user, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.nombre}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.email}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd', textTransform: 'capitalize' }}>{user.rol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
};

export default UserForm;