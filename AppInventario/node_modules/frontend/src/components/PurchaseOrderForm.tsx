import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2 } from 'lucide-react';

interface PurchaseOrderFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Provider {
  id: number;
  nombre: string;
}

interface Product {
  sku: number;
  nombre: string;
  unidad: string;
  precio: number;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ onClose, onSuccess }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [proveedorId, setProveedorId] = useState<string>('');
  const [items, setItems] = useState([{ productoId: '', cantidad: 1, precioUnitario: 0 }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch dependencies
    const fetchData = async () => {
      try {
        const [prodRes, provRes] = await Promise.all([
          axios.get('http://localhost:3000/api/products'),
          axios.get('http://localhost:3000/api/purchases/providers')
        ]);
        setProducts(prodRes.data);
        setProviders(provRes.data);
        if (provRes.data.length > 0) setProveedorId(provRes.data[0].id.toString());
        if (prodRes.data.length > 0) updateItem(0, 'productoId', prodRes.data[0].sku.toString(), prodRes.data);
      } catch (err) {
        console.error('Failed to load form data', err);
        setError('Error al cargar datos iniciales.');
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    const defaultProd = products.length > 0 ? products[0].sku.toString() : '';
    const defaultPrice = products.length > 0 ? products[0].precio : 0;
    setItems([...items, { productoId: defaultProd, cantidad: 1, precioUnitario: defaultPrice }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number, productList: Product[] = products) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-update price when product changes
    if (field === 'productoId') {
      const selectedProd = productList.find(p => p.sku === parseInt(value.toString(), 10));
      if (selectedProd) {
        newItems[index].precioUnitario = selectedProd.precio;
      }
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!proveedorId) throw new Error('Debe seleccionar un proveedor');
      if (items.length === 0) throw new Error('Debe agregar al menos un producto');
      
      const payload = {
        proveedorId: parseInt(proveedorId, 10),
        items: items.map(item => ({
          productoId: parseInt(item.productoId, 10),
          cantidad: parseInt(item.cantidad.toString(), 10),
          precioUnitario: parseFloat(item.precioUnitario.toString())
        }))
      };

      await axios.post('http://localhost:3000/api/purchases', payload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al guardar la orden');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Nueva Orden de Compra</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Proveedor</label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {providers.length === 0 && <option value="" disabled>No hay proveedores</option>}
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-slate-300">Productos</h3>
              <button 
                type="button" 
                onClick={addItem}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-md transition"
              >
                <Plus size={14} /> Añadir Producto
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Producto (SKU)</label>
                  <select
                    value={item.productoId}
                    onChange={(e) => updateItem(index, 'productoId', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {products.length === 0 && <option value="" disabled>Vacio</option>}
                    {products.map(p => (
                      <option key={p.sku} value={p.sku}>#{p.sku} - {p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs text-slate-400 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs text-slate-400 mb-1">Precio Unit ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) => updateItem(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                {items.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)}
                    className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition border border-red-500/20"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-700">
            <div className="text-right">
              <span className="text-sm text-slate-400 mr-4">Total Estimado</span>
              <span className="text-2xl font-bold text-emerald-400">${calculateTotal()}</span>
            </div>
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
            disabled={loading || items.length === 0}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Procesando...' : 'Crear Orden'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
