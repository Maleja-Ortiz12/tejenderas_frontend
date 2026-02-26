import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Legal() {
    return (
        <div className="min-h-screen bg-white text-graphite font-sans">
            <Navbar onOpenCart={() => { }} />

            <main className="max-w-4xl mx-auto px-6 py-12 md:py-32">
                <header className="mb-12 md:mb-16 text-center">
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                        Avisos <span className="text-pink-hot">Legales</span>
                    </h1>
                    <p className="text-gray-500 font-bold text-base md:text-lg max-w-2xl mx-auto">
                        En Entre Lanas y Fragancias, valoramos la transparencia y la confianza. Aquí detallamos nuestras políticas de servicio y protección de datos.
                    </p>
                </header>

                <div className="space-y-12 md:space-y-20">
                    <section id="terminos" className="relative">
                        <div className="hidden md:block absolute -left-10 top-0 w-2 h-full bg-pink-hot/20 rounded-full"></div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 md:mb-8 flex items-center gap-4">
                            <span className="w-10 h-10 md:w-12 md:h-12 bg-graphite text-white rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg shadow-[3px_3px_0px_0px_#FF4D8D] md:shadow-[4px_4px_0px_0px_#FF4D8D]">01</span>
                            Términos y Condiciones
                        </h2>

                        <div className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-700 leading-relaxed font-medium">
                            <p>
                                Al acceder y utilizar este sitio web, usted acepta cumplir con los siguientes términos y condiciones de uso:
                            </p>
                            <ul className="list-disc pl-6 space-y-4">
                                <li><strong className="text-graphite">Compras y Pagos:</strong> Todos los precios están expresados en pesos colombianos e incluyen los impuestos de ley correspondientes. Las transacciones se realizan a través de pasarelas de pago seguras.</li>
                                <li><strong className="text-graphite">Envíos:</strong> Realizamos envíos a nivel nacional. Los tiempos de entrega pueden variar según la ubicación y la disponibilidad del stock, siendo usualmente entre 3 a 7 días hábiles.</li>
                                <li><strong className="text-graphite">Devoluciones:</strong> Debido a la naturaleza de nuestros productos (textiles y fragancias), las devoluciones solo aplican por defectos de fábrica o errores en el pedido, dentro de los primeros 5 días hábiles tras recibir el producto.</li>
                                <li><strong className="text-graphite">Propiedad Intelectual:</strong> Todo el contenido de este sitio (logos, imágenes, textos) es propiedad exclusiva de Entre Lanas y Fragancias.</li>
                            </ul>
                        </div>
                    </section>

                    <section id="datos" className="relative">
                        <div className="hidden md:block absolute -left-10 top-0 w-2 h-full bg-teal/20 rounded-full"></div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 md:mb-8 flex items-center gap-4">
                            <span className="w-10 h-10 md:w-12 md:h-12 bg-graphite text-white rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg shadow-[3px_3px_0px_0px_#2DD4BF] md:shadow-[4px_4px_0px_0px_#2DD4BF]">02</span>
                            Política de Tratamiento de Datos
                        </h2>

                        <div className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-700 leading-relaxed font-medium">
                            <p>
                                En cumplimiento de la Ley 1581 de 2012 (Habeas Data), Entre Lanas y Fragancias informa que los datos personales recolectados a través de nuestro sitio web son utilizados exclusivamente para:
                            </p>
                            <ul className="list-disc pl-6 space-y-3 md:space-y-4">
                                <li>Procesar y gestionar sus pedidos de compra.</li>
                                <li>Brindar soporte al cliente y responder consultas.</li>
                                <li>Enviar comunicaciones sobre promociones y novedades (solo si usted lo autoriza).</li>
                                <li>Mejorar nuestra experiencia de usuario y seguridad del sitio.</li>
                            </ul>
                            <p className="bg-gray-50 p-6 md:p-8 rounded-[2rem] md:rounded-3xl border-2 border-dashed border-gray-200 italic text-sm md:text-base">
                                Sus datos nunca serán vendidos ni compartidos con terceros sin su consentimiento expreso, excepto cuando sea requerido por la ley para la gestión de pagos o logística de envío. Para ejercer sus derechos de conocer, actualizar o rectificar sus datos, puede contactarnos a través de nuestros canales oficiales.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-24 pt-12 border-t-4 border-graphite text-center">
                    <Link
                        to="/"
                        className="inline-block px-12 py-5 bg-pink-hot text-white font-black uppercase tracking-widest rounded-3xl border-4 border-graphite shadow-[8px_8px_0px_0px_#333] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
