import { useState, useRef, useEffect } from 'react';
import { useZxing } from 'react-zxing';
import type { KeyboardEvent } from 'react';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AxiosError } from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { formatCurrency } from '../../utils/format';

interface Product {
    id: number;
    barcode: string;
    name: string;
    price: number;
    stock: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function POS() {
    const [barcode, setBarcode] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    const zxingHints = new Map();
    zxingHints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);
    zxingHints.set(DecodeHintType.TRY_HARDER, true);

    const { ref } = useZxing({
        onDecodeResult(result) {
            handleScannedCode(result.getText());
        },
        onError(error) {
            // While scanning, ZXing may throw NotFound/Checksum/Format exceptions frequently.
            // Those are normal (no code in frame yet) and should not be shown as permission errors.
            const errorName = (error as Error | undefined)?.name || '';
            const errorMessage = (error as Error | undefined)?.message || '';
            const isNonFatalScanError =
                errorName.includes('NotFound') ||
                errorName.includes('Checksum') ||
                errorName.includes('Format') ||
                errorMessage.toLowerCase().includes('notfound') ||
                errorMessage.toLowerCase().includes('checksum') ||
                errorMessage.toLowerCase().includes('format');

            if (isNonFatalScanError) return;

            console.error(error);
            setScanError('No se pudo acceder a la cámara. Revisa permisos del navegador y vuelve a intentar.');
        },
        constraints: {
            video: {
                facingMode: { ideal: 'environment' },
            },
        },
        hints: zxingHints,
        paused: !isScanning,
    });

    const handleScannedCode = (code: string) => {
        const normalized = code?.trim();
        if (!normalized) return;

        // EAN-13 is always 13 digits. If it's not, keep scanning and show a hint.
        if (!/^\d{13}$/.test(normalized)) {
            setScanError('Acerca o alinea el código. Debe ser un EAN-13 de 13 dígitos.');
            return;
        }

        setBarcode(normalized);
        setIsScanning(false); // Close scanner after successful scan
        setScanError('');
        lookupProduct(normalized);
    };

    // Focus barcode input on mount
    useEffect(() => {
        barcodeInputRef.current?.focus();
    }, []);

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const lookupProduct = async (codeOverride?: string) => {
        const codeToSearch = codeOverride || barcode;
        if (!codeToSearch?.trim()) return;
        setError('');

        try {
            const response = await api.post('/admin/sales/lookup', { barcode: codeToSearch.trim() });
            const product: Product = response.data;

            // Check if product already in cart
            const existingIndex = cart.findIndex(item => item.product.id === product.id);

            if (existingIndex >= 0) {
                // Increment quantity
                const newCart = [...cart];
                if (newCart[existingIndex].quantity < product.stock) {
                    newCart[existingIndex].quantity += 1;
                    setCart(newCart);
                } else {
                    setError(`Stock máximo alcanzado para ${product.name}`);
                }
            } else {
                // Add new item
                setCart([...cart, { product, quantity: 1 }]);
            }

            setBarcode('');
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setError(error.response?.data?.message || 'Producto no encontrado');
            setBarcode('');
        }
    };

    const handleBarcodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            lookupProduct();
        }
    };

    const updateQuantity = (index: number, delta: number) => {
        const newCart = [...cart];
        const item = newCart[index];
        const newQty = item.quantity + delta;

        if (newQty <= 0) {
            newCart.splice(index, 1);
        } else if (newQty <= item.product.stock) {
            item.quantity = newQty;
        }

        setCart(newCart);
    };

    const removeItem = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const processSale = async () => {
        if (cart.length === 0) {
            setError('El carrito está vacío');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/admin/sales', {
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                })),
                payment_method: paymentMethod,
            });

            setSuccess('¡Venta registrada exitosamente!');
            setCart([]);
            setPaymentMethod('cash');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);

            // Focus back to barcode input
            barcodeInputRef.current?.focus();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setError(error.response?.data?.message || 'Error al procesar la venta');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout
            title="Punto de Venta"
            subtitle="Registrar ventas"
            titleWrapperClassName="translate-x-6 md:translate-x-12"
        >
            <div className="flex flex-col items-center w-full">
                <div className="h-6 md:h-8"></div>
                <div className="w-[90%] md:w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-12 mx-auto">
                    {/* Left: Barcode Scanner & Cart */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Barcode Input */}
                        <div className="bg-white rounded-md md:rounded-lg border-4 border-graphite shadow-xl" style={{padding: '32px'}}>
                            <label className="block text-lg font-black text-graphite mb-4 uppercase tracking-wide">
                                Escanear Código de Barras
                            </label>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    ref={barcodeInputRef}
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    onKeyDown={handleBarcodeKeyDown}
                                    className="flex-1 px-4 py-4 md:px-6 md:py-6 bg-white border-4 border-graphite rounded-2xl text-graphite text-xl md:text-3xl placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-lime focus:shadow-md transition-all font-mono font-bold"
                                    placeholder="Escanea o ingresa el código..."
                                    autoFocus
                                />
                                <div className="flex gap-2 md:gap-4">
                                    <button
                                        onClick={() => lookupProduct()}
                                        className="flex-1 md:flex-none px-6 py-4 md:px-10 md:py-6 bg-lime hover:bg-lime/80 text-graphite font-black uppercase tracking-widest rounded-2xl border-4 border-graphite shadow-md hover:translate-y-[-2px] hover:shadow-lg transition-all text-lg md:text-xl"
                                    >
                                        Agregar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setScanError('');
                                            setIsScanning(true);
                                        }}
                                        className="px-6 py-4 md:px-6 md:py-6 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl border-4 border-graphite shadow-md hover:translate-y-[-2px] hover:shadow-lg transition-all"
                                        title="Usar Cámara"
                                    >
                                        📷
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Camera Modal */}
                        {isScanning && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                                <div className="bg-white rounded-3xl p-6 w-full max-w-lg relative">
                                    <button
                                        onClick={() => {
                                            setScanError('');
                                            setIsScanning(false);
                                        }}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-red-pink"
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <h3 className="text-2xl font-black text-graphite mb-4 text-center">Escaneando...</h3>
                                    {scanError && (
                                        <div className="mb-4 bg-red-pink/10 border-2 border-red-pink text-red-pink px-4 py-3 rounded-xl font-bold text-sm">
                                            {scanError}
                                        </div>
                                    )}
                                    <div className="rounded-2xl overflow-hidden border-4 border-graphite bg-black aspect-video relative">
                                        <video ref={ref} className="w-full h-full object-cover" autoPlay muted playsInline />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-64 h-32 border-4 border-red-pink/50 rounded-xl"></div>
                                        </div>
                                    </div>
                                    <p className="text-center mt-4 text-gray-500 font-bold">Apunta el código a la cámara</p>
                                </div>
                            </div>
                        )}

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="bg-red-pink/10 border-4 border-red-pink text-red-pink px-6 py-4 rounded-2xl font-black text-xl flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-lime/20 border-4 border-lime text-graphite px-6 py-4 rounded-2xl font-black text-xl flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {success}
                            </div>
                        )}

                        {/* Cart Items */}
                        <div className="bg-white rounded-md md:rounded-lg border-4 border-graphite shadow-xl" style={{padding: '32px'}}>
                            <div className="p-9 md:p-10 border-b-8 border-black bg-graphite">
                                <h2 className="text-3xl font-black text-white uppercase tracking-wider">Carrito ({cart.length} productos)</h2>
                            </div>

                            {cart.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-dashed border-gray-300">
                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-bold text-2xl">Escanea un producto para comenzar</p>
                                </div>
                            ) : (
                                <div className="divide-y-4 divide-gray-100">
                                    {cart.map((item, index) => (
                                        <div key={item.product.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:bg-lime/10 transition-colors">
                                            <div className="flex-1">
                                                <h3 className="text-graphite font-black text-xl md:text-2xl mb-1">{item.product.name}</h3>
                                                <p className="text-gray-500 text-base md:text-lg font-mono font-bold">{item.product.barcode}</p>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(index, -1)}
                                                        className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-gray-100 text-graphite rounded-xl flex items-center justify-center transition border-4 border-gray-200 hover:border-graphite font-black text-xl md:text-2xl"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-12 md:w-16 text-center text-graphite font-black text-2xl md:text-3xl">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(index, 1)}
                                                        className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-gray-100 text-graphite rounded-xl flex items-center justify-center transition border-4 border-gray-200 hover:border-graphite font-black text-xl md:text-2xl"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="w-auto md:w-32 text-right">
                                                    <p className="text-teal font-black text-2xl md:text-3xl">{formatCurrency(item.product.price * item.quantity)}</p>
                                                    <p className="text-gray-400 text-xs md:text-sm font-bold">{formatCurrency(item.product.price)} c/u</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="text-gray-300 hover:text-red-pink p-2 md:p-3 transition-colors border-2 border-transparent hover:border-red-pink rounded-xl"
                                                >
                                                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Payment Panel */}
                    <div className="space-y-6">
                        {/* Total */}
                        <div className="bg-graphite text-white rounded-md md:rounded-lg border-4 border-black shadow-xl relative overflow-hidden" style={{padding: '32px'}}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-32 h-32 text-pink-hot" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-pink-hot text-sm font-black uppercase tracking-widest mb-2 relative z-10">Total a Pagar</p>
                            <p className="text-5xl font-black relative z-10">{formatCurrency(total)}</p>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-md md:rounded-lg border-4 border-graphite shadow-xl" style={{padding: '32px'}}>
                            <p className="text-graphite text-sm font-black uppercase tracking-wide mb-4">Método de Pago</p>
                            <div className="space-y-3">
                                {[
                                    { value: 'cash', label: 'Efectivo', icon: '💵' },
                                    { value: 'card', label: 'Tarjeta', icon: '💳' },
                                    { value: 'transfer', label: 'Transferencia', icon: '📱' },
                                ].map(method => (
                                    <button
                                        key={method.value}
                                        onClick={() => setPaymentMethod(method.value)}
                                        className={`w-full px-4 py-3 rounded-xl text-left transition-all border-2 flex items-center gap-3 font-bold ${paymentMethod === method.value
                                            ? 'bg-teal text-white border-graphite shadow-[4px_4px_0px_0px_#333] translate-x-[-2px] translate-y-[-2px]'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-teal hover:text-teal'
                                            }`}
                                    >
                                        <span className="text-xl">{method.icon}</span>
                                        <span className="font-bold uppercase tracking-wide">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Complete Sale Button */}
                        <button
                            onClick={processSale}
                            disabled={isLoading || cart.length === 0}
                            className="w-full py-5 px-6 bg-pink-hot hover:bg-pink-600 text-white text-xl font-black uppercase tracking-widest rounded-3xl border-4 border-graphite shadow-[8px_8px_0px_0px_#333] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? 'Procesando...' : 'Cobrar'}
                        </button>

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCart([])}
                                className="flex-1 py-3 px-4 bg-white hover:bg-red-50 text-red-pink font-bold border-2 border-red-pink rounded-xl transition-colors uppercase tracking-wide text-sm"
                            >
                                Vaciar
                            </button>
                            <Link
                                to="/admin/sales-registry"
                                className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 text-gray-500 font-bold border-2 border-gray-300 rounded-xl transition-colors text-center uppercase tracking-wide text-sm"
                            >
                                Historial
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="h-12 md:h-16"></div>
            </div>
        </AdminLayout>
    );
}
