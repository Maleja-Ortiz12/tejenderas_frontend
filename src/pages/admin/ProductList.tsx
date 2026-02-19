import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import api from '../../api';
import AdminLayout from '../../components/AdminLayout';
import { formatCurrency } from '../../utils/format';

interface Product {
    id: number;
    barcode: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    image: string | null;
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [currentCategory, setCurrentCategory] = useState('telas');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm)
    );

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: selectedProduct ? selectedProduct.name : 'Producto',
    });

    useEffect(() => {
        if (selectedProduct) {
            handlePrint();
            // Reset selection after print dialog opens (approximate)
            setTimeout(() => setSelectedProduct(null), 1000);
        }
    }, [selectedProduct]);

    const onPrintClick = (product: Product) => {
        setSelectedProduct(product);
    };

    useEffect(() => {
        fetchProducts();
    }, [currentCategory]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/products', {
                params: { category: currentCategory }
            });
            setProducts(response.data);
        } catch (err) {
            setError('Error al cargar los productos');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await api.delete(`/admin/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            setError('Error al eliminar el producto');
            console.error(err);
        }
    };

    return (
        <AdminLayout
            title="Inventario"
            subtitle="Gestiona tus productos"
            titleWrapperClassName="translate-x-6 md:translate-x-12"
            actions={
                <Link
                    to="/admin/products/new"
                    className="px-6 py-3 bg-pink-hot hover:bg-pink-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-graphite shadow-[4px_4px_0px_0px_#333] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#333] transition-all flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Nuevo Producto
                </Link>
            }
        >

            <div className="flex flex-col items-center w-full">
                {/* Title Spacer */}
                <div className="h-6 md:h-8 w-full block"></div>

                {error && (
                    <div className="w-[90%] md:w-full max-w-6xl mx-auto bg-red-pink/10 border-2 border-red-pink text-red-pink px-4 py-3 rounded-xl mb-6 font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                {/* Category Tabs */}
                <div className="w-[90%] md:w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-4 mb-8 md:mb-16">
                    <button
                        onClick={() => setCurrentCategory('telas')}
                        className={`flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all border-b-8 ${currentCategory === 'telas'
                            ? 'bg-pink-hot text-white border-pink-700 shadow-[4px_4px_0px_0px_#333] translate-y-[-2px]'
                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        🧵 Telas
                    </button>
                    <button
                        onClick={() => setCurrentCategory('perfumeria')}
                        className={`flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all border-b-8 ${currentCategory === 'perfumeria'
                            ? 'bg-purple-600 text-white border-purple-800 shadow-[4px_4px_0px_0px_#333] translate-y-[-2px]'
                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        ✨ Perfumería
                    </button>
                </div>

                {/* Search Input */}
                <div className="w-[90%] md:w-full max-w-6xl mx-auto mb-8">
                    <div className="relative">
                        {!searchTerm && !isSearchFocused && (
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                        )}
                        <input
                            type="text"
                            placeholder={searchTerm || isSearchFocused ? 'Buscar por nombre o código...' : ''}
                            className="w-full pl-12 pr-4 py-4 bg-white border-4 border-graphite rounded-2xl text-lg font-bold placeholder-gray-400 focus:outline-none focus:border-pink-hot transition-colors shadow-[4px_4px_0px_0px_#333]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-graphite border-t-pink-hot rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Cargando productos...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="w-[90%] md:w-full max-w-6xl mx-auto bg-white rounded-lg border-4 border-dashed border-gray-300 p-14 md:p-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-graphite mb-2 uppercase">
                            {searchTerm ? 'No se encontraron resultados' : 'No hay productos'}
                        </h3>
                        <p className="text-gray-500 mb-8 font-medium">
                            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando tu primer producto al inventario'}
                        </p>
                        {!searchTerm && (
                            <Link
                                to="/admin/products/new"
                                className="inline-block px-8 py-4 bg-teal hover:bg-teal-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-graphite shadow-[4px_4px_0px_0px_#333] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#333] transition-all"
                            >
                                Agregar producto
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="w-[90%] md:w-full max-w-6xl mx-auto bg-white rounded-lg border-4 border-graphite shadow-xl" style={{padding: '16px'}}>
                        <div className="overflow-x-auto p-2 md:p-4">
                            <table className="w-full">
                                <thead className="bg-graphite text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Código</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                                                        {product.image ? (
                                                            <img
                                                                src={`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '')}/storage/${product.image}`}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-xl">🧶</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-bold text-graphite group-hover:text-pink-hot transition-colors">{product.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {product.barcode}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-teal">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${product.stock > 10
                                                    ? 'bg-green-100 text-green-800'
                                                    : product.stock > 0
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => onPrintClick(product)}
                                                        className="text-yellow-500 hover:text-yellow-700 p-2"
                                                        title="Imprimir"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                    </button>
                                                    <Link
                                                        to={`/admin/products/${product.id}/edit`}
                                                        className="text-blue-600 hover:text-blue-900 p-2"
                                                        title="Editar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-600 hover:text-red-900 p-2"
                                                        title="Eliminar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Hidden print area */}
                        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                            <div ref={printRef} className="p-4 flex flex-col items-center justify-center bg-white min-w-[300px]">
                                {selectedProduct && (
                                    <>
                                        <h4 className="font-bold text-lg mb-2 text-center">{selectedProduct.name}</h4>
                                        <Barcode
                                            value={selectedProduct.barcode || '000000000000'}
                                            format="CODE128"
                                            width={2}
                                            height={60}
                                            fontSize={16}
                                            displayValue={true}
                                        />
                                        <p className="mt-2 text-sm text-center max-w-[250px] truncate">{selectedProduct.description}</p>
                                        <p className="text-xl font-bold mt-1">${selectedProduct.price}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div >
                )
                }
                <div className="h-12 md:h-16"></div>
            </div>
        </AdminLayout >
    );
}
