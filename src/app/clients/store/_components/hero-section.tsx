import { ArrowRight, MessageCircle, Shield, Users, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HeroSectionProps {
    phoneNumber: string;
}

export function HeroSection({ phoneNumber }: HeroSectionProps) {
    const handleWhatsAppClick = () => {
        const message = `Olá! Vim pelo seu site e gostaria de solicitar um orçamento!.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };


    return (
        <div className="bg-gray-50 min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-16">
            <div className="max-w-7xl mx-auto w-full">
                {/* Heading e Subtitle */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                        Equipamentos de{" "}
                        <span className="text-primary">qualidade</span>{" "}
                        para Profissionais e Empresas
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                        Produtos selecionados, consultoria especializada e o melhor custo-benefício para você.
                    </p>
                </div>

                {/* Call-to-Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
                    <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/80 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg w-full sm:w-auto"
                        onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Ver Produtos
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="border-gray-300 text-gray-700 hover:bg-primary hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg w-full sm:w-auto"
                        onClick={handleWhatsAppClick}
                    >
                        <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Solicitar Orçamento
                    </Button>
                </div>

                {/* Feature Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            Atendimento rápido
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600">
                            Orçamentos ágeis e suporte imediato via WhatsApp ou telefone
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            Compra Segura
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600">
                            Negociação transparente e garantia de qualidade em todos os produtos
                        </p>
                    </div>

                    <div className="text-center sm:col-span-2 lg:col-span-1">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            Especialistas à sua disposição
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600">
                            Equipe técnica pronta para indicar a melhor solução para sua necessidade
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
