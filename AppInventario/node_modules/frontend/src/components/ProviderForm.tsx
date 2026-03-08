import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface Provider {
  id: number;
  nombre: string;
  contacto: string | null;
  condicionesPago: string | null;
}

interface ProviderFormProps {
  provider: Provider | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ provider, onClose, onSuccess }) => {
  const isEditing = !!provider;
  
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    condicionesPago: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (provider) {
      setFormData({
        nombre: provider.nombre,
        contacto: provider.contacto || '',
        condicionesPago: provider.condicionesPago || ''
      });
    }
  }, [provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        await axios.put(`http://localhost:3000/api/providers/${provider.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/providers', formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el proveedor');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? `Editar Proveedor #${provider.id}` : 'Nuevo Proveedor'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {error && <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre / Razón Social *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="Ej. Distribuidora S.A."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contacto (Teléfono/Email)</label>
            <input
              type="text"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej. +34 600 000 000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Condiciones de Pago</label>
            <textarea
              name="condicionesPago"
              value={formData.condicionesPago}
              onChange={handleChange}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Ej. 30 días neto."
            />
          </div>
          
        </form>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/80 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.nombre}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Proveedor')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderForm;
