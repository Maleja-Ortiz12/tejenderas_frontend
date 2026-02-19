import { useState, useEffect } from 'react';
import api from '../../api';
import AdminLayout from '../../components/AdminLayout';
import { formatCurrency } from '../../utils/format';

interface SaleItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: {
        category: string;
        name: string;
    }
}

interface Sale {
    id: number;
    type: 'pos' | 'order' | 'contract_payment';
    created_at: string;
    total: number;
    payment_method: string;
    user: {
        name: string;
    };
    telas_total?: number;
    perfumeria_total?: number;
    items?: SaleItem[];
    details?: string; // For contract notes
}

export default function SalesRegistry() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [stats, setStats] = useState({ total: 0, telas: 0, perfumeria: 0, orders_total: 0, contracts_total: 0 });
    const [filter, setFilter] = useState('daily'); // 'daily', 'all', 'weekly', 'monthly'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSales();
    }, [filter]);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/sales', {
                params: { period: filter }
            });
            // New structure: { stats: {...}, sales: { data: [...] } }
            setSales(response.data.sales.data);
            setStats(response.data.stats);
        } catch (err) {
            setError('Error al cargar el registro de ventas');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const translatePaymentMethod = (method: string) => {
        switch (method) {
            case 'cash': return 'Efectivo';
            case 'card': return 'Tarjeta';
            case 'transfer': return 'Transferencia';
            default: return method;
        }
    };

    return (
        <AdminLayout
            title="Registro de Ventas"
            subtitle="Historial y desglose por categoría"
            titleWrapperClassName="translate-x-6 md:translate-x-12"
            mainWrapperClassName="px-12 md:px-14"
        >
            <div className="flex flex-col items-center w-full pb-10 md:pb-0">
                <div className="h-6 md:h-8"></div>
                {/* Filters */}
                <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-10 mt-6 px-4">
                    <h2 className="text-2xl font-black text-graphite uppercase tracking-tighter text-center md:text-left">Listado de Ventas</h2>
                    <div className="h-3 md:h-3"></div>
                    <div className="flex flex-wrap bg-white rounded-xl border-2 border-graphite p-1 gap-1 w-full md:w-auto justify-center md:justify-start">
                        <button
                            onClick={() => setFilter('daily')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${filter === 'daily' ? 'bg-indigo-500 text-white shadow-md border-2 border-graphite' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Hoy
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${filter === 'all' ? 'bg-graphite text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('weekly')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${filter === 'weekly' ? 'bg-lime text-graphite shadow-md border-2 border-graphite' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Semanal
                        </button>
                        <button
                            onClick={() => setFilter('monthly')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${filter === 'monthly' ? 'bg-teal text-white shadow-md border-2 border-graphite' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Mensual
                        </button>
                    </div>
                </div>

                <div className="h-6 md:h-8"></div>

                {/* Stats Cards */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-2 mb-10 px-4 justify-items-center md:justify-items-stretch">
                    <div className="bg-graphite text-white rounded-md md:rounded-lg shadow-lg border-4 border-black relative overflow-hidden group text-center flex flex-col items-center justify-center w-[80%] md:w-auto mx-auto p-4 md:p-5">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Global</h3>
                        <p className="text-base md:text-xl font-black">{formatCurrency(stats.total)}</p>
                        <p className="text-[10px] text-gray-400 mt-1">POS + Pedidos</p>
                    </div>

                    <div className="bg-pink-hot text-white rounded-md md:rounded-lg shadow-lg border-4 border-black relative overflow-hidden group text-center flex flex-col items-center justify-center w-[80%] md:w-auto mx-auto p-4 md:p-5">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-pink-200 mb-1">Telas / Lanas</h3>
                        <p className="text-base md:text-xl font-black">{formatCurrency(stats.telas)}</p>
                        <p className="text-[10px] text-pink-200 mt-1">Solo POS</p>
                    </div>

                    <div className="bg-purple-600 text-white rounded-md md:rounded-lg shadow-lg border-4 border-black relative overflow-hidden group text-center flex flex-col items-center justify-center w-[80%] md:w-auto mx-auto p-4 md:p-5">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-purple-200 mb-1">Perfumería</h3>
                        <p className="text-base md:text-xl font-black">{formatCurrency(stats.perfumeria)}</p>
                        <p className="text-[10px] text-purple-200 mt-1">Solo POS</p>
                    </div>

                    <div className="bg-blue-600 text-white rounded-md md:rounded-lg shadow-lg border-4 border-black relative overflow-hidden group text-center flex flex-col items-center justify-center w-[80%] md:w-auto mx-auto p-4 md:p-5">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-blue-200 mb-1">Pedidos Web</h3>
                        <p className="text-base md:text-xl font-black">{formatCurrency(stats.orders_total || 0)}</p>
                    </div>

                    <div className="bg-orange-500 text-white rounded-md md:rounded-lg shadow-lg border-4 border-black relative overflow-hidden group text-center flex flex-col items-center justify-center w-[80%] md:w-auto mx-auto p-4 md:p-5">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-orange-200 mb-1">Contratos</h3>
                        <p className="text-base md:text-xl font-black">{formatCurrency(stats.contracts_total || 0)}</p>
                    </div>
                </div>

                {error && (
                    <div className="w-full max-w-5xl mx-auto bg-red-pink/10 border-2 border-red-pink text-red-pink px-4 py-3 rounded-xl mb-6 font-bold">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-graphite border-t-pink-hot rounded-full mx-auto mb-4"></div>
                    </div>
                ) : (
                    <div className="w-full max-w-5xl mx-auto bg-white rounded-md md:rounded-lg border-4 border-graphite shadow-xl" style={{padding: '16px'}}>
                        <div className="overflow-x-auto p-2 md:p-4">
                            <table className="w-full">
                                <thead className="bg-graphite text-white">
                                    <tr>
                                        <th className="px-8 py-6 text-left text-lg font-black uppercase tracking-wider min-w-[180px]">Fecha / ID</th>
                                        <th className="px-8 py-6 text-center text-lg font-black uppercase tracking-wider min-w-[150px]">Vendedor</th>
                                        <th className="px-4 py-6 text-center text-lg font-black uppercase tracking-wider min-w-[150px]">Método</th>
                                        <th className="px-4 py-6 text-center text-lg font-black uppercase tracking-wider text-pink-hot min-w-[120px]">Telas</th>
                                        <th className="px-4 py-6 text-center text-lg font-black uppercase tracking-wider text-purple-400 min-w-[120px]">Perfumería</th>
                                        <th className="px-8 py-6 text-right text-lg font-black uppercase tracking-wider min-w-[120px]">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-4 divide-gray-100">
                                    {sales.map((sale) => (
                                        <tr key={`${sale.type}-${sale.id}`} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-graphite">{formatDate(sale.created_at)}</div>
                                                <div className="text-sm text-gray-400 font-mono">
                                                    {sale.type === 'pos' && `POS #${sale.id.toString().padStart(6, '0')}`}
                                                    {sale.type === 'order' && `WEB #${sale.id.toString().padStart(6, '0')}`}
                                                    {sale.type === 'contract_payment' && `ABONO #${sale.id.toString().padStart(6, '0')}`}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-gray-600 text-center">
                                                {sale.type === 'order' ? `Cliente: ${sale.user?.name}` : (sale.user?.name || 'Sistema')}
                                                {sale.type === 'contract_payment' && <div className="text-xs text-orange-500">{sale.details}</div>}
                                            </td>
                                            <td className="px-4 py-6 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold uppercase ${sale.payment_method === 'web' ? 'bg-blue-100 text-blue-700' :
                                                    sale.type === 'contract_payment' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-200 text-gray-700'
                                                    }`}>
                                                    {translatePaymentMethod(sale.payment_method)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-6 text-center">
                                                {sale.type === 'pos' ? (
                                                    <span className="font-black text-xl text-pink-hot">{formatCurrency(sale.telas_total || 0)}</span>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-6 text-center">
                                                {sale.type === 'pos' ? (
                                                    <span className="font-black text-xl text-purple-600">{formatCurrency(sale.perfumeria_total || 0)}</span>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="font-black text-2xl text-graphite">{formatCurrency(sale.total)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {sales.length === 0 && (
                            <div className="p-12 text-center text-gray-400 font-bold text-xl">
                                No hay ventas registradas aún.
                            </div>
                        )}
                    </div>
                )}
                <div className="h-12 md:hidden"></div>
            </div>
        </AdminLayout>
    );
}
