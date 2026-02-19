import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    centerTitle?: boolean;
    titleWrapperClassName?: string;
    mainWrapperClassName?: string;
    headerActions?: ReactNode;
    actionsWrapperClassName?: string;
    titleSectionClassName?: string;
}

export default function AdminLayout({ children, title, subtitle, actions, centerTitle, titleWrapperClassName, mainWrapperClassName, headerActions, actionsWrapperClassName, titleSectionClassName }: AdminLayoutProps) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Dashboard' },
        { path: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', label: 'Pedidos Web' },
        { path: '/admin/pos', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', label: 'Punto de Venta' },
        { path: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Inventario' },
        { path: '/admin/home-carousel', icon: 'M4 6h16M4 12h16M4 18h7', label: 'Carrusel Home' },
        { path: '/admin/sales-registry', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Registro Ventas' },
        { path: '/admin/contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Contratos' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-pink-hot selection:text-white">

            {/* Header / Sidebar Container */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-graphite text-white 
                    transform transition-transform duration-300 ease-in-out 
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 md:static md:w-full md:h-28 md:flex md:items-center md:justify-between md:px-12 md:py-6
                `}
            >
                <div className="p-8 h-full flex flex-col md:p-0 md:h-auto md:flex-row md:flex-wrap md:items-center md:flex-1 md:gap-6">

                    {/* Brand */}
                    <div className="flex items-center gap-4 mb-12 md:mb-0">
                        <div className="p-1">
                            <Logo className="w-20 h-20" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter leading-none">ENTRE LANAS</span>
                            <span className="text-sm font-bold text-pink-hot tracking-widest leading-none">Y FRAGANCIAS</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-4 md:space-y-0 md:flex md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-x-2 md:gap-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`
                                    flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group 
                                    md:py-2 md:px-3 md:gap-2
                                    ${location.pathname.startsWith(item.path)
                                        ? 'bg-pink-hot text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] translate-x-[2px] translate-y-[2px]'
                                        : 'hover:bg-gray-800'
                                    }
                                `}
                            >
                                <svg className={`w-6 h-6 md:w-5 md:h-5 ${location.pathname.startsWith(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                <span className={`font-bold md:text-sm ${location.pathname.startsWith(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="mt-8 pt-8 border-t border-gray-700 md:mt-0 md:pt-0 md:border-t-0 md:flex md:items-center md:gap-3 md:shrink-0">
                        {headerActions && (
                            <div className="mb-4 md:mb-0 md:flex md:items-center">
                                {headerActions}
                            </div>
                        )}
                        <div className="flex items-center gap-3 px-4 mb-6 md:mb-0 md:px-0 md:shrink-0">
                            <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center font-bold text-base md:w-7 md:h-7 md:text-xs">
                                {user?.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0 md:hidden lg:block">
                                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 md:items-center md:gap-1">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-xl transition-colors font-bold md:w-32 md:px-3 md:py-2 md:text-sm"
                                title="Cerrar Sesión"
                            >
                                <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="md:hidden lg:inline">Salir</span>
                            </button>
                            <Link
                                to="/"
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white hover:bg-gray-800 rounded-xl transition-colors font-bold md:w-32 md:px-3 md:py-2 md:text-sm"
                            >
                                <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10h5V14h4v6h5V10" />
                                </svg>
                                <span className="md:hidden lg:inline">Ver Home</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 transition-all duration-300">
                {/* Mobile Header (Hamburger) */}
                <div className="md:hidden bg-graphite text-white p-6 flex items-center justify-between sticky top-0 z-40 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl">
                            <Logo className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-black tracking-tighter text-xl">ENTRE LANAS</span>
                            <span className="text-xs font-bold text-pink-hot tracking-widest">Y FRAGANCIAS</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {headerActions}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Overlay for mobile menu */}
                {isMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>
                )}

                <div className={`p-6 md:p-12 pb-12 md:pb-16 max-w-7xl mx-auto ${mainWrapperClassName || ''}`}>
                    {/* Title Section */}
                    {(title || actions) && (
                        <div className={`flex flex-col md:flex-row justify-between gap-4 mb-8 ${centerTitle ? 'items-center text-center' : 'md:items-center'} ${titleSectionClassName || ''}`.trim()}>
                            <div className={`${centerTitle ? 'w-full md:w-auto md:flex-1 md:text-center' : ''} ${titleWrapperClassName || ''}`}>
                                {title && <h1 className="text-3xl md:text-4xl font-black text-graphite uppercase tracking-tighter">{title}</h1>}
                                {subtitle && <p className="text-gray-500 font-medium text-base md:text-lg">{subtitle}</p>}
                            </div>
                            {actions && (
                                <div className={`w-full md:w-auto mb-6 md:mb-0 flex justify-center md:block ${actionsWrapperClassName || ''}`.trim()}>
                                    {actions}
                                </div>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </main>
        </div>
    );
}
