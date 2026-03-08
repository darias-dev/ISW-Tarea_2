import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Pencil, KeyRound, AlertTriangle, ShieldCheck, ShieldAlert, X } from 'lucide-react';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'ALMACEN',
    activo: true
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  const { user: loggedInUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'ALMACEN', activo: true });
    setError('');
  };

  const handleEditClick = (user: User) => {
    setIsEditing(true);
    setEditingId(user.id);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '', // Password is not populated, leave blank unless creating
      rol: user.rol,
      activo: user.activo
    });
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isEditing && editingId) {
        // Prepare update payload (strip password as it's separate)
        const updatePayload = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo
        };
        await axios.put(`http://localhost:3000/api/users/${editingId}`, updatePayload);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        // Create new user
        if (!formData.password) {
          setError('La contraseña es obligatoria para nuevos usuarios');
          return;
        }
        await axios.post('http://localhost:3000/api/users', formData);
        setSuccess('Usuario creado exitosamente');
      }
      
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error procesando la solicitud');
    }
  };

  const handleOpenResetModal = (user: User) => {
    setResetTargetUser(user);
    setNewPassword('');
    setResetModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPassword) return;

    try {
      await axios.post(`http://localhost:3000/api/users/${resetTargetUser.id}/reset-password`, {
        newPassword
      });
      setSuccess(`Contraseña de ${resetTargetUser.nombre} actualizada correctamente`);
      setResetModalOpen(false);
      setResetTargetUser(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al resetear la contraseña');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-semibold text-slate-100">Gestión de Usuarios</h1>
           <p className="text-slate-400 text-sm mt-1">Crea, modifica roles o revoca el acceso del personal</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <ShieldCheck size={20} />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration / Edit Form */}
        <div className="bg-slate-800 shadow-xl rounded-xl p-6 lg:col-span-1 border border-slate-700 h-fit">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isEditing ? <><Pencil size={18} className="text-indigo-400"/> Editar Usuario</> : 'Crear Nuevo Usuario'}
             </h2>
             {isEditing && (
               <button onClick={resetForm} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700 px-2 py-1 rounded transition-colors">
                  <X size={12}/> Cancelar
               </button>
             )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Correo (Debe usar @inventario.com)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="usuario@inventario.com"
              />
            </div>
            
            {/* Solo se pide contraseña al crear, la edición y reseteo es por separado */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Rol Operativo</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="ADMIN">Administrador VIP</option>
                <option value="ALMACEN">Operador de Almacén</option>
                <option value="COMPRADOR">Comprador / Abastos</option>
                <option value="AUDITOR">Auditor (Solo Lectura)</option>
              </select>
            </div>

            {isEditing && (
              <div className="pt-2 border-t border-slate-700 mt-4">
                <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                      disabled={editingId === 1 && loggedInUser?.id !== 1} // Protection
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.activo ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.activo ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${formData.activo ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {formData.activo ? 'Cuenta Habilitada' : 'Cuenta Suspendida'}
                    </span>
                    <p className="text-xs text-slate-500">
                      {formData.activo ? 'El usuario tiene acceso al sistema.' : 'El usuario fue revocado del sistema.'}
                    </p>
                  </div>
                </label>
              </div>
            )}
            
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 rounded-xl shadow-lg mt-6 text-sm font-bold text-white transition-all 
                ${isEditing ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'}`}
            >
              {isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
            </button>
          </form>
        </div>

        {/* Users Table List */}
        <div className="bg-slate-800 shadow-xl rounded-xl p-0 lg:col-span-2 border border-slate-700 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-700 bg-slate-900/50">
             <h2 className="text-lg font-bold text-white">Directorio del Personal</h2>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th scope="col" className="px-6 py-4">Usuario</th>
                  <th scope="col" className="px-6 py-4">Rol en Sistema</th>
                  <th scope="col" className="px-6 py-4 text-center">Estado</th>
                  <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{u.nombre}</div>
                      <div className="text-xs font-mono text-indigo-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-md border 
                        ${u.rol === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                          u.rol === 'ALMACEN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          u.rol === 'COMPRADOR' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {u.activo ? (
                         <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Activo
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 opacity-80">
                            <ShieldAlert size={12} />
                            Inactivo
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => handleEditClick(u)}
                           className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-colors"
                           title="Editar Datos"
                         >
                           <Pencil size={18} />
                         </button>
                         <button 
                           onClick={() => handleOpenResetModal(u)}
                           className="p-2 text-amber-400 hover:text-white hover:bg-amber-500/20 rounded-lg transition-colors"
                           title="Resetear Contraseña"
                         >
                           <KeyRound size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                       <div className="flex flex-col items-center justify-center opacity-50">
                          <ShieldCheck size={48} className="mb-4" />
                          <p>No hay usuarios registrados</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
           <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700">
              <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                       <KeyRound size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Resetear Contraseña</h3>
                 </div>
                 <button onClick={() => setResetModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
                 <p className="text-sm text-slate-300">
                   Vas a establecer una nueva contraseña de acceso para el usuario <strong className="text-indigo-400">{resetTargetUser.email}</strong>.
                 </p>
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Escribe la nueva clave..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setResetModalOpen(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all"
                    >
                      Actualizar Alta
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Users;
