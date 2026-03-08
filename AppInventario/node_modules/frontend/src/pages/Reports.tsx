import { useState } from 'react';
import axios from 'axios';
import { FileText, Download, Calendar, BarChart2, AlertTriangle, ArrowDownUp } from 'lucide-react';

type ReportType = 'inventory' | 'low-stock';

const Reports = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('inventory');
  
  // Date states for Inventory Report
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReportData([]);
    
    try {
      let endpoint = '';
      if (activeTab === 'inventory') {
        endpoint = `http://localhost:3000/api/reports/inventory?startDate=${startDate}&endDate=${endDate}`;
      } else if (activeTab === 'low-stock') {
        endpoint = `http://localhost:3000/api/reports/low-stock`;
      }

      const response = await axios.get(endpoint);
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.error || 'Falló la generación del reporte. Verifique la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
     if (reportData.length === 0) return;

     let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Byte Order Mark for Excel
     let headers = [];

     if (activeTab === 'inventory') {
        headers = ["Fecha", "Tipo", "Producto SKU", "Producto Nombre", "Cantidad", "Almacén Origen", "Almacén Destino", "Usuario"];
        csvContent += headers.join(",") + "\r\n";
        
        reportData.forEach(row => {
          const arr = [
            new Date(row.timestamp).toLocaleString().replace(/,/g, ''),
            row.tipo,
            row.producto.sku,
            `"${row.producto.nombre}"`,
            row.cantidad,
            `"${row.almacenOrigen?.nombre || 'N/A'}"`,
            `"${row.almacenDestino?.nombre || 'N/A'}"`,
            `"${row.usuario.nombre}"`
          ];
          csvContent += arr.join(",") + "\r\n";
        });
     } else if (activeTab === 'low-stock') {
        headers = ["SKU", "Producto", "Categoría", "Stock Actual", "Mínimo Requerido", "Déficit Unitario"];
        csvContent += headers.join(",") + "\r\n";

        reportData.forEach(row => {
          const arr = [
            row.sku,
            `"${row.nombre}"`,
            `"${row.categoria}"`,
            row.cantidadActual,
            row.stockMinimo,
            row.deficit
          ];
          csvContent += arr.join(",") + "\r\n";
        });
     }

     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `Reporte_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
           <BarChart2 className="text-indigo-400" /> Centro de Reportes
         </h1>
         <p className="text-slate-400 text-sm mt-1">Extrae estadísticas y exporta datos de vitales para análisis</p>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-slate-700">
           <button 
             onClick={() => { setActiveTab('inventory'); setReportData([]); }}
             className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
           >
             <ArrowDownUp size={18} />
             Historial de Movimientos
           </button>
           <button 
             onClick={() => { setActiveTab('low-stock'); setReportData([]); }}
             className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${activeTab === 'low-stock' ? 'bg-amber-600/10 text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
           >
             <AlertTriangle size={18} />
             Alertas de Quiebre de Stock
           </button>
        </div>

        {/* Toolbar Body */}
        <div className="p-6 bg-slate-900/50 flex flex-col md:flex-row gap-4 justify-between items-end border-b border-slate-700">
           <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
             {activeTab === 'inventory' && (
               <>
                 <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                     <Calendar size={14} /> Fecha Inicio
                   </label>
                   <input 
                     type="date"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     className="bg-slate-800 border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                     <Calendar size={14} /> Fecha Fin
                   </label>
                   <input 
                     type="date"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     className="bg-slate-800 border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                   />
                 </div>
               </>
             )}
             
             {activeTab === 'low-stock' && (
                <div className="py-2 text-sm text-slate-400 max-w-md">
                   Proyecta el inventario general a nivel global sumando todos los lotes de productos y los confronta automáticamente contra el Stock Mínimo requerido pre-configurado.
                </div>
             )}
           </div>

           <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
             <button
               onClick={fetchReport}
               disabled={loading}
               className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-6 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
             >
               {loading ? (
                 <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
               ) : (
                 <FileText size={18} />
               )}
               {loading ? 'Generando...' : 'Generar Reporte'}
             </button>
             
             <button
               onClick={exportToCSV}
               disabled={reportData.length === 0}
               className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-6 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:bg-slate-700"
             >
               <Download size={18} />
               CSV (Excel)
             </button>
           </div>
        </div>

        {/* Results Area */}
        <div className="p-0 overflow-x-auto min-h-[300px]">
           {error && (
             <div className="m-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-3">
                <AlertTriangle /> {error}
             </div>
           )}

           {!error && reportData.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500 opacity-60">
                <BarChart2 size={48} className="mb-4" />
                <p>Configura los parámetros arriba y presiona "Generar Reporte"</p>
             </div>
           )}

           {reportData.length > 0 && activeTab === 'inventory' && (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Fecha Timestamp</th>
                    <th className="px-6 py-4">Tipo Op</th>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4 text-center">Cant.</th>
                    <th className="px-6 py-4">Orígen ➣ Destino</th>
                    <th className="px-6 py-4 text-right">Autor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                   {reportData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-700/40">
                         <td className="px-6 py-3 font-mono text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                         <td className="px-6 py-3">
                           <span className={`px-2 py-1 text-xs font-bold rounded-md border 
                              ${row.tipo === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                row.tipo === 'SALIDA' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                             {row.tipo}
                           </span>
                         </td>
                         <td className="px-6 py-3">
                            <div className="font-semibold text-slate-200">{row.producto.nombre}</div>
                            <div className="text-xs text-indigo-400">SKU: {row.producto.sku}</div>
                         </td>
                         <td className="px-6 py-3 text-center font-bold">{row.cantidad}</td>
                         <td className="px-6 py-3 text-xs text-slate-400">
                           {row.almacenOrigen ? row.almacenOrigen.nombre : <span className="text-slate-600">--</span>} 
                           <span className="mx-2">➣</span> 
                           {row.almacenDestino ? row.almacenDestino.nombre : <span className="text-slate-600">--</span>}
                         </td>
                         <td className="px-6 py-3 text-right text-xs">
                            {row.usuario.nombre}
                         </td>
                      </tr>
                   ))}
                </tbody>
              </table>
           )}

           {reportData.length > 0 && activeTab === 'low-stock' && (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">SKU Prod.</th>
                    <th className="px-6 py-4">Ítem / Categoría</th>
                    <th className="px-6 py-4">Config. Mínima</th>
                    <th className="px-6 py-4 text-center">Stock Actual</th>
                    <th className="px-6 py-4 text-right">Déficit Alerta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                   {reportData.map((row) => (
                      <tr key={row.sku} className="hover:bg-slate-700/40">
                         <td className="px-6 py-4 font-mono text-indigo-400">{row.sku}</td>
                         <td className="px-6 py-4">
                            <div className="font-semibold text-slate-200">{row.nombre}</div>
                            <div className="text-xs text-slate-500">{row.categoria}</div>
                         </td>
                         <td className="px-6 py-4 text-slate-400">{row.stockMinimo} unidades</td>
                         <td className="px-6 py-4 text-center font-bold text-amber-500">
                            {row.cantidadActual}
                         </td>
                         <td className="px-6 py-4 text-right">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              <AlertTriangle size={12} />
                              -{row.deficit} Pzs
                           </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
              </table>
           )}
        </div>

      </div>
    </div>
  );
};

export default Reports;
