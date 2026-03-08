import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import PurchaseOrderForm from '../components/PurchaseOrderForm';
import OrderDetailsModal from '../components/OrderDetailsModal';

export interface OrdenCompraItem {
  id: number;
  cantidad: number;
  precioUnitario: number;
  producto: {
    sku: number;
    nombre: string;
    unidad: string;
  };
}

export interface OrdenCompra {
  id: number;
  estado: string;
  fechaCreacion: string;
  fechaRecepcion: string | null;
  proveedor: {
    id: number;
    nombre: string;
  };
  items: OrdenCompraItem[];
}

const Purchases = () => {
  const [orders, setOrders] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<OrdenCompra | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/purchases');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await axios.put(`http://localhost:3000/api/purchases/${id}/status`, { estado: newStatus });
      setOrders(orders.map(o => o.id === id ? res.data : o));
      // Always refresh to grab inventory side effects if any
      if (newStatus === 'RECIBIDA') {
        fetchOrders();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado de la orden');
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Pendiente</span>;
      case 'APROBADA':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Aprobada</span>;
      case 'RECIBIDA':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Recibida</span>;
      case 'CANCELADA':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Cancelada</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">{estado}</span>;
    }
  };

  const calculateTotal = (items: OrdenCompraItem[]) => {
    return items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0).toFixed(2);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm) || 
    o.proveedor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Órdenes de Compra</h1>
          <p className="text-slate-400">Gestiona las compras a proveedores y la recepción de mercancía.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
        >
          <Plus size={20} />
          <span>Nueva Orden</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID o Proveedor..."
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
                <th scope="col" className="px-6 py-4">ID Orden</th>
                <th scope="col" className="px-6 py-4">Proveedor</th>
                <th scope="col" className="px-6 py-4">Fecha Creación</th>
                <th scope="col" className="px-6 py-4">Total</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando órdenes...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <ShoppingCart size={48} className="mx-auto mb-3 opacity-20" />
                    No se encontraron órdenes de compra
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-white">#{order.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{order.proveedor?.nombre || 'Desconocido'}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(order.fechaCreacion).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">${calculateTotal(order.items)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.estado)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setDetailsOrder(order)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Ver Detalles"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {order.estado !== 'RECIBIDA' && order.estado !== 'CANCELADA' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(order.id, 'RECIBIDA')}
                              className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Marcar como Recibida (Ingresar Inventario)"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(order.id, 'CANCELADA')}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Cancelar Orden"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
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
        <PurchaseOrderForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            fetchOrders();
          }} 
        />
      )}

      {detailsOrder && (
        <OrderDetailsModal 
          order={detailsOrder} 
          onClose={() => setDetailsOrder(null)} 
        />
      )}
    </div>
  );
};

export default Purchases;
