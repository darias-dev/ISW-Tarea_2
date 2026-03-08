import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, ShoppingCart, LogOut, Users, ArrowDownUp, Truck, BarChart2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        document.title = 'Panel Principal - AppInventario';
        return 'Panel Principal';
      case '/products':
        document.title = 'Productos - AppInventario';
        return 'Productos';
      case '/inventory':
        document.title = 'Inventario - AppInventario';
        return 'Inventario / Movimientos';
      case '/users':
        document.title = 'Usuarios - AppInventario';
        return 'Usuarios';
      case '/purchases':
        document.title = 'Compras - AppInventario';
        return 'Compras';
      case '/providers':
        document.title = 'Proveedores - AppInventario';
        return 'Proveedores';
      case '/reports':
        document.title = 'Reportes - AppInventario';
        return 'Business Intelligence';
      default:
        document.title = 'AppInventario';
        return 'Sistema Inventario';
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            AppInventario
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <LayoutDashboard size={20} />
            Panel Principal
          </NavLink>
          
          {(user?.rol === 'ADMIN' || user?.rol === 'ALMACEN' || user?.rol === 'COMPRADOR') && (
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Package size={20} />
              Productos
            </NavLink>
          )}

          {(user?.rol === 'ADMIN' || user?.rol === 'ALMACEN') && (
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <ArrowDownUp size={20} />
              Inventario
            </NavLink>
          )}

          {(user?.rol === 'ADMIN' || user?.rol === 'COMPRADOR') && (
            <NavLink
              to="/purchases"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <ShoppingCart size={20} />
              Compras
            </NavLink>
          )}

          {(user?.rol === 'ADMIN' || user?.rol === 'COMPRADOR') && (
            <NavLink
              to="/providers"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Truck size={20} />
              Proveedores
            </NavLink>
          )}

          {(user?.rol === 'ADMIN' || user?.rol === 'AUDITOR') && (
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <BarChart2 size={20} />
              Reportes
            </NavLink>
          )}

          {user?.rol === 'ADMIN' && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Users size={20} />
              Usuarios
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-slate-800 border-b border-slate-700 px-8 py-4 sticky top-0 z-10 flex justify-between items-center backdrop-blur-md bg-opacity-80">
          <h2 className="text-xl font-semibold text-slate-200">{getPageTitle()}</h2>
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-4 focus:outline-none hover:bg-slate-700/50 p-2 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">
                {user?.nombre?.substring(0,2).toUpperCase() || 'AD'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-slate-200 font-medium text-sm leading-tight">{user?.nombre || 'Administrador'}</span>
                <span className="text-slate-400 text-xs font-mono">{user?.rol || ''}</span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 z-50">
                <button 
                  onClick={() => {
                     setIsProfileMenuOpen(false);
                     logout();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700/80 hover:text-red-300 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
