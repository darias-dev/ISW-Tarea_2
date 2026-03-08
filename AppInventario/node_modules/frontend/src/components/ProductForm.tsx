import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface Producto {
  sku?: number;
  nombre: string;
  descripcion?: string;
  unidad: string;
  precio: number;
  stockMinimo: number;
  categoriaId: number;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface ProductFormProps {
  product?: Producto | null;
  onClose: () => void;
  onSaved: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSaved }) => {
  const [formData, setFormData] = useState<Producto>(
    product || {
      nombre: '',
      descripcion: '',
      unidad: 'Pieza',
      precio: 0,
      stockMinimo: 10,
      categoriaId: 1, // Default to a valid ID; ideally we fetch categories
    }
  );
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // En una app real crearíamos un endpoint para listar categorías. 
  // Por ahora lo simularemos si no existen, o requeriríamos que exista al menos una categoría en BD.
  useEffect(() => {
    // Simulating fetching categories for the select dropdown
    setCategories([
      { id: 1, nombre: 'Electrónica' },
      { id: 2, nombre: 'Muebles' },
      { id: 3, nombre: 'Oficina' },
      { id: 4, nombre: 'Limpieza' },
    ]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' || name === 'categoriaId' || name === 'stockMinimo' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (product && product.sku) {
        // Update
        await axios.put(`http://localhost:3000/api/products/${product.sku}`, formData);
      } else {
        // Create
        await axios.post('http://localhost:3000/api/products', formData);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50">
          <h2 className="text-xl font-semibold text-white">
            {product ? `Editar Producto (SKU: ${product.sku})` : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Nombre del producto"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Descripción opcional"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Unidad</label>
              <select
                name="unidad"
                value={formData.unidad}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="Pieza">Pieza (pz)</option>
                <option value="Caja">Caja</option>
                <option value="Paquete">Paquete</option>
                <option value="Kg">Kilogramo (kg)</option>
                <option value="Litro">Litro (l)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Precio Unitario</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  name="precio"
                  required
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Stock Mínimo</label>
              <div className="relative">
                <input
                  type="number"
                  name="stockMinimo"
                  required
                  min="0"
                  step="1"
                  value={formData.stockMinimo}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-700 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                'Guardar Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
