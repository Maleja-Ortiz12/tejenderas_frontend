import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import api from '../../api';

type TextTone = 'text-white' | 'text-graphite';

type Banner = {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    promoText: string;
    promoLink: string;
    imageUrl: string;
    bgClass: string;
    textClass: TextTone;
};

const defaultBanners: Banner[] = [
    {
        title: 'Telas Premium',
        subtitle: 'Algodón, lino, poliéster y más',
        ctaText: 'Ver Catálogo',
        ctaLink: '#productos',
        promoText: 'Ver Promos',
        promoLink: '#productos',
        imageUrl: '',
        bgClass: 'bg-pink-hot',
        textClass: 'text-white',
    },
    {
        title: 'Uniformes Corporativos',
        subtitle: 'Confección personalizada de alta calidad',
        ctaText: 'Cotizar Ahora',
        ctaLink: '#contacto',
        promoText: 'Promociones',
        promoLink: '#contacto',
        imageUrl: '',
        bgClass: 'bg-teal',
        textClass: 'text-white',
    },
    {
        title: 'Hilos y Fragancias',
        subtitle: 'Todo para tus proyectos y el hogar',
        ctaText: 'Explorar',
        ctaLink: '#productos',
        promoText: 'Promos del Mes',
        promoLink: '#productos',
        imageUrl: '',
        bgClass: 'bg-lime',
        textClass: 'text-graphite',
    },
];

const toneOptions: { label: string; value: TextTone }[] = [
    { label: 'Texto claro', value: 'text-white' },
    { label: 'Texto oscuro', value: 'text-graphite' },
];

const bgOptions = [
    { label: 'Rosado', value: 'bg-pink-hot' },
    { label: 'Teal', value: 'bg-teal' },
    { label: 'Lima', value: 'bg-lime' },
    { label: 'Grafito', value: 'bg-graphite' },
    { label: 'Crema', value: 'bg-yellow-50' },
];

export default function HomeCarousel() {
    const [banners, setBanners] = useState<Banner[]>(defaultBanners);

    useEffect(() => {
        const loadBanners = async () => {
            try {
                const response = await api.get('/home-carousel');
                const serverBanners = response.data?.banners;
                if (Array.isArray(serverBanners) && serverBanners.length > 0) {
                    setBanners(serverBanners);
                }
            } catch (error) {
                console.error('Error loading carousel settings', error);
                toast.error('No se pudo cargar el carrusel.');
            }
        };

        loadBanners();
    }, []);

    const updateBanner = (index: number, updates: Partial<Banner>) => {
        setBanners((prev) => prev.map((banner, i) => (i === index ? { ...banner, ...updates } : banner)));
    };

    const handleImageUpload = (index: number, file?: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            updateBanner(index, { imageUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const addBanner = () => {
        setBanners((prev) => [
            ...prev,
            {
                title: 'Nuevo banner',
                subtitle: 'Describe la promo o colección',
                ctaText: 'Ver más',
                ctaLink: '#productos',
                promoText: 'Promociones',
                promoLink: '#productos',
                imageUrl: '',
                bgClass: 'bg-pink-hot',
                textClass: 'text-white',
            },
        ]);
    };

    const removeBanner = (index: number) => {
        if (banners.length === 1) {
            toast.error('Debe existir al menos un banner.');
            return;
        }
        setBanners((prev) => prev.filter((_, i) => i !== index));
    };

    const saveBanners = async () => {
        try {
            await api.put('/admin/home-carousel', { banners });
            toast.success('Carrusel actualizado.');
        } catch (error) {
            console.error('Error saving carousel settings', error);
            toast.error('No se pudo guardar el carrusel.');
        }
    };

    return (
        <AdminLayout
            title="Carrusel del Home"
            subtitle="Actualiza imágenes, textos y botones del hero"
            titleWrapperClassName="translate-x-3 md:translate-x-3 md:flex-1"
            mainWrapperClassName="flex flex-col items-center"
            titleSectionClassName="flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-100"
            actionsWrapperClassName="w-full md:w-auto md:ml-auto justify-start md:justify-end"
            actions={
                <button
                    type="button"
                    onClick={saveBanners}
                    className="w-full md:w-auto px-6 py-3 bg-teal hover:bg-teal-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-graphite shadow-[4px_4px_0px_0px_#333] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#333] transition-all"
                >
                    Guardar cambios
                </button>
            }
        >
            <div className="w-full max-w-6xl h-16 bg-white"></div>
            <div className="w-full flex justify-center">
                <div className="space-y-10 max-w-6xl w-full">
                {banners.map((banner, index) => (
                    <div key={index}>
                        <div className="bg-white border-4 border-graphite rounded-3xl p-6 md:p-8 shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-graphite uppercase tracking-tight">Banner {index + 1}</h3>
                                    <p className="text-gray-500 font-medium">Configura el contenido principal y la promoción.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeBanner(index)}
                                    className="px-4 py-2 border-2 border-red-400 text-red-500 font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition"
                                >
                                    Eliminar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Título</span>
                                        <input
                                            type="text"
                                            value={banner.title}
                                            onChange={(event) => updateBanner(index, { title: event.target.value })}
                                            className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Subtítulo</span>
                                        <textarea
                                            value={banner.subtitle}
                                            onChange={(event) => updateBanner(index, { subtitle: event.target.value })}
                                            rows={3}
                                            className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                        />
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Texto botón principal</span>
                                            <input
                                                type="text"
                                                value={banner.ctaText}
                                                onChange={(event) => updateBanner(index, { ctaText: event.target.value })}
                                                className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Link botón principal</span>
                                            <input
                                                type="text"
                                                value={banner.ctaLink}
                                                onChange={(event) => updateBanner(index, { ctaLink: event.target.value })}
                                                className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                            />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Botón promociones</span>
                                            <input
                                                type="text"
                                                value={banner.promoText}
                                                onChange={(event) => updateBanner(index, { promoText: event.target.value })}
                                                className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Link promociones</span>
                                            <input
                                                type="text"
                                                value={banner.promoLink}
                                                onChange={(event) => updateBanner(index, { promoLink: event.target.value })}
                                                className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Imagen (URL)</span>
                                        <input
                                            type="text"
                                            value={banner.imageUrl}
                                            onChange={(event) => updateBanner(index, { imageUrl: event.target.value })}
                                            placeholder="https://..."
                                            className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Subir imagen</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => handleImageUpload(index, event.target.files?.[0])}
                                            className="mt-2 w-full border-2 border-dashed border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                        />
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Color fondo</span>
                                            <select
                                                value={banner.bgClass}
                                                onChange={(event) => updateBanner(index, { bgClass: event.target.value })}
                                                className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                            >
                                                {bgOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Color texto</span>
                                            <select
                                                value={banner.textClass}
                                                onChange={(event) => updateBanner(index, { textClass: event.target.value as TextTone })}
                                                className="mt-2 w-full border-2 border-graphite rounded-xl px-4 py-3 font-bold text-graphite focus:outline-none focus:border-pink-hot"
                                            >
                                                {toneOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                    <div className="rounded-2xl border-2 border-graphite overflow-hidden">
                                        {banner.imageUrl ? (
                                            <img src={banner.imageUrl} alt={banner.title} className="h-48 w-full object-cover" />
                                        ) : (
                                            <div className={`h-48 w-full flex items-center justify-center ${banner.bgClass}`}>
                                                <span className={`font-black text-lg ${banner.textClass}`}>Sin imagen</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {index < banners.length - 1 && (
                            <div className="h-12 bg-white"></div>
                        )}
                    </div>
                ))}

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={addBanner}
                        className="px-8 py-4 bg-pink-hot hover:bg-pink-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-graphite shadow-[4px_4px_0px_0px_#333] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#333] transition-all"
                    >
                        + Agregar banner
                    </button>
                </div>
                </div>
            </div>
            <div className="h-20 bg-white"></div>
        </AdminLayout>
    );
}
