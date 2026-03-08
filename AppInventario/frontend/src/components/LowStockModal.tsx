import React from 'react';
import { X, Package, AlertTriangle } from 'lucide-react';

export interface LowStockItem {
  sku: number;
  nombre: string;
  loteId: number;
  loteNumero: string;
  cantidad: number;
  minimo: number;
  unidad: string;
}

interface LowStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LowStockItem[];
}

const LowStockModal: React.FC<LowStockModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Detalle de Alertas por Stock Bajo</h2>
              <p className="text-sm text-slate-400">Productos que alcanzaron o perforaron su nivel mínimo.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-0 flex-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Package size={48} className="mb-4 opacity-30" />
              <p className="text-lg">Todo está en orden.</p>
              <p className="text-sm">No hay productos en nivel crítico actualmente.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-xs uppercase font-semibold text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th scope="col" className="px-6 py-4">SKU / Producto</th>
                  <th scope="col" className="px-6 py-4">Lote Interno</th>
                  <th scope="col" className="px-6 py-4 text-center">Stock Mínimo</th>
                  <th scope="col" className="px-6 py-4 text-center">Stock Actual</th>
                  <th scope="col" className="px-6 py-4 text-right">Déficit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {items.map((item, idx) => (
                  <tr key={`${item.loteId}-${idx}`} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.nombre}</div>
                      <div className="text-xs font-mono text-indigo-400">#{item.sku}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.loteNumero}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-xs font-semibold">
                        {item.minimo} {item.unidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.cantidad === 0 ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {item.cantidad} {item.unidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.minimo - item.cantidad > 0 ? (
                        <span className="font-mono text-xs text-red-400">-{item.minimo - item.cantidad}</span>
                      ) : (
                        <span className="font-mono text-xs text-slate-500">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700 bg-slate-900/30 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockModal;
