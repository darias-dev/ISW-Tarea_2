import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowDownUp, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface Movimiento {
  id: number;
  tipo: string;
  cantidad: number;
  timestamp: string;
  producto: {
    nombre: string;
    sku: string;
  };
  usuario: {
    nombre: string;
  };
}

interface Producto {
  sku: number;
  nombre: string;
}

const Inventory = () => {
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    tipo: 'ENTRADA',
    cantidad: 1,
    productoId: '',
    usuarioId: 1 // Default to 1 (Admin/Almacen test user)
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMovements = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/inventory/movement');
      setMovements(res.data);
    } catch (err) {
      console.error('Error fetching movements:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      setProducts(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, productoId: res.data[0].sku.toString() }));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMovements(), fetchProducts()]).finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:3000/api/inventory/movement', formData);
      setSuccess('Movimiento registrado exitosamente');
      setFormData(prev => ({ ...prev, cantidad: 1 })); // reset quantity
      fetchMovements();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error registrando movimiento');
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return <TrendingUp size={16} className="text-green-500" />;
      case 'SALIDA': return <TrendingDown size={16} className="text-red-500" />;
      case 'TRANSFERENCIA': return <ArrowRightLeft size={16} className="text-blue-500" />;
      default: return <ArrowDownUp size={16} className="text-slate-400" />;
    }
  };

  const getTypeStyle = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'SALIDA': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'TRANSFERENCIA': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Movimientos de Inventario</h1>
          <p className="text-slate-400">Registra entradas, salidas y consulta el historial.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Registro */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl lg:col-span-1 h-fit">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <ArrowDownUp size={20} className="text-indigo-400"/>
            Registrar Movimiento
          </h2>
          
          {error && <div className="mb-4 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
          {success && <div className="mb-4 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">{success}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Producto</label>
              <select
                name="productoId"
                value={formData.productoId}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {products.length === 0 ? (
                  <option value="" disabled>No hay productos disponibles</option>
                ) : (
                  products.map(p => (
                    <option key={p.sku} value={p.sku}>{p.nombre}</option>
                  ))
                )}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ENTRADA">Entrada</option>
                  <option value="SALIDA">Salida</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="AJUSTE">Ajuste</option>
                  <option value="DEVOLUCION">Devolución</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  min="1"
                  required
                  value={formData.cantidad}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={products.length === 0}
              className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              Registrar
            </button>
          </form>
        </div>

        {/* Lista de Movimientos */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-slate-700 bg-slate-900/30">
             <h2 className="text-lg font-medium text-white">Últimos Movimientos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4">Fecha</th>
                  <th scope="col" className="px-6 py-4">Producto</th>
                  <th scope="col" className="px-6 py-4">Tipo</th>
                  <th scope="col" className="px-6 py-4 text-right">Cantidad</th>
                  <th scope="col" className="px-6 py-4">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando movimientos...</td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay movimientos registrados.</td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {new Date(mov.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{mov.producto?.nombre}</div>
                        <div className="text-xs text-slate-500">{mov.producto?.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeStyle(mov.tipo)}`}>
                          {getTypeIcon(mov.tipo)}
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-white">
                        {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : ''}{mov.cantidad}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {mov.usuario?.nombre || 'Sistema'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
