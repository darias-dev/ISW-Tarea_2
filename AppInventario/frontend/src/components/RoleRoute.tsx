import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Verificando sesión...</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin has global universal access, bypassing specific restrictions
  if (user.rol === 'ADMIN' || allowedRoles.includes(user.rol)) {
    return <>{children}</>;
  }

  // Access Denied Render
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-300 min-h-[60vh]">
      <div className="relative">
         <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
         <div className="bg-slate-800 p-6 rounded-full border border-red-500/30 relative z-10 shadow-2xl">
            <ShieldAlert size={64} className="text-red-500" />
         </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Acceso Restringido</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Tu rol actual (<span className="text-red-400 font-bold">{user.rol}</span>) no tiene los permisos operativos necesarios para visualizar o interactuar con este módulo.
        </p>
      </div>
      <button 
        onClick={() => window.history.back()}
        className="mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 px-6 rounded-xl border border-slate-600 transition-colors shadow-lg"
      >
        <ArrowLeft size={18} />
        Regresar al Panel Anterior
      </button>
    </div>
  );
};

export default RoleRoute;
