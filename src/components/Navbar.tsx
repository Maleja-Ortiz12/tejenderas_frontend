import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CustomLogo = ({ className = "w-20 h-20" }: { className?: string }) => (
    <Logo className={className} />
);

interface NavbarProps {
    onOpenCart: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isHome = location.pathname === '/';

    return (
        <nav className="border-b-4 border-graphite py-10 max-md:py-6 px-6 md:px-12 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
            <div className="max-w-360 mx-auto flex justify-between items-center">
                <Link to="/" className="group">
                    <div className="flex items-center gap-4">
                        <CustomLogo className="w-20 h-20 group-hover:rotate-12 transition-transform duration-300 max-md:w-14 max-md:h-14" />
                        <div className="flex flex-col">
                            <span className="text-3xl max-md:text-xl font-black tracking-tighter text-graphite leading-none">
                                ENTRE LANAS
                            </span>
                            <span className="text-2xl max-md:text-lg font-bold tracking-widest text-pink-hot leading-none">
                                Y FRAGANCIAS
                            </span>
                        </div>
                    </div>
                </Link>

                <div className="flex items-center gap-4 md:gap-8">
                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex gap-8 items-center border-r-2 border-gray-100 pr-8 mr-2">
                        {isHome ? (
                            <a href="#productos" className="text-sm font-bold text-graphite hover:text-pink-hot transition uppercase tracking-wider">Productos</a>
                        ) : (
                            <Link to="/" className="text-sm font-bold text-graphite hover:text-pink-hot transition uppercase tracking-wider">Productos</Link>
                        )}

                        <Link to="/nosotros" className="text-sm font-bold text-graphite hover:text-pink-hot transition uppercase tracking-wider">Nosotros</Link>

                        {isHome ? (
                            <a href="#contacto" className="text-sm font-bold text-graphite hover:text-pink-hot transition uppercase tracking-wider">Contacto</a>
                        ) : (
                            <Link to="/#contacto" className="text-sm font-bold text-graphite hover:text-pink-hot transition uppercase tracking-wider">Contacto</Link>
                        )}
                    </div>

                    {/* Authenticated User Actions (Desktop) */}
                    {user && (
                        <div className="hidden md:flex items-center gap-6">
                            {user.role === 'admin' ? (
                                <Link to="/admin/dashboard" className="text-sm font-bold text-pink-hot hover:text-graphite uppercase tracking-wider border-2 border-pink-hot px-4 py-1 rounded-full transition-colors">
                                    Ir al Panel
                                </Link>
                            ) : (
                                <Link to="/my-orders" className="text-sm font-bold text-gray-500 hover:text-pink-hot uppercase tracking-wider">
                                    Mis Pedidos
                                </Link>
                            )}
                            <span className="text-sm font-bold text-graphite uppercase tracking-wider hidden lg:inline">Hola, {user.name.split(' ')[0]}</span>
                        </div>
                    )}

                    {/* Cart Button (Always visible logic for Client/Guest) */}
                    {(user?.role === 'client' || !user) && (
                        <button
                            onClick={onOpenCart}
                            className="relative p-2 text-graphite hover:text-pink-hot transition"
                        >
                            <svg className="w-8 h-8 max-md:w-7 max-md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-pink-hot text-white text-[10px] md:text-xs font-black w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Auth Toggle (Login / Logout - Desktop) */}
                    <div className="hidden md:block">
                        {user ? (
                            <button
                                onClick={logout}
                                className="text-sm font-bold text-red-500 hover:text-red-700 uppercase tracking-wider border-2 border-red-100 hover:border-red-500 rounded-full px-4 py-1 transition-all"
                            >
                                Salir
                            </button>
                        ) : (
                            <Link to="/login" className="px-10 py-4 bg-pink-hot text-white font-black uppercase tracking-wider rounded-xl hover:bg-graphite transition-all border-4 border-graphite shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                                Ingresar
                            </Link>
                        )}
                    </div>

                    {/* Universal Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-2"
                    >
                        <span className={`w-8 h-1 bg-graphite rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                        <span className={`w-8 h-1 bg-graphite rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-8 h-1 bg-graphite rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute right-6 top-full mt-2 w-56 border-4 border-graphite rounded-3xl bg-white shadow-[8px_8px_0px_0px_rgba(51,51,51,1)] overflow-hidden animate-fadeIn">
                    <div className="flex flex-col p-4 gap-2">
                        {/* Navigation Links */}
                        <div className="flex flex-col gap-1 border-b-2 border-gray-100 pb-3 mb-2">
                            {isHome ? (
                                <a href="#productos" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-lg font-black uppercase tracking-widest text-graphite hover:bg-pink-hot hover:text-white rounded-xl transition-all">Productos</a>
                            ) : (
                                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-lg font-black uppercase tracking-widest text-graphite hover:bg-pink-hot hover:text-white rounded-xl transition-all">Productos</Link>
                            )}
                            <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-lg font-black uppercase tracking-widest text-graphite hover:bg-pink-hot hover:text-white rounded-xl transition-all">Nosotros</Link>
                            {isHome ? (
                                <a href="#contacto" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-lg font-black uppercase tracking-widest text-graphite hover:bg-pink-hot hover:text-white rounded-xl transition-all">Contacto</a>
                            ) : (
                                <Link to="/#contacto" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-lg font-black uppercase tracking-widest text-graphite hover:bg-pink-hot hover:text-white rounded-xl transition-all">Contacto</Link>
                            )}
                        </div>

                        {/* Auth Specific Links */}
                        {user ? (
                            <div className="flex flex-col gap-2">
                                <div className="px-4 py-2 bg-gray-50 rounded-xl mb-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Conectado como</p>
                                    <p className="text-sm font-black text-graphite truncate">{user.name}</p>
                                </div>
                                {user.role === 'admin' ? (
                                    <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-black uppercase tracking-widest text-pink-hot border-2 border-pink-hot rounded-xl text-center">
                                        Ir al Panel
                                    </Link>
                                ) : (
                                    <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-black uppercase tracking-widest text-gray-500 border-2 border-gray-200 rounded-xl text-center">
                                        Mis Pedidos
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        logout();
                                    }}
                                    className="px-4 py-3 text-sm font-black uppercase tracking-widest text-red-500 border-2 border-red-500 rounded-xl mt-1"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-4 bg-pink-hot text-white font-black uppercase tracking-widest text-center rounded-xl border-4 border-graphite shadow-[4px_4px_0px_0px_rgba(51,51,51,1)]"
                            >
                                Ingresar
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
