import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import toast from 'react-hot-toast';

import api from '../api';
import Logo from '../components/Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from '../components/CartDrawer';

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image?: string | null;
    category?: string;
    brand?: string;
    subcategory?: string;
    is_promo?: boolean;
    is_combo?: boolean;
}

interface HeroBanner {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    promoText: string;
    promoLink: string;
    imageUrl: string;
    bgClass: string;
    textClass: string;
}

const CustomLogo = ({ className = "w-20 h-20" }: { className?: string }) => (
    <Logo className={className} />
);

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
    const [showMapModal, setShowMapModal] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);
    const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);

    const { addToCart, cartCount } = useCart();
    const { user, logout } = useAuth();

    const handleAddToCart = async (productId: number) => {
        try {
            await addToCart(productId, 1);
            toast.success('¡Producto agregado al carrito!');
        } catch (error) {
            toast.error('Error al agregar producto');
        }
    };


    useEffect(() => {
        fetchProducts();
        loadHeroBanners();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch {
            console.log('No products');
        }
    };

    const defaultHeroBanners: HeroBanner[] = [
        {
            title: 'Telas Premium',
            subtitle: 'Algodón, lino, poliéster y más',
            ctaText: 'Ver Catálogo',
            ctaLink: '#productos',
            promoText: 'Ver Promos',
            promoLink: '#promociones',
            imageUrl: '',
            bgClass: 'bg-pink-hot',
            textClass: 'text-white'
        },
        {
            title: 'Uniformes Corporativos',
            subtitle: 'Confección personalizada de alta calidad',
            ctaText: 'Cotizar Ahora',
            ctaLink: '#contacto',
            promoText: 'Promociones',
            promoLink: '#promociones',
            imageUrl: '',
            bgClass: 'bg-teal',
            textClass: 'text-white'
        },
        {
            title: 'Hilos y Fragancias',
            subtitle: 'Todo para tus proyectos y el hogar',
            ctaText: 'Explorar',
            ctaLink: '#productos',
            promoText: 'Promos del Mes',
            promoLink: '#promociones',
            imageUrl: '',
            bgClass: 'bg-lime',
            textClass: 'text-graphite'
        }
    ];

    const loadHeroBanners = async () => {
        try {
            const response = await api.get('/home-carousel');
            const serverBanners = response.data?.banners as HeroBanner[] | undefined;
            if (Array.isArray(serverBanners) && serverBanners.length > 0) {
                setHeroBanners(serverBanners);
                return;
            }
            setHeroBanners(defaultHeroBanners);
        } catch {
            setHeroBanners(defaultHeroBanners);
        }
    };

    const categories = [
        { name: 'Telas por Metro', desc: 'Algodón, lino, poliéster' },
        { name: 'Hilos y Lanas', desc: 'Para bordar y tejer' },
        { name: 'Uniformes', desc: 'Corporativos' },
        { name: 'Fragancias', desc: 'Esencias y aromas únicos' },
    ];


    return (
        <div className="min-h-screen bg-white text-graphite font-sans selection:bg-pink-hot selection:text-white">
            {/* Top Bar */}
            <div className="bg-graphite text-white text-center py-3 text-sm max-md:text-xs font-bold tracking-widest uppercase max-md:px-4">
                Envíos a todo el país 🇨🇴 | ¡Pregunta por nuestra Promo del mes!
            </div>

            {/* Navigation */}
            <nav className="border-b-4 border-graphite py-10 max-md:py-6 px-6 md:px-12 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
                <div className="max-w-360 mx-auto flex justify-between items-center">
                    <Link to="/" className="group">
                        <div className="flex items-center gap-4">
                            <CustomLogo className="w-20 h- group-hover:rotate-12 transition-transform duration-300 max-md:w-14 max-md:h-14" />
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

                    {!user && (
                        <div className="md:hidden flex items-center">
                            <Link
                                to="/login"
                                className="px-5 py-2 bg-pink-hot text-white font-black uppercase tracking-wider rounded-xl border-2 border-graphite shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs"
                            >
                                Ingresar
                            </Link>
                        </div>
                    )}

                    {user?.role === 'admin' && (
                        <div className="md:hidden flex items-center gap-3 relative">
                            <button
                                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                                className="px-4 py-2 bg-pink-hot text-white font-black uppercase tracking-wider rounded-xl border-2 border-graphite shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[10px]"
                            >
                                Opciones
                            </button>
                            <button
                                onClick={logout}
                                className="px-3 py-2 border-2 border-red-400 text-red-500 font-black uppercase tracking-wider rounded-xl text-[10px]"
                            >
                                Salir
                            </button>
                        </div>
                    )}

                    {user?.role === 'client' && (
                        <div className="md:hidden flex items-center gap-3 relative">
                            <button
                                onClick={() => setIsClientMenuOpen((prev) => !prev)}
                                className="px-4 py-2 bg-pink-hot text-white font-black uppercase tracking-wider rounded-xl border-2 border-graphite shadow-[3px_3px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[10px]"
                            >
                                Opciones
                            </button>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-graphite hover:text-pink-hot transition"
                            >
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-pink-hot text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="hidden md:flex gap-8 items-center">
                        <a href="#productos" className="text-sm font-bold text-graphite hover:text-pink-hot transition uppercase tracking-wider">Productos</a>
                        <a href="#contacto" className="text-sm font-bold text-graphite hover:text-pink-hot transition uppercase tracking-wider">Contacto</a>

                        {user ? (
                            <div className="flex items-center gap-6">
                                {user.role === 'admin' ? (
                                    <Link to="/admin/dashboard" className="text-sm font-bold text-pink-hot hover:text-graphite uppercase tracking-wider border-2 border-pink-hot px-4 py-1 rounded-full transition-colors">
                                        Ir al Panel
                                    </Link>
                                ) : (
                                    <Link to="/my-orders" className="text-sm font-bold text-gray-500 hover:text-pink-hot uppercase tracking-wider">
                                        Mis Pedidos
                                    </Link>
                                )}

                                <span className="text-sm font-bold text-graphite uppercase tracking-wider">Hola, {user.name.split(' ')[0]}</span>

                                {/* Cart Button - Hide for admin? optional but safer to leave or hide. Typically admins don't shop. Let's hide cart for admin to be cleaner based on "client panel" complaint */}
                                {user.role !== 'admin' && (
                                    <button
                                        onClick={() => setIsCartOpen(true)}
                                        className="relative p-2 text-graphite hover:text-pink-hot transition"
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-pink-hot text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* Logout Button */}
                                <button
                                    onClick={logout}
                                    className="text-sm font-bold text-red-500 hover:text-red-700 uppercase tracking-wider border-2 border-red-100 hover:border-red-500 rounded-full px-4 py-1 transition-all"
                                >
                                    Salir
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="px-10 py-4 bg-pink-hot text-white font-black uppercase tracking-wider rounded-xl hover:bg-graphite transition-all border-4 border-graphite shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                                Ingresar
                            </Link>
                        )}
                    </div>
                </div>

                {user?.role === 'admin' && isMobileMenuOpen && (
                    <div className="md:hidden absolute right-0 top-full mt-2 w-36 border-2 border-graphite rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] px-2 py-2">
                        <div className="flex flex-col items-center gap-2 text-[9px] font-black uppercase tracking-widest text-graphite text-center">
                            <a href="#productos" className="hover:text-pink-hot">Productos</a>
                            <a href="#contacto" className="hover:text-pink-hot">Contacto</a>
                            <Link to="/admin/dashboard" className="hover:text-pink-hot">
                                Volver al panel
                            </Link>
                            <button
                                type="button"
                                onClick={logout}
                                className="mt-1 text-xs text-red-500 hover:text-red-600"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                )}

                {user?.role === 'client' && isClientMenuOpen && (
                    <div className="md:hidden absolute right-0 top-full mt-2 w-36 border-2 border-graphite rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] px-2 py-2">
                        <div className="flex flex-col items-center gap-2 text-[9px] font-black uppercase tracking-widest text-graphite text-center">
                            <a href="#productos" className="hover:text-pink-hot">Productos</a>
                            <a href="#contacto" className="hover:text-pink-hot">Contacto</a>
                            <Link to="/my-orders" className="hover:text-pink-hot">
                                Mis Pedidos
                            </Link>
                            <button
                                type="button"
                                onClick={logout}
                                className="mt-1 text-xs text-red-500 hover:text-red-600"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Carousel */}
            <section className="border-b-8 border-graphite">
                <Swiper
                    modules={[Autoplay, Navigation, Pagination, EffectFade]}
                    spaceBetween={0}
                    slidesPerView={1}
                    effect="fade"
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    className="min-h-[85vh] max-md:min-h-[55vh] w-full"
                >
                    {heroBanners.map((banner, i) => (
                        <SwiperSlide key={i}>
                            <div className={`w-full min-h-[85vh] max-md:min-h-[55vh] ${banner.bgClass} flex items-center justify-center relative overflow-hidden py-32 max-md:py-12`}>
                                {banner.imageUrl && (
                                    <div
                                        className="absolute inset-0 bg-center bg-cover"
                                        style={{ backgroundImage: `url(${banner.imageUrl})` }}
                                    ></div>
                                )}
                                <div className="absolute inset-0 bg-graphite/40"></div>
                                <div className="absolute inset-0 opacity-20">
                                    <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
                                </div>
                                <div className="text-center z-10 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center">
                                    <h2 className={`text-6xl md:text-8xl max-md:text-3xl font-black mb-16 max-md:mb-8 ${banner.textClass} tracking-tighter leading-none drop-shadow-lg`}>
                                        {banner.title.toUpperCase()}
                                    </h2>
                                    <p className={`text-2xl md:text-4xl max-md:text-base font-bold mb-16 max-md:mb-6 ${banner.textClass} opacity-90 max-w-5xl mx-auto leading-tight`}>
                                        {banner.subtitle}
                                    </p>
                                    <div className="flex flex-col md:flex-row items-center gap-6 max-md:gap-3">
                                        <a
                                            href="#productos"
                                            className="inline-flex items-center justify-center px-20 py-7 max-md:px-7 max-md:py-3 rounded-full font-black uppercase tracking-widest text-xl max-md:text-xs border-4 border-graphite shadow-[10px_10px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all cursor-pointer bg-white text-graphite transform hover:scale-105 min-w-[280px] max-md:min-w-[170px]"
                                        >
                                            {banner.ctaText}
                                        </a>
                                        <a
                                            href="#promociones"
                                            className="inline-flex items-center justify-center px-16 py-6 max-md:px-6 max-md:py-3 rounded-full font-black uppercase tracking-widest text-lg max-md:text-[10px] border-4 border-white/70 text-white hover:bg-white/20 transition-all cursor-pointer min-w-[220px] max-md:min-w-[150px]"
                                        >
                                            {banner.promoText}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* Categories */}
            <section style={{ paddingTop: '30px', paddingBottom: '30px' }} className="px-6 md:px-12 border-b-8 border-graphite bg-yellow-50">
                <div className="max-w-360 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-md:gap-6 lg:gap-10 justify-items-center">
                        {categories.map((cat, i) => (
                            <a href="#" key={i} className="group bg-white px-8 py-12 max-md:px-6 max-md:py-8 rounded-4xl border-4 border-graphite shadow-[8px_8px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 text-center w-full">
                                <h3 className="text-2xl lg:text-3xl max-md:text-xl font-black text-graphite mb-3 group-hover:text-pink-hot uppercase tracking-tight">{cat.name}</h3>
                                <p className="text-lg max-md:text-base text-gray-500 font-bold">{cat.desc}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products */}
            <section id="productos" className="pt-[100px] pb-32 lg:pt-64 lg:pb-64 max-md:pt-32 max-md:pb-20 px-6 md:px-12 bg-teal text-white w-full flex flex-col items-center">
                <div className="max-w-360 w-full flex flex-col items-center">
                    <div className="text-center flex flex-col items-center mb-32 max-md:mb-16">
                        <span className="bg-lime text-graphite px-8 py-3 max-md:px-5 max-md:py-2 rounded-2xl text-xl max-md:text-sm font-black uppercase tracking-widest mb-20 max-md:mb-8 inline-block border-4 border-graphite shadow-[6px_6px_0px_0px_rgba(51,51,51,0.5)]">Nuestros Favoritos</span>
                        <h2 className="text-7xl md:text-8xl max-md:text-4xl font-black mb-32 max-md:mb-12 tracking-tighter text-center leading-none">PRODUCTOS<br /><span className="text-pink-hot">DESTACADOS</span></h2>
                    </div>

                    {/* Filter Controls */}
                    <div className="w-full max-w-4xl mb-96 max-md:mb-16 flex flex-col items-center gap-12 max-md:gap-6">
                        {/* Main Category Tabs */}
                        <div className="flex flex-wrap justify-center items-stretch gap-10 max-md:gap-4">
                            <button
                                onClick={() => { setSelectedCategory('all'); setSelectedBrand('all'); setSelectedSubcategory('all'); }}
                                className={`inline-flex items-center justify-center px-10 py-4 max-md:px-5 max-md:py-2 rounded-full font-black uppercase tracking-wider transition-all border-4 text-base max-md:text-[10px] min-w-[160px] max-md:min-w-[110px] min-h-[48px] ${selectedCategory === 'all'
                                    ? 'bg-white text-graphite border-graphite shadow-[6px_6px_0px_0px_rgba(51,51,51,1)] transform -translate-y-1'
                                    : 'bg-teal-dark border-white/30 text-white/80 hover:bg-white/10 hover:text-white'}`}
                            >
                                Todos
                            </button>
                            {products.some((product) => product.is_promo || product.is_combo) && (
                                <button
                                    onClick={() => { setSelectedCategory('promos'); setSelectedBrand('all'); setSelectedSubcategory('all'); }}
                                    className={`inline-flex items-center justify-center px-10 py-4 max-md:px-5 max-md:py-2 rounded-full font-black uppercase tracking-wider transition-all border-4 text-base max-md:text-[10px] min-w-[160px] max-md:min-w-[110px] min-h-[48px] ${selectedCategory === 'promos'
                                        ? 'bg-white text-pink-hot border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] transform -translate-y-1'
                                        : 'bg-pink-hot/40 border-white/40 text-white hover:bg-pink-hot/60 hover:text-white'}`}
                                >
                                    Promociones
                                </button>
                            )}
                            <button
                                onClick={() => { setSelectedCategory('telas'); setSelectedBrand('all'); setSelectedSubcategory('all'); }}
                                className={`inline-flex items-center justify-center px-10 py-4 max-md:px-5 max-md:py-2 rounded-full font-black uppercase tracking-wider transition-all border-4 text-base max-md:text-[10px] min-w-[160px] max-md:min-w-[110px] min-h-[48px] ${selectedCategory === 'telas'
                                    ? 'bg-pink-hot text-white border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] transform -translate-y-1'
                                    : 'bg-teal-dark border-white/30 text-white/80 hover:bg-pink-hot/50 hover:text-white'}`}
                            >
                                Telas
                            </button>
                            <button
                                onClick={() => { setSelectedCategory('perfumeria'); setSelectedBrand('all'); setSelectedSubcategory('all'); }}
                                className={`inline-flex items-center justify-center px-10 py-4 max-md:px-5 max-md:py-2 rounded-full font-black uppercase tracking-wider transition-all border-4 text-base max-md:text-[10px] min-w-[160px] max-md:min-w-[110px] min-h-[48px] ${selectedCategory === 'perfumeria'
                                    ? 'bg-lime text-graphite border-graphite shadow-[6px_6px_0px_0px_rgba(51,51,51,1)] transform -translate-y-1'
                                    : 'bg-teal-dark border-white/30 text-white/80 hover:bg-lime/50 hover:text-white'}`}
                            >
                                Perfumería
                            </button>
                        </div>

                        {/* Perfumery Specific Filters */}
                        {selectedCategory === 'perfumeria' && (
                            <div className="flex flex-wrap justify-center gap-6 max-md:gap-4 animate-fadeIn bg-white/10 p-6 max-md:p-4 rounded-3xl backdrop-blur-sm border-4 border-white/20">
                                {/* Brand Filter */}
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="px-6 py-3 max-md:px-4 max-md:py-2 rounded-2xl bg-white text-graphite font-bold text-lg max-md:text-sm focus:outline-none focus:ring-4 focus:ring-lime border-r-12 border-transparent cursor-pointer shadow-lg"
                                >
                                    <option value="all">Todas las Marcas</option>
                                    {[...new Set(products.filter(p => p.category === 'perfumeria' && p.brand).map(p => p.brand))].map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>

                                {/* Subcategory Filter */}
                                <select
                                    value={selectedSubcategory}
                                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                                    className="px-6 py-3 max-md:px-4 max-md:py-2 rounded-2xl bg-white text-graphite font-bold text-lg max-md:text-sm focus:outline-none focus:ring-4 focus:ring-lime border-r-12 border-transparent cursor-pointer shadow-lg"
                                >
                                    <option value="all">Todas las Categorías</option>
                                    {[...new Set(products.filter(p => p.category === 'perfumeria' && p.subcategory).map(p => p.subcategory))].map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div id="promociones" className="w-full"></div>
                    {/* Promociones */}
                    {products.some((product) => product.is_promo || product.is_combo) && (
                        <div className="w-full mb-24 max-md:mb-14">
                            <div className="flex flex-col items-center mb-12 max-md:mb-8">
                                <span className="bg-white text-pink-hot px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)]">Promociones</span>
                                <h3 className="text-4xl max-md:text-2xl font-black text-white mt-6 text-center">Combos y productos en promo</h3>
                            </div>
                            <div className="grid grid-cols-2 max-md:grid-cols-2 gap-8 max-md:gap-4 lg:grid lg:grid-cols-5 lg:gap-12 w-full px-6 max-md:px-4 lg:px-0">
                                {products
                                    .filter((product) => product.is_promo || product.is_combo)
                                    .map((product) => (
                                        <div
                                            key={`promo-${product.id}`}
                                            className="bg-white rounded-3xl lg:rounded-4xl p-6 lg:p-8 max-md:p-3 hover:transform hover:-translate-y-3 transition-all duration-300 group cursor-pointer border-4 lg:border-6 border-transparent hover:border-pink-hot shadow-lg lg:shadow-xl text-center flex flex-col w-full max-w-full"
                                        >
                                            <div className="relative aspect-square bg-grey-light rounded-2xl lg:rounded-3xl mb-2 lg:mb-4 max-md:mb-2 overflow-hidden flex items-center justify-center border-2 lg:border-4 border-gray-100 w-full group-hover:border-pink-hot transition-all">
                                                {product.image ? (
                                                    <img
                                                        src={`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '')}/storage/${product.image}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                                    />
                                                ) : (
                                                    <svg className="w-12 h-12 lg:w-24 lg:h-24 text-gray-300 group-hover:text-pink-hot transition duration-300 transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                                <div className="absolute top-2 left-2 flex flex-col gap-2">
                                                    {product.is_promo && (
                                                        <span className="bg-pink-hot text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border-2 border-white">Promo</span>
                                                    )}
                                                    {product.is_combo && (
                                                        <span className="bg-teal text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border-2 border-white">Combo</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(product.id);
                                                    }}
                                                    className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 w-10 h-10 lg:w-12 lg:h-12 max-md:w-9 max-md:h-9 bg-lime text-graphite rounded-full flex items-center justify-center border-2 lg:border-4 border-graphite shadow-[2px_2px_0px_0px_rgba(51,51,51,1)] lg:shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition duration-300 font-bold z-10"
                                                >
                                                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                            <div className="px-1.5 lg:px-3 pb-1 lg:pb-3 max-md:px-1 max-md:pb-0 grow flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-extrabold text-graphite mb-1 lg:mb-2 text-sm max-md:text-sm lg:text-xl group-hover:text-pink-hot transition leading-tight line-clamp-2">{product.name}</h3>
                                                    <p className="text-gray-500 mb-2 lg:mb-4 font-medium text-xs max-md:text-[11px] lg:text-base line-clamp-2 leading-snug">{product.description}</p>
                                                </div>
                                                <div className="flex justify-center items-center gap-2 border-t-2 lg:border-t-4 border-gray-100 pt-2 lg:pt-4 max-md:pt-1">
                                                    <span className="text-lg max-md:text-lg lg:text-3xl font-black text-graphite">
                                                        ${Number(product.price).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div style={{ marginTop: '50px' }} className="grid grid-cols-2 max-md:grid-cols-2 gap-8 max-md:gap-4 lg:grid lg:grid-cols-5 lg:gap-12 w-full px-6 max-md:px-4 lg:px-0">
                        {products
                            .filter(product => {
                                if (selectedCategory === 'promos' && !(product.is_promo || product.is_combo)) return false;
                                if (selectedCategory !== 'all' && selectedCategory !== 'promos' && product.category !== selectedCategory) return false;
                                if (selectedCategory === 'perfumeria') {
                                    if (selectedBrand !== 'all' && product.brand !== selectedBrand) return false;
                                    if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) return false;
                                }
                                return true;
                            })
                            .length > 0 ? (
                            products
                                .filter(product => {
                                    if (selectedCategory === 'promos' && !(product.is_promo || product.is_combo)) return false;
                                    if (selectedCategory !== 'all' && selectedCategory !== 'promos' && product.category !== selectedCategory) return false;
                                    if (selectedCategory === 'perfumeria') {
                                        if (selectedBrand !== 'all' && product.brand !== selectedBrand) return false;
                                        if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) return false;
                                    }
                                    return true;
                                })
                                .map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-3xl lg:rounded-4xl p-6 lg:p-8 max-md:p-3 hover:transform hover:-translate-y-3 transition-all duration-300 group cursor-pointer border-4 lg:border-6 border-transparent hover:border-lime shadow-lg lg:shadow-xl text-center flex flex-col w-full max-w-full"
                                    >
                                        <div className="relative aspect-square bg-grey-light rounded-2xl lg:rounded-3xl mb-2 lg:mb-4 max-md:mb-2 overflow-hidden flex items-center justify-center border-2 lg:border-4 border-gray-100 w-full group-hover:border-lime transition-all">
                                            {product.image ? (
                                                <img
                                                    src={`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '')}/storage/${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                                />
                                            ) : (
                                                <svg className="w-12 h-12 lg:w-24 lg:h-24 text-gray-300 group-hover:text-pink-hot transition duration-300 transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product.id);
                                                }}
                                                className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 w-10 h-10 lg:w-12 lg:h-12 max-md:w-9 max-md:h-9 bg-lime text-graphite rounded-full flex items-center justify-center border-2 lg:border-4 border-graphite shadow-[2px_2px_0px_0px_rgba(51,51,51,1)] lg:shadow-[4px_4px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition duration-300 font-bold z-10"
                                            >
                                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                        </div>
                                        <div className="px-1.5 lg:px-3 pb-1 lg:pb-3 max-md:px-1 max-md:pb-0 grow flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-extrabold text-graphite mb-1 lg:mb-2 text-sm max-md:text-sm lg:text-xl group-hover:text-pink-hot transition leading-tight line-clamp-2">{product.name}</h3>
                                                <p className="text-gray-500 mb-2 lg:mb-4 font-medium text-xs max-md:text-[11px] lg:text-base line-clamp-2 leading-snug">{product.description}</p>
                                            </div>
                                            <div className="flex justify-center items-center gap-2 border-t-2 lg:border-t-4 border-gray-100 pt-2 lg:pt-4 max-md:pt-1">
                                                <span className="text-lg max-md:text-lg lg:text-3xl font-black text-graphite">
                                                    ${Number(product.price).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-4xl max-md:text-xl font-black text-white/50 uppercase tracking-widest">Pronto agregaremos productos increíbles ✨</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* SPACER 1: Between Products and Features */}
            <div className="w-full h-48 max-md:h-16 lg:h-20  bg-teal"></div>

            {/* Features */}
            <section style={{ paddingTop: '50px' }} className="pb-56 lg:pb-64 max-md:pb-12 px-6 md:px-12 bg-lime w-full flex justify-center border-t-8 border-graphite/10">
                <div className="max-w-360 w-full flex flex-col items-center">
                    <div className="flex flex-wrap justify-center gap-32 max-md:gap-4 w-full">
                        {[
                            { title: 'Envíos Nacionales', desc: 'A todo el país', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
                            { title: 'Pago Seguro', desc: 'Múltiples métodos', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                            { title: 'Calidad Premium', desc: 'Garantizada', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 013.138-3.138z' },
                        ].map((f, i) => (
                            <div key={i} className="flex flex-col items-center gap-10 max-md:gap-2 p-16 max-md:p-3 rounded-[2.5rem] border-4 border-graphite bg-white shadow-[12px_12px_0px_0px_rgba(51,51,51,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition duration-200 text-center w-80 max-md:w-full max-w-full">
                                <div className="w-24 h-24 max-md:w-10 max-md:h-10 bg-pink-hot text-white rounded-full flex items-center justify-center shrink-0 border-4 border-graphite font-black">
                                    <svg className="w-12 h-12 max-md:w-5 max-md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={f.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-black text-graphite text-3xl max-md:text-sm mb-1">{f.title}</h3>
                                    <p className="text-gray-500 font-bold text-xl max-md:text-[11px]">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SPACER 2: Between Features and Footer */}
            <div className="w-full h-48 max-md:h-16 lg:h-20 bg-lime"></div>

            {/* Enhanced Footer */}
            <footer id="contacto" className="bg-graphite text-white pt-32 lg:pt-48 mt-0 max-md:pt-16 max-md:pb-12 pb-24 overflow-hidden relative border-t-8 border-transparent">
                <div className="absolute top-0 left-0 w-full h-4 bg-linear-to-r from-pink-hot via-purple-500 to-teal"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-hot rounded-full blur-[100px] opacity-20"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal rounded-full blur-[100px] opacity-20"></div>

                <div className="max-w-360 mx-auto px-6 md:px-12 relative z-10 flex flex-col">

                    {/* Top Section: Brand & History Side-by-Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-md:gap-8 items-center mb-24 max-md:mb-24">

                        {/* Brand (Left) */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-10 max-md:gap-6">
                                <CustomLogo className="w-32 h-32 max-md:w-20 max-md:h-20 rounded-4xl p-4 shadow-2xl transform hover:rotate-6 transition-transform duration-500" />
                                <div>
                                    <h2 className="text-5xl md:text-7xl max-md:text-3xl font-black leading-none tracking-tighter mb-2">ENTRE LANAS</h2>
                                    <h3 className="text-2xl md:text-4xl max-md:text-xl font-bold text-pink-hot tracking-[0.2em] leading-none">Y FRAGANCIAS</h3>
                                </div>
                            </div>
                        </div>

                        {/* History (Right) */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-12 max-md:p-5 rounded-[2.5rem] border border-gray-700 h-full flex flex-col justify-center shadow-lg">
                            <h4 className="text-3xl max-md:text-base font-black mb-4 flex items-center justify-center lg:justify-start gap-3 text-pink-hot uppercase tracking-widest">
                                <span className="w-10 h-1.5 bg-pink-hot rounded-full"></span>
                                Nuestra Historia
                            </h4>
                            <p className="text-gray-300 font-medium text-2xl max-md:text-xs leading-relaxed text-center lg:text-left">
                                Nacimos de la pasión por crear. En "Entre Lanas y Fragancias", fusionamos la tradición textil con una experiencia sensorial única.
                                Más que una tienda, somos un espacio donde cada hilo cuenta una historia y cada aroma despierta la creatividad.
                            </p>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="w-full h-px bg-linear-to-r from-transparent via-gray-700 to-transparent mb-16 max-md:mb-20"></div>

                    {/* Contact Info (Bottom) */}
                    <div className="flex flex-col md:flex-row gap-12 max-md:gap-6 md:gap-32 justify-center items-center w-full mb-12 max-md:pt-12">
                        <div
                            onClick={() => setShowMapModal(true)}
                            className="flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform duration-300"
                        >
                            <div className="w-16 h-16 max-md:w-10 max-md:h-10 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 max-md:mb-2 text-pink-hot group-hover:bg-pink-hot group-hover:text-white transition-all duration-300 shadow-lg border border-gray-700 group-hover:border-pink-hot">
                                <svg className="w-8 h-8 max-md:w-5 max-md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <h5 className="text-white font-black text-xl max-md:text-sm mb-1 uppercase tracking-wide group-hover:text-pink-hot transition-colors">Visítanos</h5>
                            <p className="text-gray-400 text-lg max-md:text-xs group-hover:text-white transition-colors">Carrera 11# 6-08, Barrio el Rosario, Chía</p>
                        </div>

                        <div className="hidden md:block w-px h-24 bg-gray-800"></div>

                        <a
                            href="https://wa.me/573124578081"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform duration-300"
                        >
                            <div className="w-16 h-16 max-md:w-10 max-md:h-10 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 max-md:mb-2 text-pink-hot group-hover:bg-pink-hot group-hover:text-white transition-all duration-300 shadow-lg border border-gray-700 group-hover:border-pink-hot">
                                <svg className="w-8 h-8 max-md:w-5 max-md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <h5 className="text-white font-black text-xl max-md:text-sm mb-1 uppercase tracking-wide group-hover:text-pink-hot transition-colors">Llámanos o Escribe</h5>
                            <p className="text-gray-400 text-lg max-md:text-xs group-hover:text-white transition-colors">+57 312 457 8081 - 314 461 6230</p>
                        </a>
                    </div>

                    <div className="border-t border-gray-800 pt-10 max-md:pt-6 text-center w-full">
                        <p className="text-gray-500 font-bold text-lg max-md:text-xs">&copy; 2026 Entre Lanas y Fragancias. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>




            {/* Google Maps Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-graphite/90 backdrop-blur-md animate-fadeIn" onClick={() => setShowMapModal(false)}>
                    <div className="bg-white rounded-4xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl border-4 border-pink-hot relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowMapModal(false)}
                            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white text-graphite rounded-full flex items-center justify-center font-black shadow-lg hover:bg-pink-hot hover:text-white transition-all transform hover:rotate-90 border-2 border-graphite"
                        >
                            ✕
                        </button>
                        <div className="bg-graphite text-white py-4 px-8 flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-widest">Nuestra Ubicación</h3>
                        </div>
                        <div className="grow w-full h-full">
                            <iframe
                                src="https://maps.google.com/maps?q=Carrera+11+%23+6-08%2C+Ch%C3%ADa%2C+Cundinamarca&z=17&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        </div>
    );
}

