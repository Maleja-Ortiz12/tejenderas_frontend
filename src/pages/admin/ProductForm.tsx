import { useState, type FormEvent, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import api from '../../api';
import { AxiosError } from 'axios';
import AdminLayout from '../../components/AdminLayout';

export default function ProductForm() {
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('telas');
    const [brand, setBrand] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [isPromo, setIsPromo] = useState(false);
    const [isCombo, setIsCombo] = useState(false);
    const [description, setDescription] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [markupType, setMarkupType] = useState<'percentage' | 'manual'>('percentage');
    const [markup, setMarkup] = useState('30'); // Default 30%
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [stock, setStock] = useState('0');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const barcodeRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    // Calculate price automatically
    useEffect(() => {
        const parseNumber = (value: string) => {
            const normalized = value.trim().replace(',', '.');
            if (!normalized) return NaN;
            return parseFloat(normalized);
        };

        const base = parseNumber(basePrice);
        if (isNaN(base)) {
            setPrice('');
            return;
        }

        if (base === 0) {
            setPrice('0.00');
            return;
        }

        const marginOrFixed = parseNumber(markup);
        if (isNaN(marginOrFixed)) {
            setPrice(base.toFixed(2));
            return;
        }

        if (markupType === 'percentage') {
            const calculatedPrice = base * (1 + marginOrFixed / 100);
            setPrice(calculatedPrice.toFixed(2));
            return;
        }

        setPrice((base + marginOrFixed).toFixed(2));
    }, [basePrice, markup, markupType]);

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/admin/products/${id}`);
            setName(data.name);
            setBarcode(data.barcode);
            setCategory(data.category || 'telas');
            setBrand(data.brand || '');
            setSubcategory(data.subcategory || '');
            setIsPromo(Boolean(data.is_promo));
            setIsCombo(Boolean(data.is_combo));
            setDescription(data.description || '');
            setBasePrice(data.base_price ? data.base_price.toString() : '');

            if (data.markup !== null) {
                setMarkupType('percentage');
                setMarkup(data.markup.toString());
            } else {
                setMarkupType('manual');
                // Calculate the fixed markup amount: Price - Base
                if (data.price && data.base_price) {
                    const fixedDiff = data.price - data.base_price;
                    setMarkup(fixedDiff.toFixed(2));
                } else {
                    setMarkup('');
                }
            }
            setPrice(data.price.toString());
            setStock(data.stock.toString());
            if (data.image) {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
                setImagePreview(`${apiUrl.replace('/api', '')}/storage/${data.image}`);
            }
        } catch (err) {
            setError('Error al cargar el producto');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: barcodeRef,
        documentTitle: name || 'Producto',
    });

    const handlePrintClick = () => {
        if (!name || !price || !stock) {
            setError('Por favor completa Nombre, Precio y Stock antes de imprimir el código.');
            return;
        }
        handlePrint();
    };

    const checkBarcode = async (code: string) => {
        if (!code) return;
        setIsChecking(true);
        try {
            const { data } = await api.get<{ exists: boolean; product?: any }>(`/admin/products/check/${code}`);
            if (data.exists && (!isEditing || data.product.id !== parseInt(id!))) {
                setError('Este código de barras ya está registrado para: ' + data.product.name);
            } else {
                setError('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsChecking(false);
        }
    };

    const generateBarcode = async () => {
        setIsChecking(true);
        try {
            const { data } = await api.get<{ barcode: string }>('/admin/products/generate-barcode');
            setBarcode(data.barcode);
            setError('');
        } catch (err) {
            setError('Error al generar código');
        } finally {
            setIsChecking(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new FormData();
        formData.append('barcode', barcode);
        formData.append('name', name);
        formData.append('category', category);
        formData.append('is_promo', isPromo ? '1' : '0');
        formData.append('is_combo', isCombo ? '1' : '0');
        if (brand) formData.append('brand', brand);
        if (subcategory) formData.append('subcategory', subcategory);
        if (description) formData.append('description', description);
        formData.append('base_price', basePrice);
        if (markupType === 'percentage' && markup) {
            formData.append('markup', markup);
        }
        formData.append('price', price);
        formData.append('stock', stock);
        if (image) {
            formData.append('image', image);
        }
        if (isEditing) {
            formData.append('_method', 'PUT');
        }

        try {
            if (isEditing) {
                await api.post(`/admin/products/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/admin/products');
        } catch (err) {
            const error = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            if (error.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0];
                setError(firstError[0]);
            } else {
                // setError(error.response?.data?.message || 'Error al crear el producto');
                // Temporary fix for debugging or fallback
                console.error(err);
                setError('Error al guardar el producto. Verifica los datos.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center min-h-[50vh] w-full py-10">
                <div className="h-6 md:h-8"></div>
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-[2px] px-6 py-5 overflow-y-auto md:static md:bg-transparent md:backdrop-blur-0 md:p-0 md:overflow-visible md:items-center">
                    <div className="w-[92%] max-w-2xl rounded-md md:rounded-lg border-4 border-pink-hot p-3 bg-white shadow-lg md:shadow-[16px_16px_0px_0px_#333] max-h-[calc(100vh-3rem)] overflow-y-auto md:max-h-none md:overflow-visible mx-auto">
                        <div className="bg-white rounded-md md:rounded-lg border-2 border-graphite p-7 md:p-12">
                            <div className="flex justify-between items-center mb-6 md:mb-10 border-b-2 border-gray-100 pb-4 md:pb-6 translate-x-6 md:translate-x-12">
                            <div className="flex flex-col">
                                <h2 className="text-3xl md:text-4xl font-black text-graphite uppercase tracking-tight">
                                    {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                                </h2>
                                <p className="text-graphite font-medium text-base md:text-lg">{isEditing ? 'Modificar datos del producto' : 'Agregar un producto al inventario'}</p>
                            </div>
                            <Link
                                to="/admin/products"
                                className="text-graphite hover:text-red-pink transition-colors p-2 hover:bg-gray-50 rounded-xl"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Link>
                        </div>

                            {error && (
                                <div className="bg-red-pink/10 border-2 border-red-pink text-red-pink px-4 py-3 rounded-xl mb-6 font-bold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-graphite mb-2 uppercase tracking-wide">
                                Categoría
                            </label>
                            <div className="flex gap-4">
                                <label className={`flex-1 cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${category === 'telas' ? 'bg-pink-hot text-white border-pink-hot shadow-[2px_2px_0px_0px_#333]' : 'bg-white text-graphite border-graphite hover:border-pink-hot/50'}`}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="telas"
                                        checked={category === 'telas'}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="hidden"
                                    />
                                    <span className="font-bold uppercase">🧵 Telas</span>
                                </label>
                                <label className={`flex-1 cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${category === 'perfumeria' ? 'bg-purple-600 text-white border-purple-600 shadow-[2px_2px_0px_0px_#333]' : 'bg-white text-graphite border-graphite hover:border-purple-600/50'}`}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="perfumeria"
                                        checked={category === 'perfumeria'}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="hidden"
                                    />
                                    <span className="font-bold uppercase">✨ Perfumería</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="barcode" className="block text-sm font-black text-graphite mb-2 uppercase tracking-wide">
                                Código de Barras
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        id="barcode"
                                        type="text"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        onBlur={(e) => checkBarcode(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                checkBarcode(barcode);
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-white border-2 border-graphite rounded-xl text-graphite placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-pink-hot focus:shadow-[4px_4px_0px_0px_#FE6196] transition-all font-mono"
                                        placeholder="Escanea o escribe..."
                                        required
                                    />
                                    {isChecking && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <svg className="animate-spin h-5 w-5 text-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={generateBarcode}
                                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl border-2 border-graphite shadow-[2px_2px_0px_0px_#333] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
                                    title="Generar Código Automático"
                                >
                                    Generar
                                </button>
                                {barcode && !error && (
                                    <button
                                        type="button"
                                        onClick={handlePrintClick}
                                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-graphite font-bold rounded-xl border-2 border-graphite shadow-[2px_2px_0px_0px_#333] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
                                        title="Imprimir Código"
                                    >
                                        Imprimir
                                    </button>
                                )}
                            </div>

                            {/* Hidden print area - positioned off-screen but rendered */}
                            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                                <div ref={barcodeRef} className="p-4 flex flex-col items-center justify-center bg-white min-w-[300px]">
                                    <h4 className="font-bold text-lg mb-2 text-center">{name || 'Producto'}</h4>
                                    <Barcode
                                        value={barcode || '000000000000'}
                                        format="CODE128"
                                        width={2}
                                        height={60}
                                        fontSize={16}
                                        displayValue={true}
                                    />
                                    <p className="mt-2 text-sm text-center max-w-[250px] truncate">{description}</p>
                                    <p className="text-xl font-bold mt-1">${price || '0.00'}</p>
                                </div>
                            </div>
                        </div>

                        {category === 'perfumeria' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="brand" className="block text-sm font-black text-graphite mb-2 uppercase tracking-wide">
                                        Marca
                                    </label>
                                    <input
                                        id="brand"
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-graphite rounded-xl text-graphite placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-pink-hot focus:shadow-[4px_4px_0px_0px_#FE6196] transition-all"
                                        placeholder="Ej: Chanel"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subcategory" className="block text-sm font-black text-graphite mb-2 uppercase tracking-wide">
                                        Categoría de Perfumería
                                    </label>
                                    <input
                                        id="subcategory"
                                        type="text"
                                        value={subcategory}
                                        onChange={(e) => setSubcategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-graphite rounded-xl text-graphite placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-pink-hot focus:shadow-[4px_4px_0px_0px_#FE6196] transition-all"
                                        placeholder="Ej: Eau de Parfum"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center justify-between gap-4 border-2 border-graphite rounded-xl px-4 py-3 bg-white">
                                <div>
                                    <p className="text-sm font-black text-graphite uppercase tracking-wide">Promoción</p>
                                    <p className="text-xs text-gray-500 font-medium">Mostrar en el bloque de promos</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isPromo}
                                    onChange={(e) => setIsPromo(e.target.checked)}
                                    className="h-5 w-5 accent-pink-hot"
                                />
                            </label>
                            <label className="flex items-center justify-between gap-4 border-2 border-graphite rounded-xl px-4 py-3 bg-white">
                                <div>
                                    <p className="text-sm font-black text-graphite uppercase tracking-wide">Combo</p>
                                    <p className="text-xs text-gray-500 font-medium">Producto tipo combo</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isCombo}
                                    onChange={(e) => setIsCombo(e.target.checked)}
                                    className="h-5 w-5 accent-teal"
                                />
                            </label>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-black text-graphite mb-2 uppercase tracking-wide">
                                Nombre del Producto
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-graphite rounded-xl text-graphite placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-pink-hot focus:shadow-[4px_4px_0px_0px_#FE6196] transition-all"
                                placeholder="Ej: Hilo de Algodón Azul"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-graphite mb-2 uppercase tracking-wide">
                                Imagen del Producto
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-32 border-2 border-dashed border-graphite rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 relative">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-graphite text-xs text-center px-2">Sin imagen</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-graphite
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-pink-hot file:text-white
                                            hover:file:bg-pink-600
                                            transition-colors cursor-pointer"
                                    />
                                    <p className="mt-1 text-xs text-graphite">JPG, PNG, GIF hasta 2MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Cost and Pricing Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-graphite">
                            <h3 className="text-lg font-bold text-graphite mb-4 uppercase tracking-wider">Precios y Costos</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label htmlFor="basePrice" className="block text-xs font-black text-graphite mb-2 uppercase tracking-wide">
                                        Costo Base
                                    </label>
                                    <div className="relative">
                                        <span
                                            className={`absolute left-3 top-1/2 -translate-y-1/2 text-graphite font-black text-lg pointer-events-none select-none transition-opacity ${basePrice ? 'opacity-0' : 'opacity-60'}`}
                                        >
                                            $
                                        </span>
                                        <input
                                            id="basePrice"
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[0-9]*[.,]?[0-9]*"
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-graphite rounded-xl text-graphite font-bold text-lg focus:outline-none focus:border-pink-hot focus:ring-0 transition-all"
                                            placeholder=""
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-graphite mb-2 uppercase tracking-wide">
                                        Tipo de Margen
                                    </label>
                                    <div className="flex bg-white rounded-xl border-2 border-graphite p-1">
                                        <button
                                            type="button"
                                            onClick={() => setMarkupType('percentage')}
                                            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold uppercase transition-all ${markupType === 'percentage' ? 'bg-pink-hot text-white shadow-sm' : 'text-graphite hover:bg-gray-100'}`}
                                        >
                                            % Porcentaje
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMarkupType('manual')}
                                            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold uppercase transition-all ${markupType === 'manual' ? 'bg-teal text-white shadow-sm' : 'text-graphite hover:bg-gray-100'}`}
                                        >
                                            Manual
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="markup" className="block text-xs font-black text-graphite mb-2 uppercase tracking-wide">
                                        {markupType === 'percentage' ? 'Margen de Ganancia (%)' : 'Ganancia Fija ($)'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="markup"
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[0-9]*[.,]?[0-9]*"
                                            value={markup}
                                            onChange={(e) => setMarkup(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3 bg-white border-2 border-graphite rounded-xl focus:outline-none focus:border-pink-hot focus:ring-0 transition-all font-bold text-lg text-pink-hot text-right appearance-none"
                                            placeholder=""
                                        />
                                        <span
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 text-graphite font-black text-lg pointer-events-none select-none transition-opacity ${markup ? 'opacity-0' : 'opacity-60'}`}
                                        >
                                            {markupType === 'percentage' ? '%' : '$'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-xs font-black text-graphite mb-2 uppercase tracking-wide">
                                        Precio Final (Venta)
                                    </label>
                                    <div className="relative">
                                        <span
                                            className={`absolute left-4 top-1/2 -translate-y-1/2 text-graphite font-bold pointer-events-none select-none transition-opacity ${price ? 'opacity-0' : 'opacity-60'}`}
                                        >
                                            $
                                        </span>
                                        <input
                                            id="price"
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[0-9]*[.,]?[0-9]*"
                                            value={price}
                                            readOnly
                                            // Always readOnly now since both modes calculate it
                                            className="w-full pl-8 pr-4 py-3 bg-gray-100 border-2 border-graphite rounded-xl text-graphite font-black text-lg cursor-not-allowed"
                                            placeholder=""
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="stock" className="block text-sm font-black text-graphite mb-2 uppercase tracking-wide">
                                Stock Inicial
                            </label>
                            <input
                                id="stock"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-graphite rounded-xl text-graphite placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-pink-hot focus:shadow-[4px_4px_0px_0px_#FE6196] transition-all"
                                placeholder="0"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-black text-graphite mb-2 uppercase tracking-wide">
                                Descripción (opcional)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-white border-2 border-graphite rounded-xl text-graphite placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-pink-hot focus:shadow-[4px_4px_0px_0px_#FE6196] transition-all resize-none"
                                placeholder="Descripción del producto..."
                            />
                        </div>

                        <div className="flex gap-4 pt-6">
                            <Link
                                to="/admin/products"
                                className="flex-1 py-4 px-4 bg-white hover:bg-gray-50 text-graphite font-black uppercase tracking-widest rounded-xl border-2 border-graphite text-center transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-4 px-4 bg-teal hover:bg-teal-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-graphite shadow-[4px_4px_0px_0px_#333] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </span>
                                ) : (
                                    isEditing ? 'Actualizar Producto' : 'Guardar Producto'
                                )}
                            </button>
                        </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="h-12 md:h-16"></div>
            </div>
        </AdminLayout>
    );
}
