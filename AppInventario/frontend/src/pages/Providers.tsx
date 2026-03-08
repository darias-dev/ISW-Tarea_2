import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import ProviderForm from '../components/ProviderForm';

export interface Provider {
  id: number;
  nombre: string;
  contacto: string | null;
  condicionesPago: string | null;
}

const Providers = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const fetchProviders = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/providers');
      setProviders(res.data);
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este proveedor?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/providers/${id}`);
      setProviders(providers.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting provider:', err);
      if (err.response?.status === 400) {
        alert(err.response.data.error);
      } else {
        alert('Error al eliminar el proveedor');
      }
    }
  };

  const openEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setEditingProvider(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingProvider(null);
    fetchProviders();
  };

  const filteredProviders = providers.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.contacto && p.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Proveedores</h1>
          <p className="text-slate-400">Administra el catálogo de proveedores y sus datos de contacto.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
        >
          <Plus size={20} />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por Nombre o Contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">ID</th>
                <th scope="col" className="px-6 py-4">Nombre</th>
                <th scope="col" className="px-6 py-4">Contacto</th>
                <th scope="col" className="px-6 py-4">Condiciones de Pago</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando proveedores...</td>
                </tr>
              ) : filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <Truck size={48} className="mx-auto mb-3 opacity-20" />
                    No se encontraron proveedores
                  </td>
                </tr>
              ) : (
                filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-white">#{provider.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{provider.nombre}</td>
                    <td className="px-6 py-4 text-slate-400">{provider.contacto || '-'}</td>
                    <td className="px-6 py-4 text-slate-400">{provider.condicionesPago || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(provider)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Editar Proveedor"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(provider.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar Proveedor"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ProviderForm 
          provider={editingProvider}
          onClose={() => setIsFormOpen(false)} 
          onSuccess={handleFormSuccess} 
        />
      )}
    </div>
  );
};

export default Providers;
