import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Archive, Trash2, Edit } from 'lucide-react';
import ProductForm from '../components/ProductForm';

interface Producto {
  sku: number;
  nombre: string;
  descripcion?: string;
  unidad: string;
  precio: number;
  stockMinimo: number;
  categoriaId: number;
  categoria?: { nombre: string };
  proveedor?: { nombre: string };
}

const Products = () => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    axios.get('http://localhost:3000/api/products')
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Producto) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (sku: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await axios.delete(`http://localhost:3000/api/products/${sku}`);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('No se pudo eliminar el producto. Verifica que no tenga movimientos o dependencias.');
      }
    }
  };

  const handleFormSaved = () => {
    setIsFormOpen(false);
    fetchProducts();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Catálogo de Productos</h1>
          <p className="text-slate-400">Gestiona tus productos de inventario, categorías y precios.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700 flex items-center gap-4 shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar productos por nombre o SKU..." 
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">SKU (ID)</th>
                <th scope="col" className="px-6 py-4">Nombre</th>
                <th scope="col" className="px-6 py-4">Categoría</th>
                <th scope="col" className="px-6 py-4">Precio</th>
                <th scope="col" className="px-6 py-4">Stock Mín.</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                       <span>Cargando productos...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Archive size={48} className="text-slate-600 mb-2 opacity-50" />
                      <p className="text-lg">No se encontraron productos</p>
                      <p className="text-sm">Empieza creando tu primer producto.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.sku} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-indigo-400">#{product.sku}</td>
                    <td className="px-6 py-4 font-medium text-white">{product.nombre}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-xs">
                        {product.categoria?.nombre || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">${product.precio.toFixed(2)}</td>
                    <td className="px-6 py-4 text-amber-400 font-medium">Alerta en: {product.stockMinimo} {product.unidad}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors inline-block mr-2"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.sku)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors inline-block"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render the Form Modal conditionally */}
      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => setIsFormOpen(false)} 
          onSaved={handleFormSaved} 
        />
      )}
    </div>
  );
};

export default Products;
