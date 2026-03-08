import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, TrendingUp, AlertTriangle, ArrowDownUp, RefreshCw } from 'lucide-react';
import LowStockModal from '../components/LowStockModal';
import type { LowStockItem } from '../components/LowStockModal';
import { useAuth } from '../context/AuthContext';

interface DashboardSummary {
  totalProducts: number;
  inventoryValue: number;
  lowStockAlerts: number;
  lowStockItems: LowStockItem[];
  recentMovements: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const getMovementTypeBadge = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs font-semibold">Entrada</span>;
      case 'SALIDA': return <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-semibold">Salida</span>;
      case 'TRANSFERENCIA': return <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-semibold">Transf.</span>;
      case 'AJUSTE': return <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-xs font-semibold">Ajuste</span>;
      default: return <span className="bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded text-xs font-semibold">{tipo}</span>;
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin text-indigo-500">
          <RefreshCw size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Bienvenido, {user?.nombre || 'Usuario'}</h1>
        <button 
          onClick={fetchSummary}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Actualizar Datos"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden group">
          <div className="relative z-10 transition-transform group-hover:scale-105 duration-300">
            <h3 className="text-indigo-100 font-medium mb-1 drop-shadow-sm">Total Productos</h3>
            <p className="text-4xl font-bold drop-shadow-md">{summary?.totalProducts || 0}</p>
          </div>
          <Package size={100} className="absolute -right-4 -bottom-4 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-slate-400 font-medium mb-1">Valor del Inventario</h3>
              <p className="text-3xl font-bold text-white transition-colors group-hover:text-blue-400">
                {formatCurrency(summary?.inventoryValue || 0)}
              </p>
            </div>
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setIsLowStockModalOpen(true)}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-red-500/50 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-slate-400 font-medium mb-1">Alertas de Stock Bajo</h3>
              <p className={`text-3xl font-bold transition-colors ${summary?.lowStockAlerts && summary.lowStockAlerts > 0 ? 'text-red-400 group-hover:text-red-300' : 'text-emerald-400 group-hover:text-emerald-300'}`}>
                {summary?.lowStockAlerts || 0} lotes
              </p>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${summary?.lowStockAlerts && summary.lowStockAlerts > 0 ? 'bg-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white' : 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl flex flex-col">
           <div className="p-6 border-b border-slate-700 flex justify-between items-center">
             <h3 className="text-xl font-semibold text-white flex items-center gap-2">
               <ArrowDownUp size={20} className="text-indigo-400" />
               Movimientos Recientes
             </h3>
           </div>
           
           <div className="flex-1 overflow-auto">
             {summary?.recentMovements && summary.recentMovements.length > 0 ? (
               <ul className="divide-y divide-slate-700/50">
                 {summary.recentMovements.map((mov) => (
                   <li key={mov.id} className="p-4 hover:bg-slate-700/30 transition-colors flex justify-between items-center">
                     <div>
                       <div className="flex items-center gap-3 mb-1">
                         {getMovementTypeBadge(mov.tipo)}
                         <span className="font-medium text-white">{mov.producto?.nombre}</span>
                       </div>
                       <p className="text-xs text-slate-400 flex gap-4">
                         <span>SKU: #{mov.productoId}</span>
                         <span>{new Date(mov.timestamp).toLocaleString()}</span>
                         {mov.usuario && <span>Por: {mov.usuario.nombre}</span>}
                       </p>
                     </div>
                     <div className="text-right">
                       <span className={`font-mono text-lg font-bold ${mov.tipo === 'ENTRADA' ? 'text-emerald-400' : mov.tipo === 'SALIDA' ? 'text-red-400' : 'text-blue-400'}`}>
                         {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : ''}{mov.cantidad}
                       </span>
                       <span className="text-xs text-slate-500 block">{mov.producto?.unidad}</span>
                     </div>
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="text-slate-400 text-center py-12 flex flex-col items-center">
                 <ArrowDownUp size={48} className="text-slate-600 mb-4 opacity-50" />
                 <p>No hay movimientos recientes para mostrar.</p>
               </div>
             )}
           </div>
           
         </div>
      </div>
      <LowStockModal 
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        items={summary?.lowStockItems || []}
      />
    </div>
  );
};

export default Dashboard;
