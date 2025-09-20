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
        <div className="bg-gray-50 min-h-screen flex items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full">
                {/* Heading e Subtitle */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Equipamentos de{" "}
                        <span className="text-primary">qualidade</span>{" "}
                        para Profissionais e Empresas
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                        Produtos selecionados, consultoria especializada e o melhor custo-benefício para você.
                    </p>
                </div>

                {/* Call-to-Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/80 text-white px-8 py-4 text-lg font-semibold rounded-lg"
                        onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Ver Produtos
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="border-gray-300 text-gray-700 hover:bg-primary hover:text-white px-8 py-4 text-lg font-semibold rounded-lg"
                        onClick={handleWhatsAppClick}
                    >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Solicitar Orçamento
                    </Button>
                </div>

                {/* Feature Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <Zap className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Atendimento rápido
                        </h3>
                        <p className="text-gray-600">
                            Orçamentos ágeis e suporte imediato via WhatsApp ou telefone
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Compra Segura
                        </h3>
                        <p className="text-gray-600">
                            Negociação transparente e garantia de qualidade em todos os produtos
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Especialistas à sua disposição
                        </h3>
                        <p className="text-gray-600">
                            Equipe técnica pronta para indicar a melhor solução para sua necessidade
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
