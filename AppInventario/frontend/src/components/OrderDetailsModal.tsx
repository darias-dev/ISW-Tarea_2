import React from 'react';
import { X, Calendar, User, Package, DollarSign } from 'lucide-react';
import type { OrdenCompra } from '../pages/Purchases';

interface OrderDetailsModalProps {
  order: OrdenCompra;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const calculateTotal = () => {
    return order.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0).toFixed(2);
  };

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'APROBADA': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'RECIBIDA': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'CANCELADA': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white">Orden #{order.id}</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(order.estado)}`}>
                {order.estado}
              </span>
            </div>
            <p className="text-sm text-slate-400">Detalles de la compra</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <User size={16} />
                <span className="text-xs font-semibold uppercase">Proveedor</span>
              </div>
              <p className="text-white font-medium">{order.proveedor?.nombre || 'N/A'}</p>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Calendar size={16} />
                <span className="text-xs font-semibold uppercase">Fechas</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-300"><span className="text-slate-500 mr-2">Creada:</span> {new Date(order.fechaCreacion).toLocaleDateString()}</p>
                {order.fechaRecepcion && (
                  <p className="text-sm text-green-400"><span className="text-slate-500 mr-2">Recibida:</span> {new Date(order.fechaRecepcion).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-300 mb-3 font-medium">
              <Package size={18} />
              <h3>Artículos de la Orden</h3>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                    <th className="px-4 py-3 text-right">Precio Unitario</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{item.producto?.nombre}</div>
                        <div className="text-xs text-slate-500">SKU: #{item.producto?.sku} | {item.producto?.unidad}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{item.cantidad}</td>
                      <td className="px-4 py-3 text-right font-mono">${item.precioUnitario.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400">
                        ${(item.cantidad * item.precioUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/80 rounded-b-2xl flex justify-between items-center">
          <div className="text-slate-400 text-sm">
            Total {order.items.length} artículo(s)
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Total</span>
            <div className="flex items-center gap-1 text-2xl font-bold text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-lg border border-emerald-400/20">
              <DollarSign size={20} />
              {calculateTotal()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailsModal;
